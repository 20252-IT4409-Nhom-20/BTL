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
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authController);
app.use('/api/users', userController);
app.use('/api', storiesRoutes);

module.exports = app;
