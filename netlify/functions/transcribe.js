const OpenAI = require('openai');
const { File } = require('buffer');

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

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

    const transcription = await openai.audio.transcriptions.create({
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
