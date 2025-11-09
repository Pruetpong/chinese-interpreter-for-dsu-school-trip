# 🤖 LLM Provider Configuration Guide

This guide explains how to configure different LLM providers for the Chinese Interpreter app.

## Table of Contents

- [Overview](#overview)
- [Supported Providers](#supported-providers)
- [Configuration](#configuration)
- [Provider-Specific Setup](#provider-specific-setup)
- [Feature Support Matrix](#feature-support-matrix)
- [Troubleshooting](#troubleshooting)

## Overview

The app now supports multiple LLM providers that are compatible with the OpenAI SDK. You can easily switch between providers or use custom endpoints by setting environment variables.

**Key Features:**
- ✅ Multi-provider support (OpenAI, Deepseek, OpenRouter, Custom)
- ✅ Automatic fallback for TTS/Whisper when provider doesn't support them
- ✅ Easy model switching via environment variables
- ✅ No code changes required to switch providers

## Supported Providers

### 1. OpenAI (Default)

**Features:** Full support (Chat, TTS, Whisper)

```env
LLM_PROVIDER=openai
API_KEY=sk-your-openai-api-key
```

**Popular Models:**
- `gpt-4o-mini` (default) - Fast, cost-effective
- `gpt-4o` - Most capable, higher cost
- `gpt-4-turbo` - Previous generation, still powerful

**Get API Key:** https://platform.openai.com/api-keys

---

### 2. Deepseek

**Features:** Chat only (no TTS/Whisper support)

```env
LLM_PROVIDER=deepseek
API_KEY=your-deepseek-api-key
# Optional: Set OpenAI key for TTS/Whisper fallback
OPENAI_API_KEY=sk-your-openai-key
```

**Popular Models:**
- `deepseek-chat` (default) - General purpose
- `deepseek-coder` - Code-specialized

**Get API Key:** https://platform.deepseek.com

**Pricing:** Very competitive, especially for Chinese language tasks

---

### 3. OpenRouter

**Features:** Chat only (no TTS/Whisper support)
**Advantage:** Access to 100+ models from multiple providers

```env
LLM_PROVIDER=openrouter
API_KEY=your-openrouter-api-key
APP_URL=https://your-app.netlify.app
# Optional: Set OpenAI key for TTS/Whisper fallback
OPENAI_API_KEY=sk-your-openai-key
```

**Popular Models:**
- `openai/gpt-4o-mini` (default)
- `anthropic/claude-3-5-sonnet-20241022` - Best reasoning
- `google/gemini-2.0-flash-exp:free` - Free option
- `meta-llama/llama-3.1-70b-instruct` - Open source
- `deepseek/deepseek-chat` - Via OpenRouter

**Get API Key:** https://openrouter.ai/keys

**Pricing:** Pay-per-use across multiple providers

---

### 4. Custom Provider

**Features:** Depends on your endpoint

For any OpenAI-compatible API endpoint:

```env
LLM_PROVIDER=custom
API_KEY=your-api-key
CUSTOM_API_BASE_URL=https://your-api.example.com/v1
CUSTOM_MODEL_NAME=your-model-name
```

**Examples:**
- Self-hosted models (vLLM, Ollama with OpenAI compatibility)
- Private cloud deployments
- Enterprise API gateways
- Other OpenAI-compatible services

---

## Configuration

### Environment Variables

Set these in your Netlify Dashboard under **Site settings → Environment variables**:

#### Required:
```env
LLM_PROVIDER=openai                    # or: deepseek, openrouter, custom
API_KEY=your-api-key-here              # Primary provider's API key
```

#### Optional:
```env
MODEL_NAME=gpt-4o                      # Override default model
API_BASE_URL=https://custom-url.com    # Override base URL
OPENAI_API_KEY=sk-xxx                  # Fallback for TTS/Whisper
DEBUG_LLM=true                         # Enable debug logging
```

### Example Configurations

#### Using Deepseek for Chat, OpenAI for TTS/Whisper

```env
LLM_PROVIDER=deepseek
API_KEY=your-deepseek-key
OPENAI_API_KEY=sk-your-openai-key
```

- Chat requests → Deepseek
- TTS/Whisper → OpenAI (fallback)
- **Result:** Save costs on chat, still have full features

#### Using OpenRouter with Claude

```env
LLM_PROVIDER=openrouter
API_KEY=your-openrouter-key
MODEL_NAME=anthropic/claude-3-5-sonnet-20241022
APP_URL=https://your-app.netlify.app
OPENAI_API_KEY=sk-your-openai-key
```

- Chat → Claude 3.5 Sonnet via OpenRouter
- TTS/Whisper → OpenAI

#### Using OpenAI with GPT-4o

```env
LLM_PROVIDER=openai
API_KEY=sk-your-openai-key
MODEL_NAME=gpt-4o
```

- Everything uses OpenAI GPT-4o

---

## Provider-Specific Setup

### Setting up Deepseek

1. **Create Account:** https://platform.deepseek.com
2. **Get API Key:** Navigate to API Keys section
3. **Add to Netlify:**
   ```env
   LLM_PROVIDER=deepseek
   API_KEY=your-deepseek-key
   ```
4. **Optional - Add TTS/Whisper:**
   ```env
   OPENAI_API_KEY=sk-your-openai-key
   ```

**Benefits:**
- 🇨🇳 Excellent Chinese language understanding
- 💰 Very competitive pricing
- ⚡ Fast response times

### Setting up OpenRouter

1. **Create Account:** https://openrouter.ai
2. **Add Credits:** Minimum $5
3. **Get API Key:** https://openrouter.ai/keys
4. **Add to Netlify:**
   ```env
   LLM_PROVIDER=openrouter
   API_KEY=sk-or-v1-your-key
   APP_URL=https://your-app.netlify.app
   MODEL_NAME=openai/gpt-4o-mini
   ```

**Benefits:**
- 🎯 Access 100+ models
- 💸 Compare pricing across providers
- 🔄 Easy model switching
- 📊 Built-in usage analytics

**Popular Model Choices:**
```env
# Cheapest: Free tier
MODEL_NAME=google/gemini-2.0-flash-exp:free

# Best value: Fast and cheap
MODEL_NAME=openai/gpt-4o-mini

# Best quality: Reasoning powerhouse
MODEL_NAME=anthropic/claude-3-5-sonnet-20241022

# Chinese-optimized: Via OpenRouter
MODEL_NAME=deepseek/deepseek-chat
```

### Setting up Custom Provider

For self-hosted or custom endpoints:

1. **Ensure OpenAI SDK compatibility**
2. **Get your endpoint URL and API key**
3. **Add to Netlify:**
   ```env
   LLM_PROVIDER=custom
   API_KEY=your-api-key
   CUSTOM_API_BASE_URL=https://your-endpoint.com/v1
   CUSTOM_MODEL_NAME=your-model-name
   ```

**Common Use Cases:**
- vLLM deployment
- Ollama with OpenAI compatibility layer
- Azure OpenAI Service
- Private cloud LLM endpoints

---

## Feature Support Matrix

| Provider | Chat | TTS | Whisper | Notes |
|----------|------|-----|---------|-------|
| **OpenAI** | ✅ | ✅ | ✅ | Full support |
| **Deepseek** | ✅ | ❌* | ❌* | Set OPENAI_API_KEY for fallback |
| **OpenRouter** | ✅ | ❌* | ❌* | Set OPENAI_API_KEY for fallback |
| **Custom** | ✅ | ❌* | ❌* | Depends on endpoint |

*\* Fallback: If you set `OPENAI_API_KEY`, the app will automatically use OpenAI for TTS and Whisper while using your primary provider for chat.*

---

## Troubleshooting

### Error: "TTS not supported"

**Cause:** Current provider doesn't support Text-to-Speech

**Solution:**
```env
# Add OpenAI API key for TTS fallback
OPENAI_API_KEY=sk-your-openai-key
```

### Error: "Speech-to-Text not supported"

**Cause:** Current provider doesn't support Whisper

**Solution:**
```env
# Add OpenAI API key for Whisper fallback
OPENAI_API_KEY=sk-your-openai-key
```

### Error: "Failed to generate response"

**Possible causes:**
1. Invalid API key
2. Insufficient credits
3. Wrong model name
4. Rate limiting

**Debug steps:**
1. Enable debug logging:
   ```env
   DEBUG_LLM=true
   ```
2. Check Netlify Function logs
3. Verify API key is valid
4. Check provider dashboard for errors

### Chat works but features are missing

If using Deepseek/OpenRouter without OpenAI fallback:
- 🔇 Speaker icon won't work (no TTS)
- 🎤 Microphone won't work (no Whisper)

**Solution:** Add `OPENAI_API_KEY` for these features

### Model not found

**Error:** `The model 'xyz' does not exist`

**Solution:** Check provider's model list and update:
```env
MODEL_NAME=correct-model-name
```

---

## Cost Optimization Tips

### 1. Mix Providers

Use cheap provider for chat, OpenAI only for TTS/Whisper:
```env
LLM_PROVIDER=deepseek
API_KEY=deepseek-key
OPENAI_API_KEY=openai-key
```

### 2. Use Free Tiers

OpenRouter offers free models:
```env
MODEL_NAME=google/gemini-2.0-flash-exp:free
```

### 3. Monitor Usage

- OpenAI: https://platform.openai.com/usage
- Deepseek: https://platform.deepseek.com/usage
- OpenRouter: https://openrouter.ai/activity

### 4. Set Spending Limits

All providers allow setting monthly spending limits.

---

## Advanced Configuration

### Using Multiple Models

You can't configure multiple models via env vars, but you can:

1. **Switch anytime** by changing `MODEL_NAME`
2. **Deploy multiple instances** with different configs
3. **Test locally** with different `.env.local` files

### Local Development

```bash
# Copy example env
cp .env.local.example .env.local

# Edit with your settings
nano .env.local

# Test locally
npm run dev:netlify
```

### Provider Switching Workflow

1. Update environment variables in Netlify
2. Trigger redeploy
3. Test all features
4. Monitor costs

**No code changes needed!** ✨

---

## Getting Help

- **Issues:** https://github.com/Pruetpong/chinese-interpreter-for-dsu-school-trip/issues
- **OpenAI Docs:** https://platform.openai.com/docs
- **Deepseek Docs:** https://platform.deepseek.com/api-docs
- **OpenRouter Docs:** https://openrouter.ai/docs

---

**Happy LLM switching! 🚀**
