# Plainspeak Now

Turn confusing documents into clear, simple language.

---

## 🚀 How to Run Locally

### Backend

```bash
cd Backend
npm install
npm run dev
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

---

## 🌐 Environment Variables

### Frontend (.env)

```
VITE_API_URL=https://your-cloud-run-url
```

### Backend (.env or Cloud Run)

```
OPENAI_API_KEY=your_key
FIREBASE_SERVICE_ACCOUNT=JSON string
STRIPE_SECRET_KEY=your_key
```

---

## ⚙️ Deployment Flow

GitHub → Cloud Build → Cloud Run

⚠️ Do NOT manually deploy Cloud Run
⚠️ Always push to main branch

---

## 🔑 Key System Rules

* 1 Key per document
* 2 Keys if document > ~35 pages
* Deduct keys ONLY after successful AI response

---

## 🌍 Supported Languages

* English
* Spanish
* Vietnamese
* Tagalog

---

## ⚠️ Critical Notes

* CORS must allow:

  * plainspeak-now.vercel.app
  * plainspeaknow.net
* Backend must start from:

  ```
  dist/index.js
  ```

---

## 🧪 Health Check

```
/api/health → { ok: true }
```

---

## 🎯 Purpose

Plainspeak helps users understand complex documents.
It does NOT provide legal or medical advice.
