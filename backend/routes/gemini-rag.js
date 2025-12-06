// backend/routes/gemini-rag.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const Fuse = require('fuse.js');

const router = express.Router();
const DATA_PATH = path.join(__dirname, '..', 'data', 'content.json');
const GEMINI_KEY = process.env.GEMINI_API_KEY;

async function readData() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

function buildContext(items) {
  return items
    .map(item => {
      const steps = (item.steps || []).slice(0,6).map((s,i)=>`${i+1}. ${s}`).join(' | ');
      return `[SRC:${item.id}] ${item.title} — ${item.summary}${steps ? ` Steps: ${steps}` : ''}`;
    }).join('\n\n');
}

function buildPrompt(question, contextText) {
  return `
You are CivicGuard AI — a careful legal assistant. Use ONLY the provided knowledge snippets and do not invent laws.
Knowledge:
${contextText}

User question:
"${question}"

Task:
Return STRICT JSON only in this exact schema:
{"status":"OK"|"NOT_IN_KB","issue":"<short>","answer":"<short>","steps":["..."],"template":"<text>","sources":["c1","c2"]}

If you cannot answer from the knowledge, return:
{"status":"NOT_IN_KB","message":"..."}
`;
}

router.post('/', async (req, res) => {
  try {
    const q = (req.body.q || req.body.prompt || '').toString().trim();
    if (!q) return res.status(400).json({ ok: false, msg: 'query required' });

    const data = await readData();
    const list = data.cards || [];

    const fuse = new Fuse(list, {
      keys: ['title','summary','category','steps'],
      threshold: 0.45,
      includeScore: true,
      ignoreLocation: true
    });

    const rawHits = fuse.search(q).slice(0,5);
    if (!rawHits || rawHits.length === 0) {
      return res.json({ ok: true, status: 'NOT_IN_KB', message: 'No relevant content found in knowledge base.' });
    }

    const hits = rawHits.map(h => ({ score: h.score, item: h.item }));
    const contextText = buildContext(hits.map(h => h.item));
    const prompt = buildPrompt(q, contextText);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro:generateContent?key=${GEMINI_KEY}`;
    const payload = { contents:[{ parts:[{ text: prompt }] }], maxOutputTokens: 800, temperature: 0.0 };

    const r = await axios.post(url, payload, { timeout: 90000 });
    const outText = r.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // parse JSON strict output
    try {
      const parsed = JSON.parse(outText);
      return res.json({ ok: true, parsed: true, result: parsed, hits: hits.map(h=>({ id: h.item.id, title: h.item.title, score: h.score })) });
    } catch (e) {
      // fallback: return raw + hits for transparency
      return res.json({ ok: true, parsed: false, raw: outText, hits: hits.map(h=>({ id: h.item.id, title: h.item.title, score: h.score })) });
    }
  } catch (err) {
    console.error('gemini-rag error:', err.response?.data || err.message || err);
    return res.status(500).json({ ok: false, msg: err.response?.data || err.message || String(err) });
  }
});

module.exports = router;
