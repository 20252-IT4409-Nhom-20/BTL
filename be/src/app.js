const express = require('express');
const cors = require('cors');
const authController = require('./controller/authController');
const storiesRoutes = require('./routes/storiesRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authController);
app.use('/api', storiesRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
    res.redirect('/api-docs');
});

module.exports = app;
