const express = require('express');
const cors = require('cors');
const authController = require('./controller/authController');
const storiesRoutes = require('./routes/storiesRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authController);
app.use('/api', storiesRoutes);

module.exports = app;
