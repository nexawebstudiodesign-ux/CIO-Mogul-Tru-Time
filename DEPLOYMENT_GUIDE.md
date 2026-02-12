# 🚀 Deployment Guide - CIO Mogul Tru Time

## ⚠️ CRITICAL: Environment Variables Setup

Your backend is **crashing because Vercel doesn't have the environment variables**. Follow these steps:

---

## 📋 Step 1: Configure Vercel Backend Environment Variables

### Go to Vercel Dashboard:
1. Open your project: https://vercel.com/kishor-mudhols-projects/cio-mogul-tru-time
2. Click **Settings**
3. Click **Environment Variables** (left sidebar)

### Add These Variables (EXACT names):

```bash
# Supabase Configuration
SUPABASE_URL=https://mffovzvhhywqzvwvtbao.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZm92enZoaHl3cXp2d3Z0YmFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDkwMDI1OSwiZXhwIjoyMDg2NDc2MjU5fQ._psBIElbwqeL9RxcHB8FbKqyI5pIbpnqmgDvIZ0kDMo
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZm92enZoaHl3cXp2d3Z0YmFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDAyNTksImV4cCI6MjA4NjQ3NjI1OX0.6yJeKuLt3KYG1wV8WKo0gq1eMbskqn5Mcs9p0KLthwY
SUPABASE_JWT_SECRET=EBST08gNqINkmbDbuzZ6MfL8KzUMdMjEJi6AVGYm6QxgF9/oHMFhMcNFiQeyK+ypf8SyhMBp9xHXo205K1Q1Ng==
ADMIN_SETUP_TOKEN=test-1234567890
```

### Important:
- Set environment for: **Production, Preview, Development** (check all 3)
- Click **Save** after each variable

---

## 📋 Step 2: Configure Frontend Environment Variables

### In Frontend Vercel Project Settings:

```bash
VITE_API_URL=https://cio-mogul-tru-time-nqj2u4ctz-kishor-mudhols-projects-d82c1a86.vercel.app
VITE_DASHBOARD_PASSWORD=ciomogul
```

**Note:** Replace the VITE_API_URL with your actual backend Vercel URL once it's deployed.

---

## 📋 Step 3: Redeploy After Adding Variables

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **⋮** (three dots) menu
4. Click **Redeploy**
5. Check **"Use existing Build Cache"** → **OFF**
6. Click **Redeploy**

---

## 🔧 Alternative: Single Deployment Approach

If you want to deploy frontend + backend together:

### Option A: Deploy Backend on Render/Railway Instead

**Render.com (Recommended):**
1. Create account at render.com
2. New → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Environment:** Add all 4 environment variables
5. Deploy!

**Railway.app:**
1. Create account at railway.app
2. **New Project** → Deploy from GitHub
3. Select `backend` directory
4. Add environment variables in dashboard
5. Deploy!

### Option B: Keep Vercel for Both

Current setup works, just needs environment variables configured in Step 1.

---

## 🐛 Troubleshooting

### Backend Still Crashing?

**Check Vercel Logs:**
1. Go to your backend deployment
2. Click **Functions** tab
3. Click **View Logs**
4. Look for specific error messages

**Common Issues:**

| Error | Solution |
|-------|----------|
| `SUPABASE_JWT_SECRET is not defined` | Add env variable in Vercel dashboard |
| `Cannot connect to Supabase` | Check SUPABASE_URL is correct |
| `Unauthorized` | Check SUPABASE_SERVICE_ROLE_KEY |
| `Module not found` | Redeploy with cache cleared |

### Frontend Can't Connect to Backend?

**Update VITE_API_URL:**
1. Get your backend URL from Vercel deployment
2. Update frontend env variable `VITE_API_URL`
3. Redeploy frontend

---

## ✅ Verification Steps

### Test Backend:
```bash
curl https://YOUR-BACKEND-URL.vercel.app
```

Expected: `{"statusCode":404,"message":"Cannot GET /","error":"Not Found"}`  
(This is GOOD - means server is running)

### Test Backend Auth:
```bash
curl -X POST https://YOUR-BACKEND-URL.vercel.app/auth/admin-signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@ciomogul.com",
    "employeeId": "CIO-0001",
    "password": "Admin@123",
    "setupToken": "test-1234567890"
  }'
```

Expected: Success response with user data

### Test Frontend:
1. Open your frontend URL
2. Try to login with created admin credentials
3. Check browser console for API errors

---

## 🎯 Quick Reference

### Project URLs:
- **Frontend:** https://cio-mogul-tru-time.vercel.app (update this)
- **Backend:** https://cio-mogul-tru-time-backend.vercel.app (update this)
- **Supabase Dashboard:** https://supabase.com/dashboard

### Required Environment Variables:
✅ SUPABASE_URL  
✅ SUPABASE_SERVICE_ROLE_KEY  
✅ SUPABASE_ANON_KEY  
✅ SUPABASE_JWT_SECRET  
✅ ADMIN_SETUP_TOKEN  

### Deployment Commands:
```bash
# Commit changes
git add .
git commit -m "Update deployment configuration"
git push

# Vercel will auto-deploy
# Or manually trigger in Vercel dashboard
```

---

## 📞 Support

**Admin Contact:** info@theciomogul.com  
**Organization:** CIO MOGUL GLOBAL PUBLICATION PRIVATE LIMITED  
**UAN:** U58132MH2025PTC459494

---

## 🔐 Security Notes

⚠️ **IMPORTANT:** The environment variables shown in this guide are from your `.env.example` file. If these are production credentials:

1. **Rotate Supabase keys** after deployment
2. Change `ADMIN_SETUP_TOKEN` to something secure
3. Enable RLS policies in Supabase
4. Use HTTPS only in production
5. Never commit `.env` files to Git

---

**Last Updated:** February 13, 2026  
**Version:** 1.0
