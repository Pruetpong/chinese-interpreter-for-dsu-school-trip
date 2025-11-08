# 🚀 Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **OpenAI API Key**: Get from [platform.openai.com](https://platform.openai.com/api-keys)
3. **Git Repository**: Push your code to GitHub

## 🎯 Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Click "Import"

2. **Configure Project:**
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`

3. **Add Environment Variables:**
   Click "Environment Variables" and add:
   ```
   Name: API_KEY
   Value: sk-your-openai-api-key-here
   ```
   ⚠️ Make sure to check all environments (Production, Preview, Development)

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete (~2-3 minutes)
   - You'll get a URL like: `https://your-app.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   # First deployment
   vercel

   # Production deployment
   npm run deploy
   # or
   vercel --prod
   ```

4. **Set Environment Variables:**
   ```bash
   vercel env add API_KEY
   # Paste your OpenAI API key when prompted
   # Select: Production, Preview, Development
   ```

## 🔧 Architecture on Vercel

```
Frontend (Static Files)
    ↓ Deployed to Vercel Edge Network

Backend (Serverless Functions)
    ↓ /api/* routes automatically handled

OpenAI API
```

### How it works:

- **Frontend**: Built with Vite, served as static files
- **Backend**: Each file in `/api/*` becomes a serverless function
  - `/api/chat.js` → `https://your-app.vercel.app/api/chat`
  - `/api/tts.js` → `https://your-app.vercel.app/api/tts`
  - `/api/transcribe.js` → `https://your-app.vercel.app/api/transcribe`

## 📝 Post-Deployment Checklist

- [ ] Test chat functionality on all 3 tabs
- [ ] Test Text-to-Speech (speaker icon)
- [ ] Test Speech-to-Text (microphone)
- [ ] Test Save/Load conversation
- [ ] Check browser console for errors
- [ ] Monitor usage in OpenAI dashboard

## 🔒 Security Best Practices

1. **Environment Variables**:
   - ✅ API keys are stored securely in Vercel
   - ✅ Never exposed to client-side code
   - ✅ Only accessible by serverless functions

2. **CORS Configuration**:
   - Already configured in API routes
   - Allows requests from your Vercel domain

3. **Rate Limiting** (Optional):
   - Consider adding rate limiting to prevent abuse
   - Use Vercel's Edge Middleware or external service

## 💰 Cost Management

### Vercel Pricing:
- **Hobby Plan**: FREE
  - 100 GB Bandwidth/month
  - 100 GB-Hours Serverless Function execution
  - Unlimited deployments

### OpenAI Pricing:
- **GPT-4o-mini**: ~$0.15/1M input tokens, ~$0.60/1M output tokens
- **TTS-1**: ~$15/1M characters
- **Whisper-1**: ~$0.006/minute

### Cost Optimization Tips:
1. Set monthly spending limits in OpenAI dashboard
2. Monitor usage regularly
3. Consider using `tts-1` instead of `tts-1-hd`
4. Add user authentication to prevent abuse

## 🐛 Troubleshooting

### Issue: "API_KEY is not defined"
**Solution**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `API_KEY` with your OpenAI key
3. Redeploy: `vercel --prod`

### Issue: "Failed to generate response"
**Solution**:
- Check OpenAI API key is valid
- Check OpenAI account has credits
- Check function logs in Vercel Dashboard

### Issue: Audio not playing
**Solution**:
- Check browser allows autoplay
- Try clicking speaker icon again
- Check browser console for CORS errors

### Issue: Microphone not working
**Solution**:
- Allow microphone permission in browser
- Use HTTPS (required for microphone access)
- Vercel provides HTTPS by default

## 📊 Monitoring & Logs

1. **Vercel Dashboard:**
   - Go to your project → Deployments
   - Click on a deployment → View Function Logs

2. **OpenAI Usage:**
   - Go to [platform.openai.com/usage](https://platform.openai.com/usage)
   - Monitor API calls and costs

## 🔄 Updating Your App

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Update features"
   git push
   ```

2. **Auto-Deploy:**
   - Vercel automatically deploys on push to main branch
   - Preview deployments for pull requests

3. **Manual Deploy:**
   ```bash
   vercel --prod
   ```

## 🌐 Custom Domain (Optional)

1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (~24 hours)

## 📱 PWA (Progressive Web App) - Optional

To make the app installable on mobile:

1. Create `public/manifest.json`
2. Add service worker
3. Add meta tags to `index.html`
4. Redeploy

## 🎉 Success!

Your app is now live at: `https://your-app.vercel.app`

Share the link with your team and enjoy the Chinese Interpreter! 🏮
