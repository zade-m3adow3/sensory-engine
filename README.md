# 🌳 Rounak's Personal Universe

A deeply personal, interactive website built for the people I care about.
Each person who receives a link gets their own personalised experience —
a profile on a living 3D relationship tree, an AI that knows our history,
and a space to leave messages, memories, and inside jokes.

---

## ✨ What It Does

- **3D Relationship Tree** — a scroll-driven living tree where every person
  in my life has a node: roots for family, branches for friends, fruits for
  the ones closest to my heart.
- **Personalised Onboarding** — when you sign up, the site asks you questions
  specific to how we know each other. Your answers shape your experience.
- **Profile Pages** — your own corner of the site. Leave messages, share
  memories, add inside jokes. On your birthday, the whole thing comes alive.
- **Relationship-Aware AI** — an AI that knows who you are to me, what we've
  been through, and talks to you accordingly.
- **Birthday System** — on your birthday you'll get an email and the site
  greets you with confetti, ribbons, and a song.

---

## 🛠️ Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| 3D | Three.js · React Three Fiber · Drei |
| Backend / Auth / DB | Supabase (Postgres + pgvector + Storage) |
| AI | Google AI Studio (Gemini) via RAG pipeline |
| Rate Limiting | Upstash Redis |
| Error Monitoring | Sentry |
| Deployment | Vercel |
| 3D Asset Authoring | Blender 4.x |

---

## 🚀 Running Locally

> This is a private project. Access is invite-only.
> If you've received a link, just visit it — no setup needed.

For development (my own use):

```bash
git clone https://github.com/[your-username]/[repo-name].git
cd [repo-name]
cp .env.example .env.local
# Fill in all env variables
npm install
npm run dev
```

---

## 📁 Project Structure

See `personalized_website_build_guide.md` for the full folder breakdown.

---

## 🔐 Privacy

This site collects personal information (nickname, birthdate, photos, messages)
only from people I personally invite. No data is sold, shared, or used for
advertising. See [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) for full details.

---

## 📄 License

This project is personal and proprietary. See [LICENSE](./LICENSE).

---

*Built with love, Three.js, and way too many late nights.* 🌙
