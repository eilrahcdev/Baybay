# MongoDB Atlas Integration Guide

## 1) Create Atlas connection values
- Cluster URI template:
  - `mongodb+srv://achidev:<db_password>@baybay.sr29bi2.mongodb.net/?appName=Baybay`
- Database name:
  - `Baybay`

Replace `<db_password>` with your real Atlas DB user password.

## 2) Configure server env
Update `server/.env`:

```env
MONGODB_URI=mongodb+srv://achidev:<db_password>@baybay.sr29bi2.mongodb.net/?appName=Baybay
MONGODB_DB_NAME=Baybay
JWT_SECRET=use-a-long-random-secret
JWT_EXPIRES_IN=7d
```

If you get `querySrv ECONNREFUSED _mongodb._tcp...`, your DNS blocks SRV records.
Use Atlas "Standard connection string" as fallback:

```env
MONGODB_URI_DIRECT=mongodb://achidev:<db_password>@ac-2wrsxsi-shard-00-00.sr29bi2.mongodb.net:27017,ac-2wrsxsi-shard-00-01.sr29bi2.mongodb.net:27017,ac-2wrsxsi-shard-00-02.sr29bi2.mongodb.net:27017/Baybay?ssl=true&replicaSet=atlas-ftstok-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Baybay
```

## 3) Install dependencies
From `server/`:

```bash
npm install
```

## 4) Start backend
From `server/`:

```bash
npm run dev
```

On startup, the app creates required indexes in MongoDB.

## 5) Start frontend
From `client/`:

```bash
npm install
npm run dev
```

Use local API in development so signup/login/OTP writes to your Atlas DB:

```env
# client/.env
VITE_API_BASE_URL=http://localhost:5000
# Optional for deployed frontend builds:
# VITE_API_URL=https://baybay.onrender.com/api
```

If `VITE_API_URL` points to a deployed server during local testing, your local Atlas database may appear empty.

## 6) Verify end-to-end flow
1. Sign up with a new email.
2. Confirm row exists in MongoDB `users`.
3. Confirm OTP row appears in MongoDB `email_otps`.
4. Check OTP email delivery.
5. Verify email with OTP.
6. Login and confirm protected pages work.
7. Test forgot/reset password flow.

## 7) Atlas access checklist
- Atlas `Network Access` allows your backend IP.
- Atlas DB user has `readWrite` on `Baybay`.
- URI password is URL-safe (or URL-encoded).
- SMTP credentials are valid and logs show OTP send `accepted=<recipient>` (not rejected).
