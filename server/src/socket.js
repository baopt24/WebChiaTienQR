import { calculateFairSplitBill } from './billSplit.js';

// In-Memory Room Store
export const rooms = new Map();

// Generate readable 4-digit or custom Room ID e.g. "ROOM-8888"
export function generateUniqueRoomId() {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  let id = `ROOM-${randomSuffix}`;
  let attempts = 0;
  while (rooms.has(id) && attempts < 50) {
    id = `ROOM-${Math.floor(1000 + Math.random() * 9000)}`;
    attempts++;
  }
  return id;
}

export function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket Connected] Socket ID: ${socket.id}`);

    /**
     * Phase 1: Room Creation (Host Role)
     * Event: create_room
     */
    socket.on('create_room', ({ hostName, restaurantName, menu, hostAccount }, callback) => {
      try {
        const cleanHost = (hostName || '').trim() || 'Chủ phòng';
        const roomId = generateUniqueRoomId();

        const newRoom = {
          id: roomId,
          hostName: cleanHost,
          hostSocketId: socket.id,
          restaurantName: restaurantName || 'Quán ăn tự chọn',
          menu: Array.isArray(menu) ? menu : [],
          members: [
            { id: socket.id, name: cleanHost, isHost: true, joinedAt: new Date() }
          ],
          items: [],
          isLocked: false,
          hostAccount: {
            bankId: hostAccount?.bankId || 'MB',
            accountNo: hostAccount?.accountNo || '0987654321',
            accountName: hostAccount?.accountName || cleanHost
          },
          feeSettings: {
            shippingFee: 0,
            discountAmount: 0
          },
          billSummary: null,
          createdAt: new Date()
        };

        rooms.set(roomId, newRoom);
        socket.join(roomId);

        console.log(`[Room Created] ${roomId} by Host: ${cleanHost}`);

        if (typeof callback === 'function') {
          callback({ success: true, room: newRoom });
        }
      } catch (err) {
        console.error('Error in create_room:', err);
        if (typeof callback === 'function') {
          callback({ success: false, message: 'Lỗi khi khởi tạo phòng!' });
        }
      }
    });

    /**
     * Phase 1: Room Joining (Member Role)
     * Event: join_room
     */
    socket.on('join_room', ({ roomId, userName }, callback) => {
      try {
        const normalizedId = (roomId || '').trim().toUpperCase();
        const cleanName = (userName || '').trim();

        if (!cleanName) {
          if (typeof callback === 'function') callback({ success: false, message: 'Vui lòng nhập tên của bạn!' });
          return;
        }

        const room = rooms.get(normalizedId);
        if (!room) {
          if (typeof callback === 'function') callback({ success: false, message: 'Phòng không tồn tại hoặc đã đóng!' });
          return;
        }

        // Attach socket to room
        socket.join(room.id);

        // Check if member already in room (reconnect or update socket id)
        const existingMember = room.members.find(
          m => m.name.toLowerCase() === cleanName.toLowerCase() || m.id === socket.id
        );

        if (!existingMember) {
          room.members.push({
            id: socket.id,
            name: cleanName,
            isHost: false,
            joinedAt: new Date()
          });
        } else {
          existingMember.id = socket.id; // Refresh connection
        }

        console.log(`[Member Joined] ${cleanName} joined ${room.id} (Total: ${room.members.length})`);

        // Broadcast updated room state to all clients in this room
        io.to(room.id).emit('room_state', room);
        io.to(room.id).emit('member_joined', { userName: cleanName, members: room.members });

        if (typeof callback === 'function') {
          callback({ success: true, room });
        }
      } catch (err) {
        console.error('Error in join_room:', err);
        if (typeof callback === 'function') {
          callback({ success: false, message: 'Lỗi khi tham gia phòng!' });
        }
      }
    });

    /**
     * Phase 2: Add item to shared cart
     * Event: add_item
     */
    socket.on('add_item', ({ roomId, item }) => {
      const room = rooms.get(roomId);
      if (!room || room.isLocked) return;

      const newItem = {
        id: `${socket.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        dishName: item.dishName,
        price: Math.max(0, Number(item.price) || 0),
        note: (item.note || '').trim(),
        userName: item.userName || 'Thành viên',
        userSocketId: socket.id,
        createdAt: new Date()
      };

      room.items.push(newItem);

      console.log(`[Cart Added] ${newItem.dishName} by ${newItem.userName} in ${roomId}`);

      // Broadcast cart_updated & room_state to all connected clients
      io.to(roomId).emit('cart_updated', { items: room.items });
      io.to(roomId).emit('room_state', room);
    });

    /**
     * Phase 2: Remove item from shared cart
     * Event: remove_item
     */
    socket.on('remove_item', ({ roomId, itemId }) => {
      const room = rooms.get(roomId);
      if (!room || room.isLocked) return;

      const itemToRemove = room.items.find(i => i.id === itemId);
      if (!itemToRemove) return;

      room.items = room.items.filter(i => i.id !== itemId);

      console.log(`[Cart Removed] ${itemToRemove.dishName} from ${roomId}`);

      io.to(roomId).emit('cart_updated', { items: room.items });
      io.to(roomId).emit('room_state', room);
    });

    /**
     * Phase 2: Add custom dish to menu
     * Event: add_custom_dish
     */
    socket.on('add_custom_dish', ({ roomId, dish }) => {
      const room = rooms.get(roomId);
      if (!room || room.isLocked) return;

      const newDish = {
        id: `custom-${Date.now()}`,
        name: dish.name,
        price: Math.max(0, Number(dish.price) || 0),
        category: dish.category || 'Món tự thêm',
        desc: dish.desc || 'Món được thành viên thêm thủ công'
      };

      room.menu.push(newDish);
      io.to(roomId).emit('room_state', room);
    });

    /**
     * Phase 3 & 4: Host Lock Order & Automated Fair Bill-Splitting
     * Event: lock_order
     */
    socket.on('lock_order', ({ roomId, shippingFee, discountAmount, hostAccount }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      // Verify host authority
      const isHost = socket.id === room.hostSocketId || 
        room.members.find(m => m.id === socket.id)?.isHost;

      if (!isHost) {
        console.warn(`[Unauthorized] Non-host socket ${socket.id} attempted to lock room ${roomId}`);
        return;
      }

      room.isLocked = true;
      room.feeSettings = {
        shippingFee: Math.max(0, Number(shippingFee) || 0),
        discountAmount: Math.max(0, Number(discountAmount) || 0)
      };

      if (hostAccount) {
        room.hostAccount = { ...room.hostAccount, ...hostAccount };
      }

      // Execute Phase 4 & Phase 5 calculation
      const calculatedBill = calculateFairSplitBill({
        roomId: room.id,
        items: room.items,
        members: room.members,
        shippingFee: room.feeSettings.shippingFee,
        discountAmount: room.feeSettings.discountAmount,
        hostAccount: room.hostAccount
      });

      room.billSummary = calculatedBill;

      console.log(`[Order Locked] ${roomId} - Total Final: ${calculatedBill.grandTotal}đ`);

      // Broadcast order_locked and room_state
      io.to(roomId).emit('order_locked', { billSummary: calculatedBill });
      io.to(roomId).emit('room_state', room);
    });

    /**
     * Unlock order to allow edits if needed
     * Event: unlock_order
     */
    socket.on('unlock_order', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      room.isLocked = false;
      room.billSummary = null;

      console.log(`[Order Unlocked] ${roomId}`);
      io.to(roomId).emit('order_unlocked');
      io.to(roomId).emit('room_state', room);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket Disconnected] Socket ID: ${socket.id}`);
    });
  });
}
