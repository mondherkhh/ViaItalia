require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const universityInfoRoutes = require('./routes/universityInfoRoutes');
const messageRoutes = require('./routes/messageRoutes');
const emailRoutes = require('./routes/emailRoutes');
const contractRoutes = require('./routes/contractRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const studyFormRoutes = require('./routes/studyFormRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const universityProgramRoutes = require('./routes/universityProgramRoutes');
const admissionsSyncRoutes = require('./routes/admissionsSyncRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const dossierRoutes = require('./routes/dossierRoutes');

const app = express();

/*
 * Production CORS configuration
 *
 * The explicit middleware below handles OPTIONS requests before the routes
 * and before the 404 handler. This prevents the browser preflight request
 * from receiving a 404 response.
 */
const configuredOrigins = [
  process.env.CLIENT_URL,
  'https://via-italia-nine.vercel.app',
  'http://localhost:3000',
  'http://localhost:5000'
]
  .filter(Boolean)
  .map((origin) => origin.trim().replace(/\/$/, ''));

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const normalizedOrigin = origin.trim().replace(/\/$/, '');

  // Allow the configured production/development origins.
  if (configuredOrigins.includes(normalizedOrigin)) {
    return true;
  }

  // Allow Vercel preview deployments as well.
  if (/^https:\/\/.*\.vercel\.app$/i.test(normalizedOrigin)) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization'
  ],
  optionsSuccessStatus: 204
};

// Explicitly answer every browser preflight request before any API route.
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  if (req.method === 'OPTIONS') {
    if (origin && !isAllowedOrigin(origin)) {
      return res.status(403).json({
        success: false,
        message: 'CORS origin not allowed'
      });
    }

    return res.status(204).end();
  }

  next();
});

// Keep cors middleware for normal GET/POST/PUT/PATCH/DELETE responses.
app.use(cors(corsOptions));

// Request body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ViaItalia API'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/university-info', universityInfoRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/study-forms', studyFormRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/university-programs', universityProgramRoutes);
app.use('/api/admissions-sync', admissionsSyncRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dossiers', dossierRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route introuvable: ${req.method} ${req.originalUrl}`
  });
});

// Central error handler
app.use((error, req, res, next) => {
  console.error('Unhandled server error:', error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(error.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Une erreur interne est survenue.'
        : error.message
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Admissions sync route: /api/admissions-sync');
});

module.exports = app;
