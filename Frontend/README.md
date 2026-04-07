# Plainspeak Now (Frontend)

Turn confusing documents into clear, simple language.

---

## 🚀 What This Is

Frontend for **Plainspeak Now**, a web app that:

* Simplifies complex documents into plain language
* Translates into multiple languages
* Provides optional audio playback
* Uses a prepaid Key system (no subscriptions)

---

## 🌍 Supported Languages

* English
* Spanish
* Vietnamese
* Tagalog

---

## 🧠 Core Features

* Upload / paste / photo input
* Structured output:

  * Document Type
  * Summary
  * Key Points
  * What Matters Most
* Audio playback (limited per document)
* Firebase authentication
* Key-based usage system

---

## 🛠️ Local Development

```bash
cd Frontend
npm install
npm run dev
```

---

## ⚙️ Environment Variables

Create a `.env` file:

```env
VITE_API_URL=https://your-cloud-run-url
```

---

## 🔗 Backend

This frontend connects to a Cloud Run backend:

```
/api/simplify
/api/generate-audio
/api/key-balance
```

---

## 🔐 Authentication

Uses Firebase Auth.

User must be signed in before processing documents.

---

## 🔑 Key System

* 1 Key per document
* 2 Keys for large documents
* Keys deducted **only after successful processing**
* No subscriptions
* Keys never expire

---

## ⚠️ Important Notes

* This app explains documents — it does NOT provide legal or medical advice
* Always verify critical information from original sources

---

## 🚀 Deployment

Hosted on Vercel.

Environment variable must match backend:

```
VITE_API_URL → Cloud Run URL
```

---

## 🧪 Health Check

Backend should respond:

```
/api/health → { ok: true }
```

---

## 🎯 Goal

Make complex information accessible for families, caregivers, and everyday users — especially those navigating education, legal, or medical systems.

