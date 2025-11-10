/**
 * Config Check Endpoint - สำหรับตรวจสอบ API configuration
 *
 * Endpoint นี้จะแสดงข้อมูล configuration ปัจจุบันโดยไม่แสดง API key
 * เพื่อช่วยในการ debug ปัญหาการเชื่อมต่อ API
 *
 * Usage: GET /api/config-check
 */

const { getProviderConfig } = require('./llm-config');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Get provider configuration
    const config = getProviderConfig();

    // Check if API key is set
    const hasApiKey = !!process.env.API_KEY;
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

    // Mask API key (show only first 7 and last 4 characters)
    const maskApiKey = (key) => {
      if (!key) return null;
      if (key.length < 12) return '***';
      return `${key.substring(0, 7)}...${key.substring(key.length - 4)}`;
    };

    // Prepare response data
    const configInfo = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      provider: {
        name: config.name,
        type: config.provider,
        baseURL: config.baseURL,
        model: config.model,
        supportsTTS: config.supportsTTS,
        supportsWhisper: config.supportsWhisper,
      },
      apiKeys: {
        hasApiKey: hasApiKey,
        apiKeyPreview: maskApiKey(process.env.API_KEY),
        hasOpenAIFallback: hasOpenAIKey,
        openAIKeyPreview: maskApiKey(process.env.OPENAI_API_KEY),
      },
      environmentVariables: {
        LLM_PROVIDER: process.env.LLM_PROVIDER || '(not set, using default)',
        API_BASE_URL: process.env.API_BASE_URL || '(not set, using provider default)',
        MODEL_NAME: process.env.MODEL_NAME || '(not set, using provider default)',
        DEBUG_LLM: process.env.DEBUG_LLM || 'false',
        NODE_ENV: process.env.NODE_ENV || '(not set)',
      },
      recommendations: [],
    };

    // Add recommendations based on configuration
    if (!hasApiKey) {
      configInfo.recommendations.push({
        severity: 'CRITICAL',
        message: 'API_KEY is not set. Please set it in Netlify Environment Variables.',
        action: 'Go to Netlify Dashboard > Site Settings > Environment Variables and add API_KEY',
      });
    }

    if (config.provider === 'deepseek' && !hasOpenAIKey) {
      configInfo.recommendations.push({
        severity: 'WARNING',
        message: 'Using Deepseek without OpenAI fallback. TTS and Whisper features will not work.',
        action: 'Consider setting OPENAI_API_KEY for TTS/Whisper fallback support',
      });
    }

    if (config.provider === 'openrouter' && !process.env.APP_URL) {
      configInfo.recommendations.push({
        severity: 'WARNING',
        message: 'APP_URL is not set for OpenRouter. Using default value.',
        action: 'Set APP_URL environment variable to your site URL',
      });
    }

    if (config.provider === 'custom' && !process.env.CUSTOM_API_BASE_URL) {
      configInfo.recommendations.push({
        severity: 'CRITICAL',
        message: 'Using custom provider but CUSTOM_API_BASE_URL is not set.',
        action: 'Set CUSTOM_API_BASE_URL environment variable',
      });
    }

    // Add health status
    configInfo.health = {
      configured: hasApiKey,
      ready: hasApiKey && (config.baseURL ? true : false),
      warnings: configInfo.recommendations.filter(r => r.severity === 'WARNING').length,
      errors: configInfo.recommendations.filter(r => r.severity === 'CRITICAL').length,
    };

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(configInfo, null, 2),
    };
  } catch (error) {
    console.error('Config check error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'error',
        message: 'Failed to check configuration',
        error: error.message,
      }),
    };
  }
};
