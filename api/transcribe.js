import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { audioData, mimeType } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(audioData, 'base64');

    // Create a File-like object from buffer
    const audioFile = new File([buffer], 'audio.webm', { type: mimeType || 'audio/webm' });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'zh', // Support both Chinese and Thai
    });

    res.status(200).json({ text: transcription.text });
  } catch (error) {
    console.error('Transcription API error:', error);
    res.status(500).json({
      error: 'Failed to transcribe audio',
      message: error.message
    });
  }
}
