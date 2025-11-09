const { createLLMClient, getProviderConfig, logProviderInfo } = require('./llm-config');

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
        message: 'API_KEY environment variable is not configured. Please set it in Netlify dashboard under Site settings > Environment variables.'
      }),
    };
  }

  // Get provider configuration
  const config = getProviderConfig();

  // Log provider info (for debugging)
  if (process.env.DEBUG_LLM === 'true') {
    logProviderInfo();
  }

  // Create LLM client with provider settings
  const llmClient = createLLMClient(process.env.API_KEY);

  try {
    const { messages, temperature = 0.7 } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid messages format' }),
      };
    }

    // Non-streaming response for Netlify compatibility
    const completion = await llmClient.chat.completions.create({
      model: config.model,
      messages: messages,
      temperature: temperature,
      stream: false,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: responseText }),
    };
  } catch (error) {
    console.error('Chat API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to generate response',
        message: error.message,
      }),
    };
  }
};
