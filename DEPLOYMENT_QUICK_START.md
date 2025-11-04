# 🚀 Quick Start: Deploy to Production

**TL;DR**: Deploy WebSocket server to Railway, keep Next.js on Vercel.

---

## ⚡ 5-Minute Deployment

### Step 1: Generate Secret (1 min)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

💾 **Save this value** - you'll use it twice!

---

### Step 2: Deploy to Railway (2 min)

1. Go to https://railway.app
2. **New Project** → **Deploy from GitHub**
3. Select `grantfinderAI` repo
4. Set **Root Directory**: `/websocket_server`

#### Add Environment Variables:

```bash
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://oetxbwjdxhcryqkdfdpr.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ldHhid2pkeGhjcnlxa2RmZHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMzQzNjksImV4cCI6MjA3MTkxMDM2OX0.FGLHtjkVGxIionwRJwa8YzDAwlE5bIGlyhQXq_5hCps
DATABASE_API_URL=https://your-app.vercel.app/api
WS_SERVER_SECRET=<paste-secret-from-step-1>
```

5. Click **Deploy**
6. Copy the Railway URL: `https://your-service.railway.app`

---

### Step 3: Update Vercel (2 min)

Go to Vercel → **Settings** → **Environment Variables**:

```bash
NEXT_PUBLIC_WS_URL=wss://your-service.railway.app
WS_SERVER_SECRET=<same-secret-from-step-1>
```

**Redeploy** your Vercel app.

---

## ✅ Verify (30 seconds)

1. **Health Check**:

   ```
   https://your-service.railway.app/health
   ```

   Should return: `{"status": "healthy", ...}`

2. **Test App**:
   - Open your Vercel app
   - Open a document
   - Check console: should see `WebSocket Status: connected`

---

## 🎉 Done!

Your real-time collaboration is now live! 🚀

📖 **Full guide**: See `RAILWAY_DEPLOYMENT_GUIDE.md`

---

## 🆘 Troubleshooting

| Issue                | Solution                                            |
| -------------------- | --------------------------------------------------- |
| Connection failed    | Check Railway is running: `/health` endpoint        |
| Auth failed          | Verify you're using **anon key** (not service_role) |
| CORS error           | Railway auto-handles CORS, check URL format         |
| Document not loading | Verify `DATABASE_API_URL` in Railway                |

**Check Railway logs**:

```bash
railway logs --tail
```

---

## 📊 Monitor

- **Railway Dashboard**: https://railway.app/project/your-project
- **Health**: `https://your-service.railway.app/health`
- **Status**: `https://your-service.railway.app/status`

---

## 💰 Cost

- **Railway**: $20/month (Developer plan, recommended)
- **Vercel**: Free (Hobby) or $20/month (Pro)
- **Supabase**: Free (up to 500MB) or $25/month (Pro)

**Total**: ~$20-65/month depending on usage

---

**Need help?** See full guide: `RAILWAY_DEPLOYMENT_GUIDE.md`
