require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const documentRoutes = require('./routes/documentRoutes');
const universityInfoRoutes = require('./routes/universityInfoRoutes');
const messageRoutes = require('./routes/messageRoutes');
const messagesAdminRoutes = require('./routes/messagesAdminRoutes');
const emailRoutes = require('./routes/emailRoutes');
const contractRoutes = require('./routes/contractRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const studyFormRoutes = require('./routes/studyFormRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const myPaymentsRoutes = require("./routes/myPaymentsRoutes");
const receiptRoutes = require('./routes/receiptRoutes');
const universityProgramRoutes = require('./routes/universityProgramRoutes');
const admissionsSyncRoutes = require('./routes/admissionsSyncRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const dossierRoutes = require('./routes/dossierRoutes');
const studentTaskRoutes = require('./routes/studentTaskRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const studentRoutes = require('./routes/studentRoutes');
const folderRoutes = require('./routes/folderRoutes');
const adminFolderRoutes = require('./routes/adminFolderRoutes');
const documentAccessRoutes = require('./routes/documentAccessRoutes');
const adminDocumentRoutes = require('./routes/adminDocumentRoutes');
const alertsRoutes = require('./routes/alertsRoutes');
const paymentsAdminRoutes = require('./routes/paymentsAdminRoutes');
const inviteRoutes = require('./routes/inviteRoutes');
const publicInviteRoutes = require('./routes/publicInviteRoutes');
const officesRoutes = require('./routes/officesRoutes');
const agentsRoutes = require('./routes/agentsRoutes');


const studentDocumentRoutes = require('./routes/studentDocumentRoutes');

const app = express();

// Global middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://via-italia-nine.vercel.app'
  ],
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
app.use('/api/messages-admin', messagesAdminRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/study-forms', studyFormRoutes);
app.use('/api/my-payments', myPaymentsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/university-programs', universityProgramRoutes);
app.use('/api/admissions-sync', admissionsSyncRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dossiers', dossierRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/student-tasks', studentTaskRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/payments-admin', paymentsAdminRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/student', studentDocumentRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/public-invites', publicInviteRoutes);
app.use('/api/offices', officesRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/admin/documents', adminDocumentRoutes);
app.use('/api', folderRoutes);
app.use('/api/admin', adminFolderRoutes);
app.use('/api', documentAccessRoutes);

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
