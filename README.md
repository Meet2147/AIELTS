# ExamPrep AI Demo (IELTS + TOEFL + GRE)

Fast MVP for demo week:
- Local email/password auth (SQLite)
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

## 5. Streaming notes

- IELTS Speaking uses browser `getUserMedia` for live camera/microphone stream.
- Recording uses `MediaRecorder` (WebM preview in-browser).
- IELTS Listening uses browser speech synthesis to stream the passage audio.
