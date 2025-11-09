# 🚀 Quick Start: Switching LLM Providers

5-minute guide to switch providers without changing code.

## 📋 What You Need

- Netlify account with your deployed app
- API key from your chosen provider

## 🎯 Option 1: Use OpenAI (Default)

**No changes needed!** Just set your OpenAI API key.

```env
API_KEY=sk-your-openai-api-key
```

**Features:** ✅ Chat ✅ TTS ✅ Whisper

---

## 🇨🇳 Option 2: Use Deepseek (Recommended for Chinese)

**Why Deepseek?**
- Native Chinese language model
- Much cheaper than OpenAI
- Excellent for Chinese-Thai translation

### Steps:

1. **Get Deepseek API Key:**
   - Go to https://platform.deepseek.com
   - Sign up & get API key

2. **In Netlify Dashboard → Environment Variables, set:**
   ```
   LLM_PROVIDER = deepseek
   API_KEY = your-deepseek-key
   OPENAI_API_KEY = sk-your-openai-key (for TTS/Whisper)
   ```

3. **Trigger redeploy**

**Cost Comparison:**
- OpenAI GPT-4o-mini: ~$0.15/1M input tokens
- Deepseek Chat: ~$0.14/1M input tokens (cheaper!)
- **Both have similar quality for Chinese**

---

## 🌐 Option 3: Use OpenRouter (100+ Models)

**Why OpenRouter?**
- Access Claude, GPT-4, Llama, Gemini, and more
- Compare costs across providers
- Try different models instantly

### Steps:

1. **Get OpenRouter API Key:**
   - Go to https://openrouter.ai
   - Sign up, add $5 credit
   - Get API key from https://openrouter.ai/keys

2. **In Netlify Dashboard → Environment Variables, set:**
   ```
   LLM_PROVIDER = openrouter
   API_KEY = sk-or-v1-your-key
   APP_URL = https://your-app.netlify.app
   MODEL_NAME = openai/gpt-4o-mini
   OPENAI_API_KEY = sk-your-openai-key (for TTS/Whisper)
   ```

3. **Trigger redeploy**

**Popular Models to Try:**
```
# Fast & cheap
MODEL_NAME=openai/gpt-4o-mini

# Best reasoning (expensive)
MODEL_NAME=anthropic/claude-3-5-sonnet-20241022

# Free option
MODEL_NAME=google/gemini-2.0-flash-exp:free

# Deepseek via OpenRouter
MODEL_NAME=deepseek/deepseek-chat
```

---

## 🔧 How to Switch

### In Netlify Dashboard:

1. Go to **Site settings**
2. Click **Environment variables**
3. Update variables (see examples above)
4. Go to **Deploys** tab
5. Click **Trigger deploy** → **Deploy site**
6. Wait ~2 minutes
7. Test your app!

**That's it!** No code changes, no git commits needed.

---

## 💡 Pro Tips

### Save Money: Mix Providers

Use Deepseek for chat, OpenAI only for TTS:

```
LLM_PROVIDER=deepseek
API_KEY=deepseek-key
OPENAI_API_KEY=openai-key
```

**Result:**
- Chat: 💰 Cheap (Deepseek)
- TTS/Whisper: 🔊 Works (OpenAI fallback)

### Try Different Models

OpenRouter makes it easy:

```
# Today: Fast model
MODEL_NAME=openai/gpt-4o-mini

# Tomorrow: Best quality
MODEL_NAME=anthropic/claude-3-5-sonnet-20241022
```

Just change the variable, redeploy, done!

### Debug Issues

Enable logging:

```
DEBUG_LLM=true
```

Then check Netlify Function logs.

---

## ❓ FAQ

**Q: Can I use multiple models at once?**
A: No, but you can switch anytime by changing `MODEL_NAME`.

**Q: What if TTS/Whisper don't work?**
A: Set `OPENAI_API_KEY` for fallback support.

**Q: How do I know which provider is active?**
A: Enable `DEBUG_LLM=true` and check Function logs.

**Q: Can I test locally first?**
A: Yes! Create `.env.local` with your settings and run `npm run dev:netlify`

---

## 📊 Cost Estimate

For typical usage (100 conversations/month):

| Provider | Chat Cost | TTS/Whisper | Total |
|----------|-----------|-------------|-------|
| OpenAI only | ~$5/month | Included | ~$5 |
| Deepseek + OpenAI | ~$2/month | ~$2/month | ~$4 |
| OpenRouter (GPT-4o) | ~$5/month | ~$2/month | ~$7 |
| OpenRouter (Free) | $0 | ~$2/month | ~$2 |

**Winner for Chinese app: Deepseek + OpenAI fallback** 🏆

---

## 🆘 Need Help?

- **Full Guide:** See `LLM_PROVIDERS.md`
- **Environment Variables:** See `.env.local.example`
- **Issues:** https://github.com/Pruetpong/chinese-interpreter-for-dsu-school-trip/issues

---

Happy provider switching! 🎉
