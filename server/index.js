import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { registerSocketHandlers } from './src/socket.js';
import { PRESET_RESTAURANTS, POPULAR_BANKS } from './src/data/presets.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration for REST & WebSockets
const ALLOWED_ORIGIN = process.env.CLIENT_URL || '*';

const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ['GET', 'POST']
  }
});

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

// ------------------------------------------------------------------
// REST Endpoints
// ------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'WebChiaTienQR - Realtime Group Order & Split Bill',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

app.get('/api/presets', (req, res) => {
  res.json(PRESET_RESTAURANTS);
});

app.get('/api/banks', (req, res) => {
  res.json(POPULAR_BANKS);
});

// ------------------------------------------------------------------
// Register Real-time WebSocket Event Handlers
// ------------------------------------------------------------------
registerSocketHandlers(io);

// ------------------------------------------------------------------
// Server Startup
// ------------------------------------------------------------------
const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 WEBCHIATIENQR SERVER RUNNING ON PORT ${PORT}`);
  console.log(`📡 WebSocket Engine ready on ws://0.0.0.0:${PORT}`);
  console.log(`⚡ REST API available on http://localhost:${PORT}/api/presets`);
  console.log(`=======================================================`);
});

export { app, httpServer, io };
