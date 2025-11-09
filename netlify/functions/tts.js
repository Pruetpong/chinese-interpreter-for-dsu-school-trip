const { createLLMClient, getFallbackClient, getProviderConfig } = require('./llm-config');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Check if API key is configured
  if (!process.env.API_KEY) {
    console.error('API_KEY environment variable is not set');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Server configuration error',
        message: 'API_KEY environment variable is not configured. Please set it in Netlify dashboard.'
      }),
    };
  }

  const config = getProviderConfig();

  // Use primary provider if it supports TTS, otherwise use fallback (OpenAI)
  let ttsClient = null;
  if (config.supportsTTS) {
    ttsClient = createLLMClient(process.env.API_KEY);
  } else {
    ttsClient = getFallbackClient();
    if (!ttsClient) {
      return {
        statusCode: 501,
        headers,
        body: JSON.stringify({
          error: 'TTS not supported',
          message: `Current provider (${config.name}) does not support TTS. Please set OPENAI_API_KEY environment variable for fallback, or switch to OpenAI provider.`
        }),
      };
    }
    console.log(`[TTS] Using OpenAI fallback (current provider: ${config.name})`);
  }

  try {
    const { text } = JSON.parse(event.body);

    if (!text) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Text is required' }),
      };
    }

    const mp3 = await ttsClient.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: text,
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'audio/mpeg',
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('TTS API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to generate speech',
        message: error.message,
      }),
    };
  }
};
