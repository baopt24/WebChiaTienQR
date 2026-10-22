import React, { useState, useEffect } from 'react';
import { Utensils, ArrowRight, CreditCard, Sparkles, Building2, Users, QrCode } from 'lucide-react';
import { socket } from '../services/socket';

export default function JoinCreateModal({ banks = [], onRoomJoined, triggerToast }) {
  const [viewMode, setViewMode] = useState('join'); // 'join' | 'create'
  const [userName, setUserName] = useState(localStorage.getItem('vku_user_name') || '');
  const [roomIdInput, setRoomIdInput] = useState('');
  
  // Host config
  const [roomTitle, setRoomTitle] = useState('');
  const [bankCode, setBankCode] = useState('MB');
  const [accountNo, setAccountNo] = useState('');
  const [accountName, setAccountName] = useState('');

  // Auto-detect ?room=ROOM-xxxx from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setRoomIdInput(roomParam.toUpperCase());
      setViewMode('join');
    }
  }, []);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    const cleanName = userName.trim();
    const cleanRoomId = roomIdInput.trim().toUpperCase();

    if (!cleanName) return alert('Vui lòng nhập tên của bạn!');
    if (!cleanRoomId) return alert('Vui lòng nhập mã phòng!');

    localStorage.setItem('vku_user_name', cleanName);

    socket.emit('join_room', { roomId: cleanRoomId, userName: cleanName }, (res) => {
      if (res?.success) {
        onRoomJoined(res.room, cleanName);
        triggerToast(`Đã tham gia phòng ${res.room.id}!`);
      } else {
        alert(res?.message || 'Không tìm thấy phòng!');
      }
    });
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    const cleanName = userName.trim();
    if (!cleanName) return alert('Vui lòng nhập tên của bạn!');

    localStorage.setItem('vku_user_name', cleanName);

    socket.emit('create_room', {
      hostName: cleanName,
      roomTitle: roomTitle.trim() || `Phiên gom đơn của ${cleanName}`,
      hostAccount: {
        bankId: bankCode,
        accountNo: accountNo.trim() || '0987654321',
        accountName: accountName.trim() || cleanName
      }
    }, (res) => {
      if (res?.success) {
        onRoomJoined(res.room, cleanName);
        triggerToast('Khởi tạo phòng gom đơn thành công!');
      } else {
        alert(res?.message || 'Lỗi khi khởi tạo phòng!');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex flex-col items-center justify-center p-4">
      {/* Hero */}
      <div className="text-center mb-8 animate-fade-in-down">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white shadow-2xl shadow-orange-500/30 mb-4">
          <Utensils className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent tracking-tight">
          WebChiaTienQR
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
          Đặt hàng nhóm theo thời gian thực &amp; Tự động chia tiền VietQR
        </p>

        {/* Feature pills */}
        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
          {['⚡ Realtime', '🍜 Nhiều quán', '💸 VietQR tự động'].map(f => (
            <span key={f} className="text-xs font-semibold text-orange-700 bg-orange-100 px-3 py-1 rounded-full">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 w-full max-w-md animate-slide-up">
        {/* Mode Switcher */}
        <div className="relative flex bg-slate-100 p-1 rounded-2xl mb-6">
          {/* Slide indicator */}
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-transform duration-300 ease-out ${
              viewMode === 'create' ? 'translate-x-[calc(100%+8px)]' : 'translate-x-0'
            }`}
          />
          <button
            type="button"
            onClick={() => setViewMode('join')}
            className={`relative flex-1 py-2.5 text-sm font-bold rounded-xl transition-all z-10 flex items-center justify-center gap-1.5 ${
              viewMode === 'join' ? 'text-orange-600' : 'text-slate-500'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Vào phòng
          </button>
          <button
            type="button"
            onClick={() => setViewMode('create')}
            className={`relative flex-1 py-2.5 text-sm font-bold rounded-xl transition-all z-10 flex items-center justify-center gap-1.5 ${
              viewMode === 'create' ? 'text-orange-600' : 'text-slate-500'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Tạo phòng (Host)
          </button>
        </div>

        {viewMode === 'join' ? (
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                👤 Tên của bạn
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Thái Bảo, Hoàng Nam..."
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                🔑 Mã phòng
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: ROOM-8888"
                value={roomIdInput}
                onChange={e => setRoomIdInput(e.target.value.toUpperCase())}
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-center tracking-widest text-xl font-black font-mono transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl shadow-xl shadow-orange-500/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span>Tham gia phòng ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                👑 Tên chủ phòng (Bạn)
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Thái Bảo"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                📝 Tiêu đề phòng gom (Tùy chọn)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Trà sữa trưa nay, Ăn trưa KTX..."
                value={roomTitle}
                onChange={e => setRoomTitle(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition-all placeholder:text-slate-400"
              />
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                💡 Phòng có sẵn thực đơn của <strong>nhiều quán ăn &amp; trà sữa</strong>!
              </p>
            </div>

            {/* Banking Config for VietQR */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-2xl border border-orange-100 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-orange-900">
                <div className="p-1.5 bg-orange-500 rounded-lg">
                  <CreditCard className="w-3.5 h-3.5 text-white" />
                </div>
                <span>Cấu hình nhận tiền VietQR (Chủ phòng)</span>
              </div>
              <div className="space-y-2">
                <select
                  value={bankCode}
                  onChange={e => setBankCode(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-orange-200 text-xs bg-white focus:outline-none focus:border-orange-500"
                >
                  {banks.map(b => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  placeholder="Số tài khoản ngân hàng nhận tiền"
                  value={accountNo}
                  onChange={e => setAccountNo(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-orange-200 text-xs focus:outline-none focus:border-orange-500"
                />
                <input
                  type="text"
                  placeholder="Tên chủ tài khoản (Viết hoa không dấu)"
                  value={accountName}
                  onChange={e => setAccountName(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2.5 rounded-xl border border-orange-200 text-xs uppercase focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl shadow-xl shadow-orange-500/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span>Khởi tạo phòng &amp; Mở thực đơn</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
