require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Groq client
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

// CORS - allow your frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Prince AI is ruling', version: '1.0.0' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const messages = [
      {
        role: 'system',
        content: 'You are Prince AI, a royal, sophisticated, and highly intelligent AI assistant. You speak with elegance, wisdom, and authority. You help users with coding, creativity, knowledge, and any task they need. Your tone is noble yet approachable. Always sign off with a royal touch.'
      },
      ...history,
      { role: 'user', content: message }
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048
    });

    const reply = completion.choices[0].message.content;

    res.json({ reply, model: completion.model });

  } catch (error) {
    console.error('Groq Error:', error.message);
    res.status(500).json({ error: 'Royal decree failed', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Prince AI ruling on port ${PORT}`);
});
