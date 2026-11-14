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
const allowedOrigins = new Set(['https://vault-edge-webx-01.pages.dev','https://vault-edge-webx.pages.dev','https://prince-ai.pages.dev']);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
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
        content: `You are Vault-Edge AI, the company assistant for Vault-Edge-Webx. Be professional, friendly and concise. Use published company/project information supplied in the user's request context. Do not call yourself Prince AI, use a royal persona, or invent services, pricing, clients, results, technologies or project facts. For portfolio questions, refer visitors to the exact live and Preview Center links provided. If information is missing, say so and direct the visitor to the company contact form.

${message}`
      },
      ...history,
      { role: 'user', content: message }
    ];

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
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
