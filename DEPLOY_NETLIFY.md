# 🚀 Netlify Deployment Guide

## Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://www.netlify.com)
2. **OpenAI API Key**: Get from [platform.openai.com](https://platform.openai.com/api-keys)
3. **Git Repository**: Push your code to GitHub

## 🎯 Deployment Methods

### Method 1: Deploy via Netlify Dashboard (Recommended)

1. **Connect Repository:**
   - Go to [app.netlify.com/start](https://app.netlify.com/start)
   - Click "Import from Git"
   - Choose GitHub and select your repository
   - Click "Authorize Netlify"

2. **Configure Build Settings:**
   Netlify should auto-detect these settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

3. **Add Environment Variables:**
   Before deploying, click "Show advanced" → "New variable"
   ```
   Key: API_KEY
   Value: sk-your-openai-api-key-here
   ```

4. **Deploy:**
   - Click "Deploy site"
   - Wait for deployment (~2-3 minutes)
   - You'll get a URL like: `https://random-name-123.netlify.app`

5. **Custom Domain (Optional):**
   - Go to Site settings → Domain management
   - Click "Add custom domain"
   - Follow DNS configuration instructions

### Method 2: Deploy via Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Initialize:**
   ```bash
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Select your team
   - Choose a site name

4. **Set Environment Variables:**
   ```bash
   netlify env:set API_KEY "sk-your-openai-api-key-here"
   ```

5. **Deploy:**
   ```bash
   # Build and deploy
   npm run build
   netlify deploy --prod
   ```

### Method 3: One-Click Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Pruetpong/chinese-interpreter-for-dsu-school-trip)

**Note**: You'll still need to add the `API_KEY` environment variable after deployment.

## 🔧 Architecture on Netlify

```
Frontend (Static Files)
    ↓ Deployed to Netlify CDN

Netlify Functions (Serverless)
    ↓ /api/* routes → /.netlify/functions/*

OpenAI API
```

### How it works:

- **Frontend**: Built with Vite, served as static files from CDN
- **Backend**: Functions in `/netlify/functions/` directory
  - `chat.js` → `https://your-app.netlify.app/api/chat`
  - `tts.js` → `https://your-app.netlify.app/api/tts`
  - `transcribe.js` → `https://your-app.netlify.app/api/transcribe`
  - `health.js` → `https://your-app.netlify.app/api/health`
- **Rewrites**: `netlify.toml` rewrites `/api/*` to `/.netlify/functions/*`

## 📝 Post-Deployment Checklist

- [ ] Test site is loading at your Netlify URL
- [ ] Check Functions tab - all 4 functions should be deployed
- [ ] Test chat functionality on all 3 tabs
- [ ] Test Text-to-Speech (speaker icon)
- [ ] Test Speech-to-Text (microphone)
- [ ] Test Save/Load conversation
- [ ] Check browser console for errors
- [ ] Monitor OpenAI usage in dashboard

## 🔒 Security Best Practices

1. **Environment Variables**:
   - ✅ API keys stored securely in Netlify
   - ✅ Never exposed to client-side code
   - ✅ Only accessible by serverless functions

2. **HTTPS**:
   - ✅ Automatically enabled by Netlify
   - ✅ Required for microphone access

3. **Function Timeouts**:
   - Free tier: 10 seconds max
   - Pro tier: 26 seconds max
   - Consider upgrading for heavy usage

## 💰 Cost Management

### Netlify Pricing (Free Starter Plan):
- **Bandwidth**: 100 GB/month
- **Build minutes**: 300 minutes/month
- **Function invocations**: 125,000/month
- **Function runtime**: 100 hours/month

### OpenAI Pricing:
- **GPT-4o-mini**: ~$0.15/1M input tokens, ~$0.60/1M output tokens
- **TTS-1**: ~$15/1M characters
- **Whisper-1**: ~$0.006/minute

### Cost Optimization:
1. Set spending limits in OpenAI dashboard
2. Monitor Netlify Analytics
3. Add authentication to prevent abuse
4. Use free tier efficiently

## 🐛 Troubleshooting

### Issue: "ขออภัยค่ะ เกิดข้อผิดพลาดในการสื่อสาร" (Communication Error)
**Cause**: Missing `API_KEY` environment variable

**Solution**:
1. Go to Netlify Dashboard → Your site
2. Navigate to: **Site settings** → **Environment variables**
3. Click **Add a variable** or **Add variable**
4. Add the following:
   - **Key**: `API_KEY`
   - **Value**: Your OpenAI API key (starts with `sk-...`)
5. Click **Save**
6. Go to **Deploys** tab
7. Click **Trigger deploy** → **Deploy site** to rebuild with the new environment variable

**How to get OpenAI API Key**:
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click **Create new secret key**
4. Copy the key (it starts with `sk-`)
5. **Important**: Save it securely - you won't see it again!

### Issue: "API_KEY is not defined"
**Solution**:
Same as above - this error appears in server logs when the environment variable is missing.

### Issue: "Function invocation failed"
**Solution**:
- Check Function logs: Deploys → Functions
- Verify OpenAI API key is valid
- Check OpenAI account has credits
- Ensure function timeout isn't exceeded

### Issue: "Failed to generate response"
**Solution**:
- Test function directly: `https://your-app.netlify.app/api/health`
- Check Function logs for errors
- Verify network connectivity

### Issue: Audio not playing
**Solution**:
- Ensure HTTPS is enabled (Netlify default)
- Check browser allows autoplay
- Try clicking speaker icon again

### Issue: Microphone not working
**Solution**:
- Allow microphone permission in browser
- Verify HTTPS is enabled
- Check browser compatibility

## 📊 Monitoring & Logs

### Netlify Dashboard:

1. **Function Logs**:
   - Go to Functions tab
   - Click on function name
   - View real-time logs

2. **Analytics**:
   - Site overview → Analytics
   - Monitor bandwidth usage
   - Track function invocations

3. **Deploy Logs**:
   - Deploys tab
   - Click on deployment
   - View build logs

### OpenAI Usage:

- Go to [platform.openai.com/usage](https://platform.openai.com/usage)
- Monitor API calls and costs
- Set usage alerts

## 🔄 Updating Your App

### Automatic Deployment:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Update features"
   git push
   ```

2. **Auto-Deploy:**
   - Netlify automatically deploys on push
   - Preview deploys for pull requests
   - Production deploys for main branch

### Manual Deployment:

```bash
npm run build
netlify deploy --prod
```

## ⚙️ Local Development

Run Netlify Functions locally:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start local dev server
netlify dev
```

This starts:
- Frontend: `http://localhost:8888`
- Functions: `http://localhost:8888/.netlify/functions/*`

## 🌐 Custom Domain Setup

1. **Add Domain**:
   - Site settings → Domain management
   - Add custom domain

2. **Configure DNS**:
   - Add A record or CNAME
   - Point to Netlify

3. **Enable HTTPS**:
   - Automatically provisioned
   - Let's Encrypt SSL certificate

## 📱 Performance Optimization

### Build Optimization:
- Netlify auto-minifies assets
- Image optimization available
- CDN edge caching enabled

### Function Optimization:
- Keep functions lightweight
- Use esbuild bundler (configured)
- Cache external API calls if possible

## ⚡ Important Notes

### Differences from Vercel:

| Feature | Netlify | Vercel |
|---------|---------|--------|
| **Streaming** | ❌ Not supported | ✅ Supported |
| **Response** | Complete response | Server-Sent Events |
| **Timeout (Free)** | 10 seconds | 10 seconds |
| **Functions Path** | `/netlify/functions/` | `/api/` |

### Current Implementation:

- ⚠️ **Non-streaming responses**: Chat waits for complete response
- ✅ **All features work**: TTS, STT, 3 chat modes
- ✅ **Mobile friendly**: HTTPS enabled
- ✅ **Cost effective**: Fits in free tier

## 🎉 Success!

Your app is now live at: `https://your-app.netlify.app`

Next steps:
1. Share the link with your team
2. Monitor usage and costs
3. Add custom domain if needed
4. Enable authentication for production use

Happy interpreting! 🏮
