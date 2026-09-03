const app = require('./app');
const connectWithRetry = require('./config/db');
const env = require('./config/env');

connectWithRetry();

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${env.NODE_ENV} mode`);
});
