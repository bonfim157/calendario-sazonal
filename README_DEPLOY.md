EduCalendário — Deploy Guide

This project is a Next.js app prepared with a simulated lowdb database for demo purposes.

Local development
1. Install dependencies: npm install
2. Start dev server: npm run dev
3. Seed demo data: POST /api/seed (call in browser or use curl)

Notes about the simulated DB (lowdb)
- The JSON database (data/db.json) is stored in the project directory and is suitable for local development.
- In serverless deployments (Vercel), the filesystem is ephemeral; writes to data/db.json will not persist across function invocations or deployments. Use a managed DB (MongoDB Atlas, Supabase, Firestore) for production.

Prepare for Vercel deployment
1. Push this repository to GitHub.
2. Create a new project on Vercel, import the repo, and set build command (default: next build).
3. Set environment variables if switching to a real DB (e.g., MONGODB_URI, JWT_SECRET).
4. Deploy. The app will be publicly available; seed route can be used once to populate demo data.

Recommended next steps
- Replace lowdb with MongoDB Atlas in lib/db.ts and update API to use Mongoose.
- Add NextAuth or JWT refresh flow for production authentication.
- Integrate a realtime layer for chat (Pusher, Supabase Realtime, or WebSocket server).

Limitations
- Lowdb is only for development/demo. Do not use it in production.

