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

// Global middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'ViaItalia API' });
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
    message: process.env.NODE_ENV === 'production'
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
