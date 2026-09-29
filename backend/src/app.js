const express = require('express');
const cors = require('cors');
const env = require('./config/env');

const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/authRoutes');
const beneficiaryRoutes = require('./routes/beneficiaryRoutes');
const courseRoutes = require('./routes/courseRoutes');
const centerRoutes = require('./routes/centerRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const outcomeRoutes = require('./routes/outcomeRoutes');
const interventionRoutes = require('./routes/interventionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const ivrRoutes = require('./routes/ivrRoutes');
const schemeRoutes = require('./routes/schemeRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const beneficiaryDocumentRoutes = require('./routes/beneficiaryDocumentRoutes');
const opportunityApplicationRoutes = require('./routes/opportunityApplicationRoutes');
const videoCallRoutes = require('./routes/videoCallRoutes');

const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app._router = app.router;

app.use(cors({ origin: env.CORS_ORIGINS }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'Livelihood Navigator API',
    health: '/api/health',
    apiBase: '/api',
  });
});

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/centres', centerRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/outcomes', outcomeRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/ivr', ivrRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/documents', beneficiaryDocumentRoutes);
app.use('/api/applications', opportunityApplicationRoutes);
app.use('/api/video-calls', videoCallRoutes);

// 404 Handler
app.use(notFoundHandler);

// Error Handler
app.use(errorHandler);

module.exports = app;
