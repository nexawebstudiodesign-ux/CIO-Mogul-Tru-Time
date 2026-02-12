# Deploy to Vercel

## 🚀 Frontend Deployment (React + Vite)

### Option 1: Vercel Dashboard (Easiest)

1. **Push your code to GitHub**
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy Frontend**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     ```
     VITE_API_URL=https://YOUR_BACKEND_URL.vercel.app
     VITE_DASHBOARD_PASSWORD=ciomogul
     ```
   - Click **Deploy**

3. **Note your frontend URL** (e.g., `https://your-app.vercel.app`)

---

## 🔧 Backend Deployment (NestJS API)

### Option 1: Vercel (Serverless)

1. **Deploy Backend**
   - Go to https://vercel.com/new
   - Import your GitHub repository again
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables** (copy from backend/.env):
     ```
     SUPABASE_URL=https://mffovzvhhywqzvwvtbao.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
     SUPABASE_ANON_KEY=eyJhbGc...
     SUPABASE_JWT_SECRET=EBST08g...
     ADMIN_SETUP_TOKEN=test-1234567890
     ```
   - Click **Deploy**

2. **Note your backend URL** (e.g., `https://your-backend.vercel.app`)

3. **Update Frontend Environment**
   - Go to your frontend project on Vercel
   - Settings → Environment Variables
   - Update `VITE_API_URL` to your backend URL
   - Redeploy frontend

---

### Option 2: Railway (Better for NestJS)

Railway handles long-running servers better than Vercel's serverless:

1. **Sign up at https://railway.app**

2. **Deploy Backend**
   - Click **New Project** → **Deploy from GitHub repo**
   - Select your repository
   - **Root Directory**: `backend`
   - Add environment variables (same as above)
   - Railway auto-detects NestJS and deploys

3. **Get your backend URL** from Railway dashboard

4. **Update frontend on Vercel** with Railway backend URL

---

## 📝 After Deployment

1. **Create Admin Account**
   ```powershell
   curl -X POST https://YOUR_BACKEND_URL/auth/admin-signup `
     -H "Content-Type: application/json" `
     -d '{"name":"Admin","email":"admin@ciomogul.com","employeeId":"CIO-0001","password":"Admin@123","setupToken":"test-1234567890"}'
   ```

2. **Update Frontend .env locally for testing**
   ```env
   VITE_API_URL=https://YOUR_BACKEND_URL
   VITE_DASHBOARD_PASSWORD=ciomogul
   ```

3. **Test your live app**
   - Frontend: `https://your-app.vercel.app/login`
   - Login with `CIO-0001` / `Admin@123`

---

## 🔒 Security Checklist

- ✓ Never commit `.env` files to Git
- ✓ Set environment variables in Vercel/Railway dashboard
- ✓ Change `ADMIN_SETUP_TOKEN` to something secure in production
- ✓ Use strong admin passwords
- ✓ Keep Supabase service_role key secret

---

## 💡 Recommended: Railway for Backend

**Why Railway over Vercel for backend?**
- Better support for long-running Node.js processes
- No cold starts
- Easier WebSocket support if needed later
- More generous free tier for APIs

**Vercel is perfect for the frontend** (React/Vite)!
