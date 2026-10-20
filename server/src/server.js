import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { calculateSplitBill } from './vietqr.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// In-Memory Database
const rooms = new Map();

// Preset restaurants for instant testing & demo
const PRESET_RESTAURANTS = [
  {
    id: 'mixue',
    name: 'Trà sữa Mixue (Làng ĐH - VKU)',
    category: 'Trà sữa & Kem',
    items: [
      { id: 'mx-1', name: 'Trà sữa Trân châu đường đen', price: 25000, desc: 'Đậm vị trà, trân châu dai giòn' },
      { id: 'mx-2', name: 'Trà Đào bốn mùa', price: 22000, desc: 'Thơm đào tươi, giải nhiệt' },
      { id: 'mx-3', name: 'Kem ốc quế Lắc dâu', price: 12000, desc: 'Kem vani ốc quế xốt dâu' },
      { id: 'mx-4', name: 'Trà Chanh tươi lạnh', price: 15000, desc: 'Vị chua ngọt sảng khoái' },
      { id: 'mx-5', name: 'Nước chanh leo cam', price: 20000, desc: 'Nhiều vitamin C' }
    ]
  },
  {
    id: 'phuclong',
    name: 'Trà sữa Phúc Long',
    category: 'Trà sữa cao cấp',
    items: [
      { id: 'pl-1', name: 'Trà Ô long sữa Phúc Long', price: 45000, desc: 'Đậm đà trà Ô long truyền thống' },
      { id: 'pl-2', name: 'Trà Đào Cam Sả', price: 50000, desc: 'Vị đào thơm kết hợp cam sả tươi' },
      { id: 'pl-3', name: 'Trà sữa Lài', price: 45000, desc: 'Hương lài thoang thoảng' },
      { id: 'pl-4', name: 'Cà phê Phin sữa đá', price: 38000, desc: 'Đậm chất Việt Nam' }
    ]
  },
  {
    id: 'comtam',
    name: 'Cơm tấm & Cơm gà xối mỡ 247',
    category: 'Cơm trưa',
    items: [
      { id: 'ct-1', name: 'Cơm tấm sườn bì chả', price: 35000, desc: 'Sườn nướng mật ong mềm thơm' },
      { id: 'ct-2', name: 'Cơm gà xối mỡ giòn rụm', price: 35000, desc: 'Đùi gà chiên vàng giòn' },
      { id: 'ct-3', name: 'Cơm sườn ốp la', price: 30000, desc: 'Trứng ốp lòng đào' },
      { id: 'ct-4', name: 'Canh rong biển thịt bằm', price: 10000, desc: 'Thanh mát, dễ ăn' }
    ]
  }
];

// Helper to generate 6-character room code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// REST Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', activeRooms: rooms.size, timestamp: new Date() });
});

app.get('/api/presets', (req, res) => {
  res.json(PRESET_RESTAURANTS);
});

// Socket.io Realtime Logic
io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // 1. Create room
  socket.on('create_room', ({ hostName, restaurantName, menu, hostAccount }, callback) => {
    try {
      const roomId = generateRoomCode();
      const newRoom = {
        id: roomId,
        hostName: hostName.trim() || 'Chủ phòng',
        hostSocketId: socket.id,
        restaurantName: restaurantName || 'Quán tự chọn',
        menu: menu || [],
        members: [{ id: socket.id, name: hostName.trim() || 'Chủ phòng', isHost: true }],
        items: [],
        isLocked: false,
        hostAccount: hostAccount || { bankId: 'MB', accountNo: '0987654321', accountName: hostName.trim() },
        bill: null,
        createdAt: new Date()
      };

      rooms.set(roomId, newRoom);
      socket.join(roomId);

      console.log(`[Room Created] ${roomId} by ${newRoom.hostName}`);
      if (typeof callback === 'function') {
        callback({ success: true, room: newRoom });
      }
    } catch (err) {
      console.error('Error creating room:', err);
      if (typeof callback === 'function') callback({ success: false, message: err.message });
    }
  });

  // 2. Join room
  socket.on('join_room', ({ roomId, userName }, callback) => {
    try {
      const room = rooms.get(roomId?.toUpperCase());
      if (!room) {
        if (typeof callback === 'function') callback({ success: false, message: 'Phòng không tồn tại hoặc đã hết hạn!' });
        return;
      }

      // Add user to room members if not exists
      const existingMember = room.members.find(m => m.id === socket.id || m.name.toLowerCase() === userName.trim().toLowerCase());
      if (!existingMember) {
        room.members.push({
          id: socket.id,
          name: userName.trim(),
          isHost: false
        });
      } else {
        existingMember.id = socket.id; // Update socket ID on reconnect
      }

      socket.join(room.id);
      console.log(`[User Joined] ${userName} -> Room ${room.id}`);

      // Broadcast room update to everyone
      io.to(room.id).emit('room_updated', room);

      if (typeof callback === 'function') {
        callback({ success: true, room });
      }
    } catch (err) {
      console.error('Error joining room:', err);
      if (typeof callback === 'function') callback({ success: false, message: err.message });
    }
  });

  // 3. Add Item to cart
  socket.on('add_item', ({ roomId, item }) => {
    const room = rooms.get(roomId);
    if (!room || room.isLocked) return;

    const newItem = {
      id: `${socket.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      dishName: item.dishName,
      price: Number(item.price) || 0,
      note: item.note || '',
      userName: item.userName || 'Ẩn danh',
      userSocketId: socket.id,
      timestamp: new Date()
    };

    room.items.push(newItem);
    console.log(`[Item Added] ${item.dishName} by ${newItem.userName} in ${roomId}`);
    io.to(roomId).emit('room_updated', room);
  });

  // 4. Remove Item from cart
  socket.on('remove_item', ({ roomId, itemId }) => {
    const room = rooms.get(roomId);
    if (!room || room.isLocked) return;

    room.items = room.items.filter(item => item.id !== itemId);
    console.log(`[Item Removed] ${itemId} in ${roomId}`);
    io.to(roomId).emit('room_updated', room);
  });

  // 5. Add custom dish to room menu
  socket.on('add_custom_dish', ({ roomId, dish }) => {
    const room = rooms.get(roomId);
    if (!room || room.isLocked) return;

    const newDish = {
      id: `custom-${Date.now()}`,
      name: dish.name,
      price: Number(dish.price) || 0,
      desc: dish.desc || 'Món do thành viên thêm'
    };

    room.menu.push(newDish);
    io.to(roomId).emit('room_updated', room);
  });

  // 6. Lock room & Calculate bill
  socket.on('lock_room', ({ roomId, discountAmount, shippingFee, hostAccount }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    // Check if requester is host
    if (socket.id !== room.hostSocketId && !room.members.find(m => m.id === socket.id)?.isHost) {
      console.warn(`[Unauthorized lock] Socket ${socket.id} tried to lock room ${roomId}`);
      return;
    }

    room.isLocked = true;
    if (hostAccount) {
      room.hostAccount = { ...room.hostAccount, ...hostAccount };
    }

    // Run fair bill split
    const bill = calculateSplitBill({
      items: room.items,
      members: room.members,
      discountAmount: Number(discountAmount) || 0,
      shippingFee: Number(shippingFee) || 0,
      hostAccount: room.hostAccount
    });

    room.bill = bill;
    console.log(`[Room Locked] ${roomId} - Total: ${bill.grandTotal}đ`);
    io.to(roomId).emit('room_updated', room);
  });

  // 7. Unlock room (in case host wants to let people add more)
  socket.on('unlock_room', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.isLocked = false;
    room.bill = null;
    io.to(roomId).emit('room_updated', room);
  });

  // 8. Disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected] ID: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🚀 GROUP ORDER SERVER RUNNING ON PORT ${PORT}`);
  console.log(`📡 WebSocket server ready for connections!`);
  console.log(`===============================================`);
});
