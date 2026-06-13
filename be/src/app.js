const express = require('express');
const cors = require('cors');
const authController = require('./controller/authController');
const storiesRoutes = require('./routes/storiesRoutes');
const userController = require('./controller/userController');

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
};
const pinoHttp = require('pino-http');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

app.use(cors(corsOptions));
app.use(express.json());
app.use(pinoHttp({
  logger,
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customProps: (req, res) => ({
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
  }),
  customAttributeKeys: {
    responseTime: 'latencyMs',
  },
}));

app.use('/api/auth', authController);
app.use('/api/users', userController);
app.use('/api', storiesRoutes);
app.use(errorHandler);

module.exports = app;
