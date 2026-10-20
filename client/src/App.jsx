import React, { useState, useEffect } from 'react';
import { socket, SERVER_URL } from './services/socket';
import { formatVND } from './utils/formatters';

// Modular Components
import JoinCreateModal from './components/JoinCreateModal';
import RoomHeader from './components/RoomHeader';
import MenuSection from './components/MenuSection';
import SharedCart from './components/SharedCart';
import LockOrderModal from './components/LockOrderModal';
import BillSummarySection from './components/BillSummarySection';
import QRShareModal from './components/QRShareModal';
import AddCustomDishModal from './components/AddCustomDishModal';

import { Lock, Unlock, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [userName, setUserName] = useState(localStorage.getItem('vku_user_name') || '');
  const [room, setRoom] = useState(null);
  const [presets, setPresets] = useState([]);
  const [banks, setBanks] = useState([]);
  const [notification, setNotification] = useState('');

  // Modals state
  const [showQRModal, setShowQRModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showCustomDishModal, setShowCustomDishModal] = useState(false);

  const triggerToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // Initial Data Fetching
  useEffect(() => {
    // Presets
    fetch(`${SERVER_URL}/api/presets`)
      .then(res => res.json())
      .then(data => setPresets(data))
      .catch(err => console.error('Error loading presets:', err));

    // Banks
    fetch(`${SERVER_URL}/api/banks`)
      .then(res => res.json())
      .then(data => setBanks(data))
      .catch(err => console.error('Error loading banks:', err));

    // Socket listeners for Two-Way Realtime Communication
    socket.on('room_state', (updatedRoom) => {
      setRoom(updatedRoom);
    });

    socket.on('member_joined', ({ userName: joinedUser }) => {
      if (joinedUser.toLowerCase() !== (userName || '').trim().toLowerCase()) {
        triggerToast(`${joinedUser} vừa tham gia phòng!`);
      }
    });

    socket.on('order_locked', () => {
      triggerToast('Đơn hàng đã được khóa & phân bổ chi phí VietQR!');
    });

    socket.on('order_unlocked', () => {
      triggerToast('Chủ phòng đã mở khóa đơn!');
    });

    return () => {
      socket.off('room_state');
      socket.off('member_joined');
      socket.off('order_locked');
      socket.off('order_unlocked');
    };
  }, [userName]);

  // Actions
  const handleAddItem = (dish, customNote = '') => {
    if (!room || room.isLocked) return;
    socket.emit('add_item', {
      roomId: room.id,
      item: {
        dishName: dish.name,
        price: dish.price,
        note: customNote,
        userName
      }
    });
    triggerToast(`Đã thêm: ${dish.name}`);
  };

  const handleRemoveItem = (itemId) => {
    if (!room || room.isLocked) return;
    socket.emit('remove_item', {
      roomId: room.id,
      itemId
    });
  };

  const handleAddCustomDish = (dish) => {
    if (!room || room.isLocked) return;
    socket.emit('add_custom_dish', {
      roomId: room.id,
      dish
    });

    // Also directly add to cart for this user
    handleAddItem(dish, dish.desc);
    setShowCustomDishModal(false);
  };

  const handleConfirmLock = ({ shippingFee, discountAmount }) => {
    if (!room) return;
    socket.emit('lock_order', {
      roomId: room.id,
      shippingFee,
      discountAmount,
      hostAccount: room.hostAccount
    });
    setShowLockModal(false);
  };

  const handleUnlockRoom = () => {
    if (window.confirm('Bạn có chắc muốn mở lại phòng để mọi người tiếp tục thêm/sửa món?')) {
      socket.emit('unlock_order', { roomId: room.id });
    }
  };

  const handleLeaveRoom = () => {
    if (window.confirm('Bạn có chắc chắn muốn rời khỏi phòng gom đơn này?')) {
      setRoom(null);
    }
  };

  const isHost = room && (
    room.hostSocketId === socket.id || 
    room.hostName.toLowerCase() === (userName || '').trim().toLowerCase()
  );

  const totalItemsCount = room?.items?.length || 0;
  const totalSubtotal = room?.items?.reduce((s, it) => s + (Number(it.price) || 0), 0) || 0;

  // -------------------------------------------------------------
  // VIEW: AUTH / JOIN / CREATE (If not in any room)
  // -------------------------------------------------------------
  if (!room) {
    return (
      <>
        {notification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg text-xs z-50 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}

        <JoinCreateModal
          presets={presets}
          banks={banks}
          onRoomJoined={(joinedRoom, name) => {
            setRoom(joinedRoom);
            setUserName(name);
          }}
          triggerToast={triggerToast}
        />
      </>
    );
  }

  // -------------------------------------------------------------
  // VIEW: ACTIVE ROOM
  // -------------------------------------------------------------
  return (
    <div className="max-w-lg mx-auto pb-28 min-h-screen bg-slate-50">
      {/* Toast Alert */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg text-xs z-50 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Room Header */}
      <RoomHeader
        room={room}
        onOpenQR={() => setShowQRModal(true)}
        onLeaveRoom={handleLeaveRoom}
      />

      {/* Main Content Area */}
      <main className="p-4 space-y-4">
        {/* Bill Summary & Dynamic VietQR (Phases 4 & 5) */}
        {room.isLocked && room.billSummary && (
          <BillSummarySection
            billSummary={room.billSummary}
            currentUserName={userName}
            hostName={room.hostName}
            hostAccount={room.hostAccount}
            roomId={room.id}
            isHost={isHost}
            onUnlockRoom={handleUnlockRoom}
            triggerToast={triggerToast}
          />
        )}

        {/* Real-time Shared Cart (Phase 2) */}
        <SharedCart
          items={room.items}
          currentUserName={userName}
          isHost={isHost}
          isLocked={room.isLocked}
          onRemoveItem={handleRemoveItem}
        />

        {/* Menu Section (Phase 2) */}
        <MenuSection
          menu={room.menu}
          isLocked={room.isLocked}
          onAddItem={handleAddItem}
          onOpenCustomModal={() => setShowCustomDishModal(true)}
        />
      </main>

      {/* Sticky Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 backdrop-blur border-t border-slate-200 p-3 px-4 z-30 flex items-center justify-between shadow-lg">
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">
            Tổng giỏ ({totalItemsCount} món)
          </span>
          <span className="text-lg font-black text-orange-600">
            {formatVND(totalSubtotal)}
          </span>
        </div>

        {isHost ? (
          !room.isLocked ? (
            <button
              onClick={() => setShowLockModal(true)}
              disabled={totalItemsCount === 0}
              className={`px-5 py-3 rounded-2xl font-bold text-xs text-white shadow-lg transition flex items-center gap-2 ${
                totalItemsCount > 0 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/30 hover:opacity-95' 
                  : 'bg-slate-300 cursor-not-allowed shadow-none'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Chốt đơn & Chia tiền</span>
            </button>
          ) : (
            <button
              onClick={handleUnlockRoom}
              className="px-5 py-3 rounded-2xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Mở lại phòng</span>
            </button>
          )
        ) : (
          <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-2 rounded-xl">
            {room.isLocked ? 'Đã khóa đơn (Xem VietQR phía trên)' : 'Đang đợi chủ phòng chốt'}
          </span>
        )}
      </footer>

      {/* Modals */}
      {showQRModal && (
        <QRShareModal
          roomId={room.id}
          onClose={() => setShowQRModal(false)}
          triggerToast={triggerToast}
        />
      )}

      {showLockModal && (
        <LockOrderModal
          totalSubtotal={totalSubtotal}
          onClose={() => setShowLockModal(false)}
          onConfirmLock={handleConfirmLock}
        />
      )}

      {showCustomDishModal && (
        <AddCustomDishModal
          onClose={() => setShowCustomDishModal(false)}
          onAddCustomDish={handleAddCustomDish}
        />
      )}
    </div>
  );
}
