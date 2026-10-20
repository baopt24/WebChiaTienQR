import React, { useState, useEffect } from 'react';
import { Utensils, ArrowRight, CreditCard, Sparkles, Building2 } from 'lucide-react';
import { socket } from '../services/socket';

export default function JoinCreateModal({ presets = [], banks = [], onRoomJoined, triggerToast }) {
  const [viewMode, setViewMode] = useState('join'); // 'join' | 'create'
  const [userName, setUserName] = useState(localStorage.getItem('vku_user_name') || '');
  const [roomIdInput, setRoomIdInput] = useState('');
  
  // Host config
  const [selectedPreset, setSelectedPreset] = useState('');
  const [customRestaurantName, setCustomRestaurantName] = useState('');
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

  useEffect(() => {
    if (presets.length > 0 && !selectedPreset) {
      setSelectedPreset(presets[0].id);
    }
  }, [presets]);

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

    let restaurantName = '';
    let menu = [];

    if (selectedPreset === 'custom') {
      restaurantName = customRestaurantName.trim() || 'Quán ăn tự chọn';
    } else {
      const preset = presets.find(p => p.id === selectedPreset);
      if (preset) {
        restaurantName = preset.name;
        menu = preset.items;
      }
    }

    socket.emit('create_room', {
      hostName: cleanName,
      restaurantName,
      menu,
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
    <div className="max-w-md mx-auto p-4 min-h-screen flex flex-col justify-center">
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/30 mb-3">
            <Utensils className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            WebChiaTienQR
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Đặt hàng nhóm theo thời gian thực & Tự động chia tiền VietQR
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setViewMode('join')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              viewMode === 'join' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500'
            }`}
          >
            Vào phòng
          </button>
          <button
            type="button"
            onClick={() => setViewMode('create')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              viewMode === 'create' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500'
            }`}
          >
            Tạo phòng mới (Host)
          </button>
        </div>

        {viewMode === 'join' ? (
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Tên của bạn
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Thái Bảo, Hoàng Nam..."
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Mã phòng
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: ROOM-8888"
                value={roomIdInput}
                onChange={e => setRoomIdInput(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-center tracking-widest text-lg font-bold font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <span>Tham gia phòng</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Tên chủ phòng (Host)
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Thái Bảo"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Chọn Thực đơn Quán ăn / Trà sữa
              </label>
              <select
                value={selectedPreset}
                onChange={e => setSelectedPreset(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm bg-white"
              >
                {presets.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                ))}
                <option value="custom">✍️ Quán khác (Tự nhập món)</option>
              </select>
            </div>

            {selectedPreset === 'custom' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Tên quán muốn ăn
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bún chả Hà Nội, Bánh mì Cô Ba..."
                  value={customRestaurantName}
                  onChange={e => setCustomRestaurantName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                />
              </div>
            )}

            {/* Banking Config for VietQR */}
            <div className="bg-orange-50/70 p-3.5 rounded-2xl border border-orange-100 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-900">
                <CreditCard className="w-3.5 h-3.5 text-orange-600" />
                <span>Cấu hình nhận tiền VietQR (Chủ phòng)</span>
              </div>
              <div className="space-y-2">
                <select
                  value={bankCode}
                  onChange={e => setBankCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-orange-200 text-xs bg-white"
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
                  className="w-full px-3 py-2 rounded-lg border border-orange-200 text-xs"
                />
                <input
                  type="text"
                  placeholder="Tên chủ tài khoản (Viết hoa không dấu)"
                  value={accountName}
                  onChange={e => setAccountName(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-lg border border-orange-200 text-xs uppercase"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <span>Khởi tạo phòng gom & Nhận mã</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
