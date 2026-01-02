# GEO-Vserve Deployment Guide

Deploy your GEO Readiness Audit tool to the world for free using Netlify (frontend) and Render (backend).

## Prerequisites

- GitHub account (free)
- Netlify account (free)
- Render account (free)
- MongoDB Atlas account (free tier available)

## Step 1: Push to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create a GitHub repository**:
   - Go to https://github.com/new
   - Create a new repository named `geo-vserve`
   - Follow GitHub's instructions to push your code

3. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/geo-vserve.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy Backend on Render

1. **Go to Render** (https://render.com):
   - Sign up with GitHub
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure the Web Service**:
   - **Name**: `geo-vserve-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Instance Type**: Free

3. **Add Environment Variables**:
   Click "Advanced" and add these:
   
   ```
   NODE_ENV=production
   PORT=3001
   ALLOWED_ORIGINS=https://your-netlify-domain.netlify.app
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/geo-audit
   OPENAI_API_KEY=your_key_here (optional)
   ```

4. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Copy your backend URL (e.g., `https://geo-vserve-backend.onrender.com`)

## Step 3: Set Up MongoDB Atlas (Free)

1. **Go to MongoDB Atlas** (https://www.mongodb.com/cloud/atlas):
   - Sign up for free
   - Create a new project
   - Create a cluster (M0 Free tier)

2. **Get Connection String**:
   - Click "Connect"
   - Choose "Drivers"
   - Copy the connection string
   - Replace `<password>` with your password
   - This is your `MONGODB_URI`

3. **Add to Render**:
   - Go back to Render dashboard
   - Edit your web service
   - Update `MONGODB_URI` with your MongoDB connection string

## Step 4: Deploy Frontend on Netlify

1. **Go to Netlify** (https://netlify.com):
   - Sign up with GitHub
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repository

2. **Configure Build Settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: (leave empty)

3. **Add Environment Variables**:
   - Click "Site settings" → "Build & deploy" → "Environment"
   - Add:
     ```
     VITE_API_URL=https://geo-vserve-backend.onrender.com
     ```

4. **Deploy**:
   - Click "Deploy site"
   - Wait for build to complete (2-3 minutes)
   - Your site will be live at `https://your-site-name.netlify.app`

## Step 5: Update Frontend API Configuration

1. **Check your frontend code** (`src/App.jsx` or similar):
   - Make sure it uses the environment variable:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
   ```

2. **Update API calls**:
   - Replace hardcoded `localhost:3001` with `API_URL`

## Step 6: Connect Everything

1. **Update Render environment variable**:
   - Go to Render dashboard
   - Edit your web service
   - Update `ALLOWED_ORIGINS` with your Netlify domain:
   ```
   https://your-site-name.netlify.app
   ```

2. **Test the connection**:
   - Go to your Netlify site
   - Try running an audit
   - Check Render logs for any errors

## Troubleshooting

### "CORS Error" or "Cannot reach backend"
- Check that `ALLOWED_ORIGINS` in Render includes your Netlify domain
- Verify `VITE_API_URL` is set correctly in Netlify
- Check Render logs for errors

### "MongoDB connection failed"
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas whitelist includes Render's IP (usually set to 0.0.0.0/0 for free tier)

### Build fails on Netlify
- Check build logs in Netlify dashboard
- Ensure `npm run build` works locally: `npm run build`
- Check for missing dependencies

### Backend times out
- Free tier Render instances spin down after 15 minutes of inactivity
- First request may take 30+ seconds
- Consider upgrading to paid tier for production

## Custom Domain (Optional)

### Add to Netlify:
1. Go to "Site settings" → "Domain management"
2. Click "Add custom domain"
3. Follow DNS setup instructions

### Add to Render:
1. Go to web service settings
2. Add custom domain under "Custom Domains"
3. Update DNS records

## Monitoring

- **Netlify**: Check deploy logs and analytics in dashboard
- **Render**: Monitor logs in web service dashboard
- **MongoDB Atlas**: Check connection metrics and database usage

## Next Steps

1. Share your Netlify URL with users
2. Monitor performance and logs
3. Consider upgrading to paid tiers if you need:
   - Always-on backend (Render paid)
   - More database storage (MongoDB paid)
   - Custom domain with SSL

## Free Tier Limits

- **Netlify**: 300 build minutes/month, unlimited bandwidth
- **Render**: Spins down after 15 min inactivity, 750 hours/month
- **MongoDB Atlas**: 512MB storage, 3 nodes

---

**Need help?** Check the logs in each platform's dashboard for detailed error messages.
