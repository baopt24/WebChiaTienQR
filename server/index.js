import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { registerSocketHandlers } from './src/socket.js';
import { 
  PRESET_RESTAURANTS, 
  POPULAR_BANKS,
  addRestaurant,
  updateRestaurant,
  deleteRestaurant,
  addDishToRestaurant,
  updateDish,
  deleteDish
} from './src/data/presets.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration for REST & WebSockets
const ALLOWED_ORIGIN = process.env.CLIENT_URL || '*';

const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

// ------------------------------------------------------------------
// REST Endpoints (Public)
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
// REST Endpoints (Dedicated Admin Portal)
// ------------------------------------------------------------------
// 1. Get all restaurants & menus
app.get('/api/admin/restaurants', (req, res) => {
  res.json({ success: true, data: PRESET_RESTAURANTS });
});

// 2. Add restaurant
app.post('/api/admin/restaurants', (req, res) => {
  const { name, category, image, address } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Tên quán là bắt buộc!' });
  const created = addRestaurant({ name, category, image, address });
  io.emit('global_catalog_updated', PRESET_RESTAURANTS);
  res.status(201).json({ success: true, data: created });
});

// 3. Update restaurant
app.put('/api/admin/restaurants/:id', (req, res) => {
  const updated = updateRestaurant(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Không tìm thấy quán!' });
  io.emit('global_catalog_updated', PRESET_RESTAURANTS);
  res.json({ success: true, data: updated });
});

// 4. Delete restaurant
app.delete('/api/admin/restaurants/:id', (req, res) => {
  const ok = deleteRestaurant(req.params.id);
  if (!ok) return res.status(404).json({ success: false, message: 'Không tìm thấy quán!' });
  io.emit('global_catalog_updated', PRESET_RESTAURANTS);
  res.json({ success: true, message: 'Đã xóa quán thành công!' });
});

// 5. Add dish to restaurant
app.post('/api/admin/restaurants/:id/dishes', (req, res) => {
  const { name, price, image, category, desc } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Tên món là bắt buộc!' });
  const dish = addDishToRestaurant(req.params.id, { name, price, image, category, desc });
  if (!dish) return res.status(404).json({ success: false, message: 'Không tìm thấy quán!' });
  io.emit('global_catalog_updated', PRESET_RESTAURANTS);
  res.status(201).json({ success: true, data: dish });
});

// 6. Update dish
app.put('/api/admin/restaurants/:id/dishes/:dishId', (req, res) => {
  const updated = updateDish(req.params.id, req.params.dishId, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn!' });
  io.emit('global_catalog_updated', PRESET_RESTAURANTS);
  res.json({ success: true, data: updated });
});

// 7. Delete dish
app.delete('/api/admin/restaurants/:id/dishes/:dishId', (req, res) => {
  const ok = deleteDish(req.params.id, req.params.dishId);
  if (!ok) return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn!' });
  io.emit('global_catalog_updated', PRESET_RESTAURANTS);
  res.json({ success: true, message: 'Đã xóa món ăn thành công!' });
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
  console.log(`🛠️ Admin REST APIs active on http://localhost:${PORT}/api/admin/restaurants`);
  console.log(`=======================================================`);
});

export { app, httpServer, io };
