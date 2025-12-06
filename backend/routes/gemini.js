// backend/routes/gemini.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const GEMINI_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_KEY) console.warn('Warning: GEMINI_API_KEY not set in backend/.env');

router.post('/', async (req, res) => {
  try {
    const prompt = (req.body.prompt || req.body.q || '').toString();
    if (!prompt) return res.status(400).json({ ok: false, msg: 'prompt required' });

    // Use Gemini 3 Pro model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro:generateContent?key=${GEMINI_KEY}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      maxOutputTokens: 600,
      temperature: 0.2
    };

    const r = await axios.post(url, payload, { timeout: 60000 });
    const text = r.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    res.json({ ok: true, text });
  } catch (err) {
    console.error('gemini direct error:', err.response?.data || err.message || err);
    res.status(500).json({ ok: false, msg: err.response?.data || err.message || String(err) });
  }
});

module.exports = router;
