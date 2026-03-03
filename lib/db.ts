import Database from "better-sqlite3";
import path from "node:path";

const dbPath = path.join(process.cwd(), "data", "app.db");

type DatabaseInstance = Database.Database;

declare global {
  var __db__: DatabaseInstance | undefined;
}

function migrate(db: DatabaseInstance) {
  db.exec(`
    create table if not exists users (
      id text primary key,
      email text not null unique,
      password_hash text not null,
      created_at text not null default (datetime('now'))
    );

    create table if not exists sessions (
      token text primary key,
      user_id text not null,
      expires_at text not null,
      created_at text not null default (datetime('now')),
      foreign key(user_id) references users(id) on delete cascade
    );

    create index if not exists idx_sessions_user_id on sessions(user_id);
    create index if not exists idx_sessions_expires_at on sessions(expires_at);

    create table if not exists exam_attempts (
      id text primary key,
      user_id text not null,
      exam text not null,
      section text not null,
      prompt text not null,
      answer text not null,
      ai_score real,
      feedback_json text,
      created_at text not null default (datetime('now')),
      foreign key(user_id) references users(id) on delete cascade
    );

    create index if not exists idx_attempts_user_created on exam_attempts(user_id, created_at desc);

    create table if not exists password_resets (
      token_hash text primary key,
      user_id text not null,
      expires_at text not null,
      used_at text,
      created_at text not null default (datetime('now')),
      foreign key(user_id) references users(id) on delete cascade
    );

    create index if not exists idx_password_resets_user on password_resets(user_id);
    create index if not exists idx_password_resets_expires on password_resets(expires_at);
  `);
}

export function getDb() {
  if (!global.__db__) {
    const db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    migrate(db);
    global.__db__ = db;
  }

  return global.__db__;
}
