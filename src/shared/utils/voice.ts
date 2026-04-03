import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

const GOOGLE_API_KEY = process.env.GOOGLE_TTS_KEY;

app.post('/tts', async (req, res) => {
  const { text } = req.body;
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`;

  const body = {
    // Nam: B, Nữ: A
    audioConfig: { audioEncoding: 'MP3', speakingRate: 1 },

    input: { text },
    voice: { languageCode: 'ja-JP', name: 'ja-JP-Wavenet-B' },
  };

  const response = await fetch(url, {
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  const data = await response.json();

  if (data.audioContent) {
    res.json({ audio: `data:audio/mp3;base64,${data.audioContent}` });
  } else {
    res.status(500).json({ details: data, error: 'TTS failed' });
  }
});

app.listen(3001, () => console.log('TTS server running on port 3001'));
