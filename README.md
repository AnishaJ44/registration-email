# Sunrise Flow Yoga — Booking Page

A small website where visitors enter their **name, email, and phone number** to
reserve a spot in a yoga session, and automatically receive a **booking
confirmation email**.

## What's included

- `public/index.html`, `style.css`, `script.js` — the booking page (form +
  client-side validation)
- `server.js` — Express backend that validates the submission and sends the
  confirmation email using **Nodemailer**
- `.env.example` — where you configure your email provider and event details

## Deploying on Render

1. **Push this folder to a GitHub repo.** Render deploys from a git repo, so
   create a new repo (public or private) and push these files to it. `.env`
   is git-ignored on purpose — you'll set those values directly in Render
   instead (step 3), never commit real credentials.

2. **Create a new Web Service in Render:**
   - Go to [dashboard.render.com](https://dashboard.render.com) → **New** →
     **Web Service**, and connect the repo you just pushed.
   - Render should auto-detect Node. If it asks:
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
   - (A `render.yaml` blueprint is included in this repo — if you use
     **New → Blueprint** instead of **Web Service**, Render will read it and
     pre-fill these settings for you.)

3. **Add environment variables** in the service's **Environment** tab (these
   are the same values from `.env.example`, just entered in Render's UI
   instead of a local file):
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
   - `FROM_EMAIL`
   - `EVENT_NAME`, `EVENT_DATE`, `EVENT_TIME`, `EVENT_LOCATION`

   **Using Gmail?** Create an
   [App Password](https://myaccount.google.com/apppasswords) (requires
   2-Step Verification) and use that as `SMTP_PASS` — your normal password
   won't work.

   Note: Render sets its own `PORT` automatically — you don't need to add
   that one yourself, the server already reads `process.env.PORT`.

4. **Deploy.** Render will build and start the service, then give you a
   public URL like `https://yoga-booking.onrender.com`. Open it, fill out the
   form, and submit — the email you entered should receive a booking
   confirmation.

   Note: on Render's free plan, the service spins down after inactivity and
   takes ~30–60 seconds to wake up on the next request — the first booking
   after a quiet period may feel slow to respond, but it will still work.

## Running locally instead

If you ever want to test on your own machine before pushing changes:

```bash
npm install
cp .env.example .env   # fill in your real SMTP values
npm start
```

Then open **http://localhost:3000**.

## How it works

- The form does basic validation in the browser (non-empty name, valid email
  format, valid phone number) before it ever hits the server.
- The server re-validates everything (never trust the client alone), then
  uses Nodemailer to send a confirmation email — both a plain-text and a
  styled HTML version — containing the event name, date, time, and location.
- The booking is logged to the server console. This demo doesn't include a
  database — if you want to store bookings permanently (e.g. to prevent
  double-booking, cap capacity, or list attendees), swap the `console.log`
  line in `server.js` for a real database call (Postgres, SQLite, Airtable,
  Google Sheets, etc.), and I'm happy to help wire that up.

## Customizing the event

All the event details (name, date, time, location) live in `.env` — change
those and every confirmation email updates automatically, no code changes
needed. If you run recurring sessions, you could extend the form with a
"session date" dropdown and pass the chosen date through to the email.
