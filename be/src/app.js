const express = require('express');
const cors = require('cors');
const authController = require('./controller/authController');
const storiesRoutes = require('./routes/storiesRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const allowedOrigins = (
  process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL, ...defaultAllowedOrigins]
    : defaultAllowedOrigins
);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 204,
};
const pinoHttp = require('pino-http');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
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
app.use('/api', storiesRoutes);
app.use(errorHandler);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
    res.redirect('/api-docs');
});

module.exports = app;
