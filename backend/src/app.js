const express = require('express');

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

const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

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

// 404 Handler
app.use(notFoundHandler);

// Error Handler
app.use(errorHandler);

module.exports = app;
