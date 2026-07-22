require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeContainer } = require('./config/azure');
const fileRoutes = require('./routes/fileRoutes');

const app = express();

// Initialize Azure container
initializeContainer();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'DELETE'],
  })
);
app.use(express.json());

// Routes
app.use('/', fileRoutes);

// Health endpoint
app.get('/health', (_, res) => res.json({ status: 'ok' }));

module.exports = app;
