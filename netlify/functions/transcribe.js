const { createLLMClient, getFallbackClient, getProviderConfig } = require('./llm-config');
const { File } = require('buffer');

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

  // Use primary provider if it supports Whisper, otherwise use fallback (OpenAI)
  let whisperClient = null;
  if (config.supportsWhisper) {
    whisperClient = createLLMClient(process.env.API_KEY);
  } else {
    whisperClient = getFallbackClient();
    if (!whisperClient) {
      return {
        statusCode: 501,
        headers,
        body: JSON.stringify({
          error: 'Speech-to-Text not supported',
          message: `Current provider (${config.name}) does not support Whisper. Please set OPENAI_API_KEY environment variable for fallback, or switch to OpenAI provider.`
        }),
      };
    }
    console.log(`[Whisper] Using OpenAI fallback (current provider: ${config.name})`);
  }

  try {
    const { audioData, mimeType } = JSON.parse(event.body);

    if (!audioData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Audio data is required' }),
      };
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(audioData, 'base64');

    // Create a File-like object from buffer
    const audioFile = new File([buffer], 'audio.webm', {
      type: mimeType || 'audio/webm'
    });

    const transcription = await whisperClient.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'zh', // Support both Chinese and Thai
    });

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: transcription.text }),
    };
  } catch (error) {
    console.error('Transcription API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to transcribe audio',
        message: error.message,
      }),
    };
  }
};
