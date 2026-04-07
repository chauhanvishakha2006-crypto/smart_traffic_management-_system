const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const TrafficEngine = require('./simulation/trafficEngine');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow Vite dev server
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-traffic';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB:', MONGO_URI))
  .catch(err => {
    console.warn('MongoDB connection failed. Running simulation without DB logging.');
    // We do not exit the process, allow the app to work without DB for testing
  });

// Initialize simulation engine
const engine = new TrafficEngine(io);
engine.start();

// Socket.io connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send initial state
  socket.emit('trafficUpdate', {
    intersections: engine.intersections,
    metrics: engine.metrics
  });

  socket.on('triggerEmergency', ({ id, state }) => {
    console.log(`Emergency mode ${state ? 'ENABLED' : 'DISABLED'} for intersection ${id}`);
    engine.setEmergency(id, state);
  });

  socket.on('changeDensity', ({ id, direction, amount }) => {
    console.log(`Manual density change for ${id} ${direction}: ${amount}`);
    engine.setDensity(id, direction, amount);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'Running', activeIntersections: engine.intersections.length });
});

server.listen(PORT, () => {
  console.log(`Smart Traffic Backend running on port ${PORT}`);
});
