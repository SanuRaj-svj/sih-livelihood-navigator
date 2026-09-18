const express = require('express');
const mongoose = require('mongoose');
const env = require('../config/env');
const router = express.Router();

router.get('/health', async (req, res) => {
  let aiService = 'unreachable';
  try {
    const response = await fetch(`${env.AI_SERVICE_URL}/v1/health`, {
      signal: AbortSignal.timeout(env.AI_SERVICE_HEALTH_TIMEOUT_MS),
    });
    aiService = response.ok ? 'online' : `unhealthy_${response.status}`;
  } catch (error) {
    aiService = 'unreachable';
  }

  const mongoService = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const healthy = mongoService === 'connected';
  res.status(healthy ? 200 : 503).json({
    success: healthy,
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: { api: 'online', mongodb: mongoService, ai_service: aiService },
  });
});

module.exports = router;
