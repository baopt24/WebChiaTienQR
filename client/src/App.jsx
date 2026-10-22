import React, { useState, useEffect } from 'react';
import { socket, SERVER_URL } from './services/socket';
import { formatVND } from './utils/formatters';
import { playTingTingSound } from './utils/audio';

// Modular Components
import JoinCreateModal from './components/JoinCreateModal';
import RoomHeader from './components/RoomHeader';
import MenuSection from './components/MenuSection';
import SharedCart from './components/SharedCart';
import LockOrderModal from './components/LockOrderModal';
import BillSummarySection from './components/BillSummarySection';
import QRShareModal from './components/QRShareModal';
import AdminPortal from './components/AdminPortal';

import { Lock, Unlock, CheckCircle2, ShieldCheck, ExternalLink } from 'lucide-react';

export default function App() {
  // Check if URL has ?view=admin or ?admin=true
  const [isAdminView, setIsAdminView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'admin' || params.get('admin') === 'true' || window.location.pathname === '/admin';
  });

  const [userName, setUserName] = useState(localStorage.getItem('vku_user_name') || '');
  const [room, setRoom] = useState(null);
  const [banks, setBanks] = useState([]);
  const [notification, setNotification] = useState('');

  // Modals state
  const [showQRModal, setShowQRModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);

  const triggerToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // Initial Data Fetching & Socket listeners
  useEffect(() => {
    // Banks
    fetch(`${SERVER_URL}/api/banks`)
      .then(res => res.json())
      .then(data => setBanks(data))
      .catch(err => console.error('Error loading banks:', err));

    // Socket listeners for Two-Way Realtime Communication
    socket.on('room_state', (updatedRoom) => {
      setRoom(updatedRoom);
    });

    socket.on('global_catalog_updated', (updatedCatalog) => {
      setRoom(prev => {
        if (!prev) return null;
        return { ...prev, restaurants: updatedCatalog };
      });
      triggerToast('Thực đơn các quán vừa được Admin cập nhật thời gian thực!');
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

    // Payment Lifecycle Events (P2P Confirmation)
    socket.on('payment_reported', ({ memberName, amount }) => {
      playTingTingSound();
      triggerToast(`🔔 ${memberName} vừa báo đã chuyển ${formatVND(amount)}!`);
    });

    socket.on('payment_confirmed', ({ memberName, amount }) => {
      playTingTingSound();
      triggerToast(`🎉 Xác nhận: ${memberName} đã thanh toán thành công ${formatVND(amount)}!`);
    });

    socket.on('payment_rejected', ({ memberName, reason }) => {
      triggerToast(`⚠️ Báo chưa nhận được tiền từ ${memberName}: ${reason}`);
    });

    return () => {
      socket.off('room_state');
      socket.off('global_catalog_updated');
      socket.off('member_joined');
      socket.off('order_locked');
      socket.off('order_unlocked');
      socket.off('payment_reported');
      socket.off('payment_confirmed');
      socket.off('payment_rejected');
    };
  }, [userName]);

  // -------------------------------------------------------------
  // DEDICATED ADMIN PORTAL (Không cần đăng nhập vào phòng)
  // -------------------------------------------------------------
  if (isAdminView) {
    return (
      <AdminPortal
        onBackToUserApp={() => {
          setIsAdminView(false);
          window.history.pushState({}, '', window.location.pathname);
        }}
      />
    );
  }

  // Actions
  const handleAddItem = (dish, customNote = '') => {
    if (!room || room.isLocked) return;
    socket.emit('add_item', {
      roomId: room.id,
      item: {
        dishName: dish.name,
        price: dish.price,
        note: customNote,
        restaurantName: dish.restaurantName || 'Quán tự chọn',
        userName
      }
    });
    triggerToast(`Đã thêm: ${dish.name} (${dish.restaurantName || ''})`);
  };

  const handleRemoveItem = (itemId) => {
    if (!room || room.isLocked) return;
    socket.emit('remove_item', {
      roomId: room.id,
      itemId
    });
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
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg text-xs z-50 flex items-center gap-2 animate-fade-in-down">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}

        <JoinCreateModal
          banks={banks}
          onRoomJoined={(joinedRoom, name) => {
            setRoom(joinedRoom);
            setUserName(name);
          }}
          triggerToast={triggerToast}
        />

        {/* Link to Dedicated Admin Portal */}
        <div className="text-center pb-8">
          <button
            onClick={() => setIsAdminView(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-orange-600 transition bg-white/70 border border-slate-200 px-3.5 py-1.5 rounded-full shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Trang Quản Trị Quán & Thực Đơn (Admin Portal)</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </>
    );
  }

  // -------------------------------------------------------------
  // VIEW: ACTIVE ROOM
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/40 to-slate-50">
      {/* Toast Alert */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-2.5 rounded-full shadow-xl text-xs z-50 flex items-center gap-2 animate-fade-in-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Room Header */}
      <RoomHeader
        room={room}
        userName={userName}
        onOpenQR={() => setShowQRModal(true)}
        onLeaveRoom={handleLeaveRoom}
      />

      {/* Main Content Area — 2-col on desktop */}
      <div className="max-w-7xl mx-auto px-4 pb-28 md:pb-10 pt-3 md:pt-5">
        <div className="md:grid md:grid-cols-[1fr,440px] md:gap-6 lg:grid-cols-[1fr,480px]">

          {/* ── LEFT COLUMN: Menu ── */}
          <div className="order-2 md:order-1 animate-slide-up">
            {/* Multi-Restaurant Menu Section */}
            <MenuSection
              restaurants={room.restaurants || []}
              cartItems={room.items || []}
              isLocked={room.isLocked}
              onAddItem={handleAddItem}
            />
          </div>

          {/* ── RIGHT COLUMN: Cart + Bill Summary ── */}
          <div className="order-1 md:order-2 space-y-4 mb-4 md:mb-0 animate-fade-in-down">
            {/* Bill Summary (only when locked) */}
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

            {/* Real-time Shared Cart */}
            <SharedCart
              items={room.items}
              currentUserName={userName}
              isHost={isHost}
              isLocked={room.isLocked}
              onRemoveItem={handleRemoveItem}
            />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">
              Tổng giỏ ({totalItemsCount} món)
            </span>
            <span className="text-xl font-black text-orange-600">
              {formatVND(totalSubtotal)}
            </span>
          </div>

          {isHost ? (
            !room.isLocked ? (
              <button
                onClick={() => setShowLockModal(true)}
                disabled={totalItemsCount === 0}
                className={`px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-lg transition-all flex items-center gap-2 ${
                  totalItemsCount > 0 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/30 hover:opacity-95 active:scale-[0.98]' 
                    : 'bg-slate-300 cursor-not-allowed shadow-none'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Chốt đơn & Chia tiền</span>
              </button>
            ) : (
              <button
                onClick={handleUnlockRoom}
                className="px-6 py-3 rounded-2xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-2 active:scale-[0.98]"
              >
                <Unlock className="w-4 h-4" />
                <span>Mở lại phòng</span>
              </button>
            )
          ) : (
            <span className={`text-xs font-semibold px-4 py-2.5 rounded-2xl ${
              room.isLocked 
                ? 'text-amber-700 bg-amber-50 border border-amber-200' 
                : 'text-slate-500 bg-slate-100'
            }`}>
              {room.isLocked ? '🔒 Đã khóa đơn (Xem VietQR phía trên)' : '⏳ Đang đợi chủ phòng chốt'}
            </span>
          )}
        </div>
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
    </div>
  );
}
