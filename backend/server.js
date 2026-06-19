// Express entry point. Wires middleware, routes, error handler and starts the
// server once Mongo is reachable.

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectDB, dbStatus } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const resultRoutes = require('./routes/resultRoutes');

const app = express();

// Trust the platform proxy (Render, Heroku, etc.) so things like rate limits
// and req.ip read the real client address.
app.set('trust proxy', 1);

// Security headers and JSON body parsing.
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

// CORS: only allow the configured client origin. Falls back to '*' in dev so a
// fresh checkout still works without setting CLIENT_URL.
const origin = process.env.CLIENT_URL || '*';
app.use(
  cors({
    origin,
    credentials: true,
  })
);

// Dev logging only — keeps prod logs clean.
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check used by Render and uptime probes. Lives outside /api so it's
// not subject to rate limits or auth.
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    db: dbStatus(),
  });
});

// API info root.
app.get('/api', (_req, res) => {
  res.json({
    name: 'School Portal API',
    version: '1.0.0',
    endpoints: ['/api/auth', '/api/users', '/api/courses', '/api/results'],
  });
});

// Rate limit anything under /api to slow down brute-force attempts.
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { message: 'Too many requests, slow down a bit.' } },
  })
);

// Mount routes.
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/results', resultRoutes);

// 404 for anything that didn't match above.
app.use((req, res) => {
  res.status(404).json({ error: { message: `Route not found: ${req.method} ${req.originalUrl}` } });
});

// Central error handler (must be the last middleware).
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect Mongo first, then start listening. If the DB fails we exit so the
// platform restarts us rather than serving traffic with a dead backend.
(async () => {
  try {
    await connectDB();
    console.log('[db] connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`[server] listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  } catch (err) {
    console.error('[fatal] failed to start:', err.message);
    process.exit(1);
  }
})();
