# 🚂 Railway Deployment Guide - WebSocket Server

Complete guide for deploying the GrantWare AI WebSocket server to Railway while keeping the Next.js webapp on Vercel.

---

## 📋 Overview

### Architecture

```
┌─────────────────┐         WebSocket           ┌──────────────────┐
│                 │◄──────────(WSS)─────────────►│                  │
│  Next.js App    │                              │ WebSocket Server │
│  (Vercel)       │         HTTP API             │   (Railway)      │
│                 │◄─────────────────────────────┤                  │
└─────────────────┘                              └──────────────────┘
        │                                                  │
        │                                                  │
        ▼                                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PostgreSQL (Supabase)                        │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Setup?

- ✅ **Vercel** - Optimized for Next.js, edge functions, instant deploys
- ✅ **Railway** - Perfect for WebSocket servers, persistent connections
- ✅ **Supabase** - Managed PostgreSQL with authentication

---

## 🚀 Part 1: Prepare WebSocket Server

### 1. Files Already Configured

✅ **`railway.json`** - Railway build configuration  
✅ **`package.json`** - Production scripts added  
✅ **`env.example`** - Environment variable template  
✅ **Health endpoints** - `/health` and `/status` for monitoring

### 2. Generate Server Secret

Generate a secure random secret for `WS_SERVER_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Save this value** - you'll need it for both Railway and Vercel!

---

## 🚂 Part 2: Deploy to Railway

### Step 1: Create Railway Project

1. Go to https://railway.app
2. Click **"New Project"**
3. Choose **"Deploy from GitHub repo"**
4. Select your `grantfinderAI` repository
5. Railway will detect it as a Node.js project

### Step 2: Configure Build Settings

Railway should auto-detect the build settings from `railway.json`, but verify:

1. Go to **Settings** → **Build**
2. Verify:
   - **Root Directory**: `/websocket_server`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start:prod`

### Step 3: Set Environment Variables

Go to **Variables** tab and add:

```bash
# Server Configuration
NODE_ENV=production
PORT=4000

# Supabase (IMPORTANT: Use anon key, NOT service_role!)
NEXT_PUBLIC_SUPABASE_URL=https://oetxbwjdxhcryqkdfdpr.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ldHhid2pkeGhjcnlxa2RmZHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMzQzNjksImV4cCI6MjA3MTkxMDM2OX0.FGLHtjkVGxIionwRJwa8YzDAwlE5bIGlyhQXq_5hCps

# API Configuration (Your Vercel URL - update after Vercel deployment)
DATABASE_API_URL=https://your-app.vercel.app/api

# Server Secret (use the one you generated)
WS_SERVER_SECRET=your-64-character-hex-secret-from-step-2
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. Railway will provide a domain: `your-service.railway.app`

### Step 5: Get WebSocket URL

After deployment:

1. Go to **Settings** → **Networking**
2. Copy the **public domain** (e.g., `wss://your-service.railway.app`)
3. **Important**: Use `wss://` (not `ws://`) for production!

---

## ☁️ Part 3: Update Vercel Configuration

### Step 1: Update Vercel Environment Variables

Go to your Vercel project → **Settings** → **Environment Variables**:

Add or update:

```bash
# WebSocket Configuration
NEXT_PUBLIC_WS_URL=wss://your-service.railway.app

# Server Secret (MUST match Railway!)
WS_SERVER_SECRET=your-64-character-hex-secret-from-step-2
```

### Step 2: Redeploy Vercel

After updating environment variables:

1. Go to **Deployments**
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**

Or push a new commit to trigger automatic deployment.

---

## ✅ Part 4: Verify Deployment

### 1. Check Railway Health

Open in browser:

```
https://your-service.railway.app/health
```

Expected response:

```json
{
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": "2025-11-04T...",
  "service": "grantware-websocket-server",
  "version": "1.0.0",
  "environment": "production"
}
```

### 2. Check WebSocket Status

```
https://your-service.railway.app/status
```

Expected response:

```json
{
  "status": "running",
  "uptime": 123.456,
  "timestamp": "2025-11-04T...",
  "documents": 0,
  "connections": 0
}
```

### 3. Test from Vercel App

1. Open your Vercel app: `https://your-app.vercel.app`
2. Log in
3. Open a document
4. Check browser console for:

```
🔌 [SimpleEditor] Setting up WebSocket connection
📡 [SimpleEditor] WebSocket Status: connected
```

### 4. Test Real-time Collaboration

1. Open the same document in **two different browsers**
2. Type in one browser
3. Verify text appears in the other browser **instantly**
4. Check Railway logs:

```bash
railway logs
```

You should see:

```
🔌 [New Connection]
   Document: doc-xyz123
   Client: xxx.xxx.xxx.xxx
```

---

## 🔒 Part 5: Security Checklist

### Railway Settings

- ✅ Use `wss://` (WebSocket Secure), not `ws://`
- ✅ Use Supabase **anon key**, not service_role key
- ✅ Set `NODE_ENV=production`
- ✅ Ensure `WS_SERVER_SECRET` matches Vercel exactly

### Vercel Settings

- ✅ Update `NEXT_PUBLIC_WS_URL` to Railway domain
- ✅ Ensure `WS_SERVER_SECRET` matches Railway exactly
- ✅ Verify `DATABASE_API_URL` in Railway points to Vercel

### Supabase RLS Policies

Ensure Row Level Security is enabled:

```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'app';
```

---

## 📊 Part 6: Monitoring & Logs

### Railway Dashboard

1. **Metrics**:

   - Go to **Metrics** tab
   - Monitor CPU, memory, network usage

2. **Logs**:

   ```bash
   # View real-time logs
   railway logs --tail

   # View logs from CLI
   railway logs
   ```

3. **Health Checks**:
   - Railway will auto-restart if health check fails
   - Check `/health` endpoint regularly

### Vercel Analytics

1. Go to **Analytics** → **Real User Monitoring**
2. Monitor WebSocket connection errors
3. Check for 401 (auth) or 403 (forbidden) errors

---

## 🐛 Part 7: Troubleshooting

### Issue 1: WebSocket Connection Failed

**Symptoms**: Console shows `WebSocket connection to 'wss://...' failed`

**Solutions**:

1. Verify Railway service is running: `https://your-service.railway.app/health`
2. Check `NEXT_PUBLIC_WS_URL` in Vercel matches Railway domain
3. Ensure Railway is using `PORT=4000`
4. Check Railway logs: `railway logs --tail`

### Issue 2: Authentication Failed

**Symptoms**: Console shows `Authentication failed` or `403 Forbidden`

**Solutions**:

1. Verify you're using **anon key**, not service_role key
2. Check token in browser console:
   ```javascript
   // In browser console
   localStorage.getItem("supabase.auth.token");
   ```
3. Verify user has access to document (same organization)
4. Check Railway logs for auth errors

### Issue 3: Document Not Loading

**Symptoms**: Blank editor, no content appears

**Solutions**:

1. Check `DATABASE_API_URL` in Railway points to Vercel
2. Verify Vercel API routes are working: `/api/collaboration/get-document`
3. Check Supabase RLS policies allow document access
4. Inspect network tab for failed API calls

### Issue 4: Cursors Not Showing

**Symptoms**: Can't see other users' cursors

**Solutions**:

1. Open DevTools console (F12)
2. Look for cursor tracking logs: `🖱️ [Cursor] Updated position`
3. Verify awareness is working: Check `/status` shows multiple connections
4. Check if CSS is loading: inspect `.collaboration-cursor__caret`

### Issue 5: Railway Build Failed

**Symptoms**: Railway deployment fails during build

**Solutions**:

1. Check `railway.json` exists in `websocket_server/`
2. Verify root directory is set to `/websocket_server`
3. Check `package.json` has all dependencies
4. Review build logs in Railway dashboard

---

## 🔄 Part 8: CI/CD & Updates

### Automatic Deployments

Railway auto-deploys when you push to GitHub:

```bash
# Make changes to websocket_server
cd websocket_server
# ... edit files ...

# Commit and push
git add .
git commit -m "Update WebSocket server"
git push origin main

# Railway will automatically:
# 1. Detect the push
# 2. Build the project
# 3. Deploy to production
# 4. Run health checks
```

### Manual Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Deploy manually
railway up
```

### Rollback

If something goes wrong:

1. Go to Railway dashboard
2. Click **Deployments**
3. Find last working deployment
4. Click **"..."** → **"Redeploy"**

---

## 💰 Part 9: Cost & Scaling

### Railway Pricing (as of 2025)

- **Free Tier**: $5 credit/month

  - Good for testing
  - May sleep after inactivity

- **Developer Plan**: $20/month
  - Always-on
  - Recommended for production
  - Includes monitoring

### Scaling Considerations

#### When to Scale Up?

Monitor these metrics:

- **> 100 concurrent connections** → Upgrade Railway plan
- **> 500 concurrent connections** → Add load balancer
- **High CPU/memory** → Increase resources

#### Horizontal Scaling (Future)

For > 1000 connections:

1. Deploy multiple Railway instances
2. Add Redis adapter for Yjs
3. Use load balancer with sticky sessions
4. See `SCALING_GUIDE.md` (to be created)

---

## 📝 Part 10: Quick Reference

### Important URLs

| Service            | URL                                      | Purpose            |
| ------------------ | ---------------------------------------- | ------------------ |
| Railway Dashboard  | https://railway.app/project/your-project | Monitoring & logs  |
| WebSocket Health   | https://your-service.railway.app/health  | Health check       |
| WebSocket Status   | https://your-service.railway.app/status  | Connection info    |
| Vercel Dashboard   | https://vercel.com/dashboard             | Next.js deployment |
| Supabase Dashboard | https://supabase.com/dashboard           | Database & auth    |

### Environment Variables Summary

#### Railway (WebSocket Server)

```bash
NODE_ENV=production
PORT=4000
NEXT_PUBLIC_SUPABASE_URL=https://oetxbwjdxhcryqkdfdpr.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...anon-key
DATABASE_API_URL=https://your-app.vercel.app/api
WS_SERVER_SECRET=your-64-char-hex-secret
```

#### Vercel (Next.js App)

```bash
NEXT_PUBLIC_WS_URL=wss://your-service.railway.app
WS_SERVER_SECRET=your-64-char-hex-secret
# ... other existing vars
```

### Health Check Commands

```bash
# Check Railway health
curl https://your-service.railway.app/health

# Check Railway status
curl https://your-service.railway.app/status

# View Railway logs
railway logs --tail

# Check Railway metrics
railway status
```

---

## 🎯 Success Checklist

Before going live, verify:

- ✅ Railway deployment succeeded
- ✅ Health endpoint returns `"status": "healthy"`
- ✅ Vercel has updated `NEXT_PUBLIC_WS_URL`
- ✅ `WS_SERVER_SECRET` matches on both platforms
- ✅ Using `wss://` (not `ws://`)
- ✅ Using Supabase **anon key** (not service_role)
- ✅ Test with 2+ users in same document
- ✅ Real-time typing works
- ✅ Cursors are visible (if implemented)
- ✅ User avatars show in header
- ✅ Connection status shows "Live"

---

## 🆘 Need Help?

### Railway Support

- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

### Common Issues

1. **Connection refused**: Check Railway is running
2. **401 Auth error**: Verify Supabase keys
3. **CORS error**: Railway auto-handles CORS
4. **Timeout**: Check `DATABASE_API_URL` is correct

### Debugging Commands

```bash
# Test WebSocket connection (using wscat)
npm install -g wscat
wscat -c "wss://your-service.railway.app/doc-test?token=YOUR_JWT_TOKEN"

# Check DNS resolution
nslookup your-service.railway.app

# Test health endpoint
curl -v https://your-service.railway.app/health
```

---

## 🎉 You're Done!

Your WebSocket server is now running on Railway! 🚀

Next steps:

- Monitor Railway metrics
- Set up alerts for downtime
- Consider adding more health checks
- Implement rate limiting (if needed)
- See `SCALING_GUIDE.md` for growth strategies

**Happy Collaborating!** 🎨👥✨
