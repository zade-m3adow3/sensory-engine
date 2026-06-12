# Privacy Policy

**Effective Date:** [DATE]
**Last Updated:** [DATE]
**Data Controller:** [YOUR FULL NAME] ("I", "me")
**Contact:** [YOUR EMAIL]

---

## Who This Applies To

This website is a private, invite-only platform. Only people personally
invited by me can create an account. This policy explains what information
is collected, why, and how it is protected.

---

## Information I Collect

### Information You Provide
- **Nickname** — the name you choose to go by on this site
- **Gmail address** — used for authentication and birthday emails only
- **Password** — stored as a secure hash via Supabase Auth; I never see it
- **Relationship type** — how you know me (parent, friend, etc.)
- **Birthdate** — used only to trigger birthday emails and animations
- **Profile photo** — optional; stored securely in private cloud storage
- **Questionnaire responses** — your answers to onboarding questions;
  used to personalise your experience and the AI's responses to you
- **Messages and notes** — anything you write on the site
- **Inside jokes and memories** — content you add to your profile

### Information Collected Automatically
- **Error logs** — via Sentry, if something breaks technically
- **Basic usage data** — how pages load (performance monitoring only)
- No cookies for advertising. No tracking pixels. No analytics beyond
  what is needed for the site to function.

---

## How I Use Your Information

| Data | Purpose |
|---|---|
| Gmail + password | Authentication (sign in / sign up) |
| Nickname + relationship type | Personalising your experience |
| Birthdate | Birthday emails + in-site birthday animations |
| Profile photo | Displayed on the 3D tree and your profile |
| Questionnaire responses | AI personalisation + tree placement |
| Messages / memories / jokes | Displayed on your profile |
| Error logs | Fixing bugs silently |

**I do not sell, rent, share, or monetise any of your data. Ever.**

---

## AI & Your Data

This site uses **Google AI Studio (Gemini)** to power a personalised chat
experience. Here is exactly what the AI receives:

- Your relationship type
- A selection of your questionnaire answers (the most relevant ones per
  conversation, retrieved via a RAG pipeline — not your full history)
- Any messages or memories you've added to your profile
- The current date (for context)

The AI does **not** receive your email address, password, or raw photos.
Each user's AI context is strictly isolated — your data never appears in
another user's conversation.

Google AI Studio processes queries per their own
[privacy policy](https://policies.google.com/privacy).

---

## Data Storage & Security

- All data is stored in **Supabase** (Postgres database + file storage)
  hosted on secure cloud infrastructure
- Row-Level Security (RLS) is enforced: you can only access your own data
- Profile photos are stored in a **private** storage bucket — only
  accessible to you and me
- Rate limiting via **Upstash Redis** protects against abuse
- HTTPS is enforced on all connections via Vercel
- I am the only person with superadmin access

---

## Data Retention

Your data is retained for as long as your account exists. You may request
deletion of your account and all associated data by contacting me directly
at [YOUR EMAIL]. I will action this within 7 days.

---

## Your Rights

You have the right to:
- **Access** — request a copy of your data
- **Correction** — ask me to correct inaccurate data
- **Deletion** — request your account and all data be deleted
- **Objection** — ask me to stop processing your data

To exercise any of these, contact me at [YOUR EMAIL].

---

## Children

This website is not intended for anyone under the age of 13.
If you are under 13, please do not create an account.

---

## Changes to This Policy

If I make significant changes to how I handle your data, I will notify
you via the email address on your account before the changes take effect.

---

*This is a personal project, not a commercial product. I take your
privacy seriously because you are someone I care about personally.*
