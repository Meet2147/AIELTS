import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";

const SESSION_COOKIE = "ep_session";
const SESSION_DAYS = 14;
const RESET_TOKEN_MINUTES = 30;

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
};

export type AuthUser = {
  id: string;
  email: string;
};

function nowIso() {
  return new Date().toISOString();
}

function sessionExpiryIso() {
  return new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

function resetExpiryIso() {
  return new Date(Date.now() + RESET_TOKEN_MINUTES * 60 * 1000).toISOString();
}

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, hashedPassword: string) {
  const [salt, hash] = hashedPassword.split(":");
  if (!salt || !hash) return false;

  const derived = scryptSync(password, salt, 64);
  const stored = Buffer.from(hash, "hex");

  if (derived.length !== stored.length) return false;
  return timingSafeEqual(derived, stored);
}

export function createUser(email: string, password: string) {
  const db = getDb();
  const id = randomUUID();
  const passwordHash = hashPassword(password);

  db.prepare(
    "insert into users (id, email, password_hash, created_at) values (?, ?, ?, ?)"
  ).run(id, email.toLowerCase(), passwordHash, nowIso());

  return { id, email: email.toLowerCase() } as AuthUser;
}

export function findUserByEmail(email: string) {
  const db = getDb();
  const row = db
    .prepare("select id, email, password_hash from users where email = ?")
    .get(email.toLowerCase()) as UserRow | undefined;

  return row;
}

export function createSession(userId: string) {
  const db = getDb();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = sessionExpiryIso();

  db.prepare("insert into sessions (token, user_id, expires_at, created_at) values (?, ?, ?, ?)").run(
    token,
    userId,
    expiresAt,
    nowIso()
  );

  return { token, expiresAt };
}

export async function setSessionCookie(token: string, expiresAt: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt)
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0)
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = getDb();
  const row = db
    .prepare(
      `select users.id, users.email, sessions.expires_at
       from sessions
       join users on users.id = sessions.user_id
       where sessions.token = ?`
    )
    .get(token) as { id: string; email: string; expires_at: string } | undefined;

  if (!row) return null;

  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare("delete from sessions where token = ?").run(token);
    return null;
  }

  return { id: row.id, email: row.email } as AuthUser;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function logoutCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    const db = getDb();
    db.prepare("delete from sessions where token = ?").run(token);
  }

  await clearSessionCookie();
}

export function createPasswordResetToken(email: string, baseUrl: string) {
  const user = findUserByEmail(email);
  if (!user) return null;

  const db = getDb();
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashResetToken(token);
  const expiresAt = resetExpiryIso();

  db.prepare("delete from password_resets where user_id = ?").run(user.id);
  db.prepare(
    "insert into password_resets (token_hash, user_id, expires_at, used_at, created_at) values (?, ?, ?, null, ?)"
  ).run(tokenHash, user.id, expiresAt, nowIso());

  return `${baseUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
}

export function resetPasswordWithToken(token: string, newPassword: string) {
  const db = getDb();
  const tokenHash = hashResetToken(token);

  const resetRow = db
    .prepare(
      "select token_hash, user_id, expires_at, used_at from password_resets where token_hash = ?"
    )
    .get(tokenHash) as
    | { token_hash: string; user_id: string; expires_at: string; used_at: string | null }
    | undefined;

  if (!resetRow) {
    return { success: false, error: "Invalid reset token." } as const;
  }

  if (resetRow.used_at) {
    return { success: false, error: "Reset token already used." } as const;
  }

  if (new Date(resetRow.expires_at).getTime() < Date.now()) {
    db.prepare("delete from password_resets where token_hash = ?").run(tokenHash);
    return { success: false, error: "Reset token expired. Request a new one." } as const;
  }

  const passwordHash = hashPassword(newPassword);

  const tx = db.transaction(() => {
    db.prepare("update users set password_hash = ? where id = ?").run(passwordHash, resetRow.user_id);
    db.prepare("update password_resets set used_at = ? where token_hash = ?").run(nowIso(), tokenHash);
    db.prepare("delete from sessions where user_id = ?").run(resetRow.user_id);
  });

  tx();

  return { success: true } as const;
}
