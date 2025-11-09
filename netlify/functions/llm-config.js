/**
 * LLM Provider Configuration
 *
 * This file contains configuration for different LLM providers.
 * Supports: OpenAI, Deepseek, OpenRouter, and any OpenAI-compatible API
 */

// Provider presets
const PROVIDERS = {
  openai: {
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    supportsTTS: true,
    supportsWhisper: true,
  },
  deepseek: {
    name: 'Deepseek',
    baseURL: 'https://api.deepseek.com',
    defaultModel: 'deepseek-chat',
    supportsTTS: false,
    supportsWhisper: false,
  },
  openrouter: {
    name: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-4o-mini',
    supportsTTS: false,
    supportsWhisper: false,
    // OpenRouter requires additional headers
    extraHeaders: {
      'HTTP-Referer': process.env.APP_URL || 'https://chinese-interpreter.netlify.app',
      'X-Title': 'Chinese Interpreter for Chengdu',
    },
  },
  custom: {
    name: 'Custom Provider',
    baseURL: process.env.CUSTOM_API_BASE_URL,
    defaultModel: process.env.CUSTOM_MODEL_NAME || 'gpt-4o-mini',
    supportsTTS: false,
    supportsWhisper: false,
  },
};

/**
 * Get provider configuration
 * @returns {Object} Provider configuration
 */
function getProviderConfig() {
  const provider = (process.env.LLM_PROVIDER || 'openai').toLowerCase();
  const config = PROVIDERS[provider] || PROVIDERS.openai;

  return {
    provider,
    name: config.name,
    baseURL: process.env.API_BASE_URL || config.baseURL,
    model: process.env.MODEL_NAME || config.defaultModel,
    apiKey: process.env.API_KEY,
    supportsTTS: config.supportsTTS,
    supportsWhisper: config.supportsWhisper,
    extraHeaders: config.extraHeaders || {},
  };
}

/**
 * Create OpenAI client with provider configuration
 * @param {string} apiKey - API key
 * @returns {Object} Configured OpenAI client
 */
function createLLMClient(apiKey) {
  const OpenAI = require('openai');
  const config = getProviderConfig();

  const clientConfig = {
    apiKey: apiKey || config.apiKey,
  };

  // Set custom base URL if different from OpenAI default
  if (config.baseURL && config.baseURL !== 'https://api.openai.com/v1') {
    clientConfig.baseURL = config.baseURL;
  }

  // Add extra headers if needed (e.g., for OpenRouter)
  if (Object.keys(config.extraHeaders).length > 0) {
    clientConfig.defaultHeaders = config.extraHeaders;
  }

  return new OpenAI(clientConfig);
}

/**
 * Get fallback client for TTS/Whisper when primary provider doesn't support them
 * @returns {Object|null} OpenAI client or null
 */
function getFallbackClient() {
  const config = getProviderConfig();
  const fallbackKey = process.env.OPENAI_API_KEY;

  // If current provider supports TTS/Whisper or no fallback key, return null
  if ((config.supportsTTS && config.supportsWhisper) || !fallbackKey) {
    return null;
  }

  const OpenAI = require('openai');
  return new OpenAI({ apiKey: fallbackKey });
}

/**
 * Log provider information (for debugging)
 */
function logProviderInfo() {
  const config = getProviderConfig();
  console.log(`[LLM Config] Using provider: ${config.name}`);
  console.log(`[LLM Config] Base URL: ${config.baseURL}`);
  console.log(`[LLM Config] Model: ${config.model}`);
  console.log(`[LLM Config] TTS Support: ${config.supportsTTS}`);
  console.log(`[LLM Config] Whisper Support: ${config.supportsWhisper}`);
}

module.exports = {
  PROVIDERS,
  getProviderConfig,
  createLLMClient,
  getFallbackClient,
  logProviderInfo,
};
