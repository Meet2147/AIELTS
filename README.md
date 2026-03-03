# Coachly Demo (IELTS + TOEFL + GRE)

Fast MVP for demo week:
- Local email/password auth (SQLite)
- Forgot password + reset password flow (token-based)
- Exam selector dashboard
- IELTS Writing, Listening, Speaking
- TOEFL Writing
- Perplexity Sonar scoring (writing + speaking)
- Attempts saved locally (SQLite)
- Pricing + payment flow pages with subscriptions:
  - $29 Monthly
  - $99 Yearly
  - $299 Lifetime

## 1. Install and run

```bash
npm install
npm run dev
```

## 2. Environment

Copy `.env.example` to `.env.local` and set:

- `PERPLEXITY_API_KEY`
- `APP_BASE_URL` (optional, useful for reset-link generation in production)

## 3. Data storage

SQLite file is auto-created at:

- `data/app.db`

No manual DB migration needed for this demo build.

## 4. Demo flow

1. Sign up/login
2. Open dashboard
3. Open IELTS Practice Suite
4. Test Writing, Listening, and Speaking modules
5. Open Pricing page and proceed to Checkout page
6. Check Recent Attempts on dashboard

## 5. Password reset flow

1. Open `/forgot-password`
2. Submit your account email
3. In non-production, a reset link is returned on the page for quick testing
4. Open link and set a new password on `/reset-password`

## 6. Streaming notes

- IELTS Speaking uses browser `getUserMedia` for live camera/microphone stream.
- Recording uses `MediaRecorder` (WebM preview in-browser).
- IELTS Listening uses browser speech synthesis to stream the passage audio.
