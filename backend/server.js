// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const apiRoutes = require('./routes/api');       // keep if exists
const agentRoutes = require('./routes/agent');   // offline agent
const geminiDirect = require('./routes/gemini'); // direct Gemini
const geminiRag = require('./routes/gemini-rag');// RAG + Gemini

const app = express();

// allow frontend dev origin
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000']
}));
app.use(express.json());

// Dev-friendly CSP (remove or tighten before production)
app.use((req, res, next) => {
  const csp = [
    "default-src 'self' 'unsafe-inline' data: blob:;",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;",
    "style-src 'self' 'unsafe-inline' https:;",
    "img-src 'self' data: blob: https:;",
    "connect-src 'self' http://localhost:5000 http://127.0.0.1:5000 http://localhost:3000 http://127.0.0.1:3000 ws://localhost:5000;",
    "frame-ancestors 'none';",
    "base-uri 'self'"
  ].join(' ');
  res.setHeader('Content-Security-Policy', csp);
  next();
});

// static public files (if any)
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// mount routes
if (apiRoutes) app.use('/api', apiRoutes);
app.use('/api/agent', agentRoutes);     // offline RAG agent
app.use('/api/gemini', geminiDirect);   // direct Gemini (fallback)
app.use('/api/gemini-rag', geminiRag);  // recommended RAG + Gemini 3 Pro

// root & health
app.get('/', (req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send(`
      <html>
        <head><meta charset="utf-8"><title>PKP Backend</title></head>
        <body style="font-family:Arial;padding:20px;">
          <h2>PKP Backend</h2>
          <p>APIs: <code>/api/agent</code> (offline), <code>/api/gemini</code> (direct), <code>/api/gemini-rag</code> (RAG+Gemini)</p>
          <p>Health: <a href="/health">/health</a></p>
        </body>
      </html>
    `);
  }
});
app.get('/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));

// fallback 404
app.use((req, res) => res.status(404).json({ ok: false, msg: 'Not found' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
