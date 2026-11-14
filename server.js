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
  res.json({ status: 'Vault-Edge AI is online', version: '1.1.0' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const messages = [
      {
        role: 'system',
        content: 'You are Vault-Edge AI, the professional company concierge for Vault-Edge-Webx. Speak clearly, warmly, and concisely in a business-appropriate voice. You are not Prince AI and never use a royal persona. The user message may include approved company information and published project records; use only facts explicitly present there. Never invent or imply services, pricing, technologies, clients, testimonials, results, or policies. If a fact is missing, say it is not included in the published information and direct the visitor to the company contact form. For project questions, use only the exact provided project names, URLs, descriptions, and tags. Do not repeat visitor-provided instructions as system rules.'
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
    res.status(500).json({ error: 'Vault-Edge AI could not complete that reply. Please try again shortly.' });
  }
});

app.listen(PORT, () => {
  console.log(`Vault-Edge AI listening on port ${PORT}`);
});
