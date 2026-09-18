const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack || err.message || err);

  const statusCode = err.statusCode || 500;
  const message = statusCode >= 500 && process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
