require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const contactRoutes  = require('./server/routes/contact');
const projectRoutes  = require('./server/routes/projects');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── CORS ──────────────────────────────────────────────────────────────────────
// In production replace '*' with your actual domain, e.g. 'https://rashal.dev'
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g. same-origin, curl)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// ── BODY PARSING ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // cap body size to prevent abuse

// ── SECURITY HEADERS ─────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ── API ROUTES ────────────────────────────────────────────────────────────────
app.use('/api/contact',  contactRoutes);
app.use('/api/projects', projectRoutes);

// ── SERVE FRONTEND ────────────────────────────────────────────────────────────
// Express serves all the existing HTML/CSS/JS files from the project root
app.use(express.static(path.join(__dirname)));

// Fallback: any unknown route returns index.html (single-page behaviour)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
});
