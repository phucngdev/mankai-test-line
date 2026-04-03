import { useState } from 'react';

export function VoiceJapan() {
  const [loading, setLoading] = useState(false);

  const speak = async (text: string) => {
    if (!text) return;
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/tts', {
        body: JSON.stringify({ text }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      const data = await res.json();

      if (data.audio) {
        const audio = new Audio(data.audio);
        audio.play();
      }
    } catch (err) {
      console.error('TTS error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { loading, speak };
}
