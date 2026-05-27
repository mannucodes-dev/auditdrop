# AuditDrop 🚀

> Turn any business URL into a branded website audit report — share it on WhatsApp and convert cold leads into paying clients.

AuditDrop lets freelancers and agencies generate professional website audit reports in 30 seconds. Paste a URL, get a shareable link with real Google PageSpeed scores, mobile/desktop performance, and 6 custom checks — all in plain language your prospects understand.

## Features

- ⚡ **Google PageSpeed Insights** — Real mobile & desktop performance scores
- 📱 **Mobile-first reports** — Designed to look great on phones
- 👁️ **View tracking** — Know when a prospect opens your report
- 💬 **WhatsApp CTA** — Every report ends with your branded call-to-action
- 📄 **PDF export** — Download reports as professional PDFs
- 🔒 **Firebase auth** — Secure Google sign-in

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Auth & DB**: Firebase (Auth + Firestore)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **APIs**: Google PageSpeed Insights, ScreenshotOne

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/mannucodes-dev/auditdrop.git
cd auditdrop
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your values in `.env.local` — see [`.env.example`](.env.example) for all required variables.

### 3. Firebase setup

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** → Google sign-in
3. Enable **Firestore Database**
4. Deploy Firestore rules: `npx firebase-tools deploy --only firestore:rules`
5. Generate a **Service Account** key (Project Settings → Service Accounts) and add to `.env.local`

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | Firebase client API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ | Firebase app ID |
| `FIREBASE_ADMIN_PROJECT_ID` | ✅ | Firebase Admin project ID |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | ✅ | Firebase Admin service account email |
| `FIREBASE_ADMIN_PRIVATE_KEY` | ✅ | Firebase Admin private key |
| `SCREENSHOTONE_API_KEY` | ⬜ | ScreenshotOne API key (optional) |
| `PSI_API_KEY` | ⬜ | Google PSI API key (optional, needed >25k req/day) |

## Deployment

Deploy to [Vercel](https://vercel.com) — add all environment variables in the Vercel dashboard under Project Settings → Environment Variables.

## License

MIT
