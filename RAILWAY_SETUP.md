# Railway Deployment Setup

## Required Environment Variables

Go to your Railway project → Variables tab and add these:

### Runtime Variables (Required)
```
MONGODB_URI=mongodb+srv://Wisper:Eachine124019@cluster0.j7kbsti.mongodb.net/?appName=Cluster0
CLERK_PUBLISHABLE_KEY=pk_test_cmFwaWQtZWFnbGUtMzIuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_x1jaAm0pVHxG9qYEj3La27ts2SsGztWTfKChbW451q
NODE_ENV=production
FRONTEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

### Build-Time Variables (Required for Docker)
These need to be set as **Build Arguments**:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_cmFwaWQtZWFnbGUtMzIuY2xlcmsuYWNjb3VudHMuZGV2JA
VITE_API_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
```

## How to Set Build Arguments in Railway

Railway automatically passes environment variables as build args to Docker, BUT you need to ensure they're available at build time:

1. Go to your Railway project
2. Click on your service
3. Go to **Variables** tab
4. Add the variables above
5. Make sure `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_API_URL` are set
6. Redeploy

## Alternative: Use Railway Template Variables

Railway provides special template variables:
- `${{RAILWAY_PUBLIC_DOMAIN}}` - Your app's public domain
- `${{RAILWAY_ENVIRONMENT}}` - Current environment

Update your variables to:
```
VITE_API_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
FRONTEND_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
```

## Debugging

### Check if server is running:
```bash
curl https://whisper-chats.up.railway.app/health
```

This should return JSON with:
- Server status
- Environment variable status
- Dist folder location

### Check Railway logs:
```bash
railway logs
```

Look for:
- ✅ MongoDB connected successfully
- 🔧 Environment check (all should show "✅ Set")
- 📁 Serving static files from: /app/dist
- Server is running on PORT: 3000

## Common Issues

### 404 on API routes
- Server not starting properly
- Check logs for MongoDB connection errors
- Verify Clerk keys are set

### 500 on /api/auth/callback
- Clerk keys missing or invalid
- MongoDB connection failed
- Check Railway logs for exact error

### Frontend not loading
- Build args not set (VITE_* variables)
- Dist folder not created during build
- Check /health endpoint for dist folder status
