# InstaClone — Full-Stack Instagram Clone

A full-featured Instagram clone built with **Next.js 16** (frontend) and **Django REST Framework** (backend), featuring posts, reels, comments, likes, replies, real-time messaging, and user suggestions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React, Vanilla CSS |
| Backend | Django REST Framework, JWT Auth |
| Database | Neon PostgreSQL |
| Storage | Supabase S3 |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Features

- ✅ JWT Authentication (register, login, auto token refresh)
- ✅ Posts with image attachments
- ✅ Reels with video uploads
- ✅ Like / Unlike posts
- ✅ Comments and nested replies
- ✅ Follow / Unfollow users
- ✅ "Suggestions for you" sidebar
- ✅ Full messaging / DM system
- ✅ Profile pages

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- A running instance of the Django backend

### 1. Clone the repo

```bash
git clone https://github.com/adarsh-pathak-2006/Instagram_clone_frontend.git
cd Instagram_clone_frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Open `.env.local` and set:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000   # or your Render backend URL
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploying to Vercel

1. Push the repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import this repo.
3. In **Project Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com` |

4. Click **Deploy**. Done!

> **Note:** Make sure your Django backend has your Vercel domain in its `CORS_ALLOWED_ORIGINS` setting before deploying.

---

## Project Structure

```
src/
├── app/
│   ├── page.js          # Feed / Home
│   ├── login/           # Login page
│   ├── register/        # Register page
│   ├── create/          # Upload post or reel
│   ├── messages/        # DM inbox + conversation
│   └── profile/         # User profile page
├── components/
│   ├── Navbar.js
│   ├── PostCard.js      # Post with likes, comments, replies
│   └── SuggestionSidebar.js
└── utils/
    └── api.js           # All API calls with JWT + auto-refresh
```

---

## Backend Repository

👉 [Instagram_clone_backend](https://github.com/adarsh-pathak-2006/Instagram_clone_backend)
