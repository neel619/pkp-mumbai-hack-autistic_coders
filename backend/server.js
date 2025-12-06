// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
app.use(cors());
app.use(express.json());

// ===== Development-friendly CSP (relax while developing) =====
// Move to a stricter policy before production.
app.use((req, res, next) => {
  const csp = [
    // allow same-origin assets and inline for dev
    "default-src 'self' 'unsafe-inline' data: blob:;",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;",
    "style-src 'self' 'unsafe-inline' https:;",
    "img-src 'self' data: blob: https:;",
    // allow devtools/extensions and fetches to localhost
    "connect-src 'self' http://localhost:5000 http://127.0.0.1:5000 ws://localhost:5000;",
    "frame-ancestors 'none';",
    "base-uri 'self'"
  ].join(' ');
  res.setHeader('Content-Security-Policy', csp);
  next();
});

// ===== Serve static files from /backend/public (optional) =====
// Create backend/public/index.html or backend/public/.well-known/... to serve files.
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// ===== API routes =====
app.use('/api', apiRoutes);

// ===== Root route (friendly message or serve index.html) =====
app.get('/', (req, res) => {
  // If you have an index.html in backend/public, this will serve it automatically
  // This fallback sends a small HTML response so "Cannot GET /" disappears.
  res.send(`
    <html>
      <head><meta charset="utf-8"><title>PKP Backend</title></head>
      <body style="font-family: Arial, sans-serif; padding: 24px;">
        <h2>PKP Backend</h2>
        <p>API is available at <code>/api</code>. Health: <a href="/health">/health</a></p>
      </body>
    </html>
  `);
});

// healthcheck
app.get('/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));

// catch-all 404 for non-API routes (optional)
app.use((req, res) => {
  res.status(404).json({ ok: false, msg: 'Not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
