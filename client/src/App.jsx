import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Users, ShoppingBag, Plus, Trash2, Lock, Unlock, 
  QrCode, Share2, ArrowRight, Utensils, CheckCircle2, 
  CreditCard, Sparkles, RefreshCw, AlertCircle
} from 'lucide-react';

// Connect to backend server (auto-detect current host or localhost)
const SERVER_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:4000' 
  : `http://${window.location.hostname}:4000`;

const socket = io(SERVER_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling']
});

const POPULAR_BANKS = [
  { code: 'MB', name: 'MBBank (Quân Đội)' },
  { code: 'VCB', name: 'Vietcombank' },
  { code: 'TCB', name: 'Techcombank' },
  { code: 'BIDV', name: 'BIDV' },
  { code: 'ICB', name: 'VietinBank' },
  { code: 'ACB', name: 'ACB' },
  { code: 'VPB', name: 'VPBank' },
  { code: 'TPB', name: 'TPBank' }
];

export default function App() {
  const [userName, setUserName] = useState(localStorage.getItem('vku_user_name') || '');
  const [room, setRoom] = useState(null);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [viewMode, setViewMode] = useState('join'); // 'create' | 'join'
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [customRestaurantName, setCustomRestaurantName] = useState('');
  const [bankCode, setBankCode] = useState('MB');
  const [accountNo, setAccountNo] = useState('');
  const [accountName, setAccountName] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [discountInput, setDiscountInput] = useState('0');
  const [shippingInput, setShippingInput] = useState('0');
  const [customDishName, setCustomDishName] = useState('');
  const [customDishPrice, setCustomDishPrice] = useState('');
  const [customDishNote, setCustomDishNote] = useState('');
  const [showCustomDishModal, setShowCustomDishModal] = useState(false);
  const [notification, setNotification] = useState('');

  // Fetch presets on mount
  useEffect(() => {
    fetch(`${SERVER_URL}/api/presets`)
      .then(res => res.json())
      .then(data => {
        setPresets(data);
        if (data.length > 0) setSelectedPreset(data[0].id);
      })
      .catch(err => console.error('Error fetching presets:', err));

    // Socket listener for room updates
    socket.on('room_updated', (updatedRoom) => {
      setRoom(updatedRoom);
    });

    return () => {
      socket.off('room_updated');
    };
  }, []);

  const triggerToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // Create room handler
  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!userName.trim()) return alert('Vui lòng nhập họ tên của bạn!');

    localStorage.setItem('vku_user_name', userName.trim());

    let restaurantName = '';
    let menu = [];

    if (selectedPreset === 'custom') {
      restaurantName = customRestaurantName.trim() || 'Quán tự do';
    } else {
      const preset = presets.find(p => p.id === selectedPreset);
      if (preset) {
        restaurantName = preset.name;
        menu = preset.items;
      }
    }

    socket.emit('create_room', {
      hostName: userName.trim(),
      restaurantName,
      menu,
      hostAccount: {
        bankId: bankCode,
        accountNo: accountNo.trim() || '0987654321',
        accountName: accountName.trim() || userName.trim()
      }
    }, (res) => {
      if (res?.success) {
        setRoom(res.room);
        triggerToast('Tạo phòng gom đơn thành công!');
      } else {
        alert(res?.message || 'Lỗi khi tạo phòng!');
      }
    });
  };

  // Join room handler
  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!userName.trim()) return alert('Vui lòng nhập họ tên của bạn!');
    if (!roomIdInput.trim()) return alert('Vui lòng nhập mã phòng!');

    localStorage.setItem('vku_user_name', userName.trim());

    socket.emit('join_room', {
      roomId: roomIdInput.trim().toUpperCase(),
      userName: userName.trim()
    }, (res) => {
      if (res?.success) {
        setRoom(res.room);
        triggerToast(`Đã vào phòng ${res.room.id}!`);
      } else {
        alert(res?.message || 'Không tìm thấy phòng!');
      }
    });
  };

  // Add Item
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

  // Add Custom Dish to menu
  const handleAddCustomDish = (e) => {
    e.preventDefault();
    if (!customDishName.trim()) return;
    const price = parseInt(customDishPrice) || 0;

    socket.emit('add_custom_dish', {
      roomId: room.id,
      dish: {
        name: customDishName.trim(),
        price,
        desc: customDishNote.trim() || 'Món tự nhập'
      }
    });

    handleAddItem({
      name: customDishName.trim(),
      price
    }, customDishNote.trim());

    setCustomDishName('');
    setCustomDishPrice('');
    setCustomDishNote('');
    setShowCustomDishModal(false);
  };

  // Remove Item
  const handleRemoveItem = (itemId) => {
    if (!room || room.isLocked) return;
    socket.emit('remove_item', {
      roomId: room.id,
      itemId
    });
  };

  // Lock room & calculate bill
  const handleLockRoom = (e) => {
    e.preventDefault();
    const discount = parseInt(discountInput) || 0;
    const shipping = parseInt(shippingInput) || 0;

    socket.emit('lock_room', {
      roomId: room.id,
      discountAmount: discount,
      shippingFee: shipping,
      hostAccount: {
        bankId: bankCode,
        accountNo: accountNo.trim() || room.hostAccount?.accountNo || '0987654321',
        accountName: accountName.trim() || room.hostAccount?.accountName || userName
      }
    });
    setShowLockModal(false);
    triggerToast('Đã chốt đơn & sinh mã VietQR!');
  };

  // Unlock room
  const handleUnlockRoom = () => {
    if (window.confirm('Mở lại phòng để bạn bè tiếp tục thêm/sửa món?')) {
      socket.emit('unlock_room', { roomId: room.id });
    }
  };

  const isHost = room && (room.hostSocketId === socket.id || room.hostName.toLowerCase() === userName.trim().toLowerCase());
  const currentMember = room?.members?.find(m => m.name.toLowerCase() === userName.trim().toLowerCase());
  const myBill = room?.bill?.userBills?.find(u => u.userName.toLowerCase() === userName.trim().toLowerCase());

  // -------------------------------------------------------------
  // RENDER: NOT IN ROOM (HOME / LOGIN / CREATE)
  // -------------------------------------------------------------
  if (!room) {
    return (
      <div className="max-w-md mx-auto p-4 min-h-screen flex flex-col justify-center">
        {notification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg text-sm z-50 animate-bounce">
            {notification}
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/30 mb-3">
              <Utensils className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Gom Đơn VKU
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Đặt hàng nhóm thời gian thực & Tự chia tiền VietQR
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
            <button
              onClick={() => setViewMode('join')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                viewMode === 'join' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500'
              }`}
            >
              Vào phòng
            </button>
            <button
              onClick={() => setViewMode('create')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                viewMode === 'create' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500'
              }`}
            >
              Tạo phòng mới
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
                  Mã phòng (6 ký tự)
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Ví dụ: VKU888"
                  value={roomIdInput}
                  onChange={e => setRoomIdInput(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-center tracking-widest text-lg font-bold font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span>Vào phòng gom đơn</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Tên chủ phòng (Bạn)
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
                  Chọn Quán ăn / Trà sữa
                </label>
                <select
                  value={selectedPreset}
                  onChange={e => setSelectedPreset(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm bg-white"
                >
                  {presets.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                  ))}
                  <option value="custom">✍️ Quán khác (Tự nhập tên quán & món)</option>
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
                    placeholder="Ví dụ: Bánh mì Cô Ba, Cơm gà xối mỡ..."
                    value={customRestaurantName}
                    onChange={e => setCustomRestaurantName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                  />
                </div>
              )}

              <div className="bg-orange-50/70 p-3 rounded-xl border border-orange-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-800 mb-2">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Tài khoản nhận tiền (Tự sinh VietQR)</span>
                </div>
                <div className="space-y-2">
                  <select
                    value={bankCode}
                    onChange={e => setBankCode(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-orange-200 text-xs bg-white"
                  >
                    {POPULAR_BANKS.map(b => (
                      <option key={b.code} value={b.code}>{b.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Số tài khoản ngân hàng của bạn"
                    value={accountNo}
                    onChange={e => setAccountNo(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-orange-200 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Tên chủ tài khoản (Viết không dấu)"
                    value={accountName}
                    onChange={e => setAccountName(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 rounded-lg border border-orange-200 text-xs uppercase"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span>Tạo phòng & Lấy mã QR</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: INSIDE ACTIVE ROOM
  // -------------------------------------------------------------
  const totalItemsCount = room.items.length;
  const totalSubtotal = room.items.reduce((sum, it) => sum + it.price, 0);

  // Group items by user
  const groupedItems = room.items.reduce((acc, item) => {
    if (!acc[item.userName]) acc[item.userName] = [];
    acc[item.userName].push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-lg mx-auto pb-28 min-h-screen">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg text-xs z-50 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 tracking-wider">
              {room.id}
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              room.isLocked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {room.isLocked ? 'Đã khóa đơn' : 'Đang mở nhận món'}
            </span>
          </div>
          <h2 className="text-sm font-bold text-slate-800 line-clamp-1 mt-0.5">
            {room.restaurantName}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQRModal(true)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            title="Xem mã QR phòng"
          >
            <QrCode className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>{room.members.length}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="p-4 space-y-5">
        {/* Banner if locked */}
        {room.isLocked && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Lock className="w-4 h-4" />
                <span>PHÒNG ĐÃ CHỐT ĐƠN & TÍNH TIỀN</span>
              </div>
              {isHost && (
                <button
                  onClick={handleUnlockRoom}
                  className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Unlock className="w-3 h-3" />
                  <span>Mở lại</span>
                </button>
              )}
            </div>
            <p className="text-xs text-orange-100">
              Chủ phòng ({room.hostName}) đã áp mã giảm giá và tính toán số tiền thực tế từng người cần trả qua VietQR phía dưới!
            </p>
          </div>
        )}

        {/* MY BILL SECTION (If Room is locked and bill exists) */}
        {room.isLocked && myBill && (
          <div className="bg-white rounded-3xl p-5 border-2 border-orange-500 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                  Phần tiền của bạn
                </span>
                <h3 className="text-lg font-extrabold text-slate-800">
                  {userName}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 line-through">
                  {(myBill.subtotal).toLocaleString('vi-VN')}đ
                </span>
                <p className="text-2xl font-black text-orange-600">
                  {myBill.finalAmount.toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Tiền món gốc ({myBill.items.length} món):</span>
                <span className="font-semibold">{myBill.subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Voucher giảm giá được hưởng:</span>
                <span className="font-semibold">-{myBill.discount.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phí vận chuyển chia sẻ:</span>
                <span className="font-semibold">+{myBill.shipping.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            {/* VietQR Quick Payment */}
            <div className="text-center pt-2">
              <p className="text-xs font-bold text-slate-700 mb-2">
                Quét mã VietQR chuyển tiền cho {room.hostName}:
              </p>
              <div className="inline-block p-2 bg-white rounded-2xl shadow-md border">
                <img
                  src={myBill.vietQRUrl}
                  alt="VietQR Payment"
                  className="w-48 h-48 mx-auto rounded-lg object-contain"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Nội dung CK: <strong className="text-slate-700">GOM DON {userName}</strong>
              </p>
            </div>
          </div>
        )}

        {/* REAL-TIME SHARED CART */}
        <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-slate-800 text-sm">
                Giỏ hàng chung ({totalItemsCount} món)
              </h3>
            </div>
            <span className="text-xs font-extrabold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
              {totalSubtotal.toLocaleString('vi-VN')}đ
            </span>
          </div>

          {totalItemsCount === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <ShoppingBag className="w-10 h-10 mx-auto stroke-1 mb-2 text-slate-300" />
              <p className="text-xs">Chưa có ai chọn món. Hãy bấm chọn món bên dưới!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedItems).map(([person, items]) => {
                const isMe = person.toLowerCase() === userName.trim().toLowerCase();
                const personTotal = items.reduce((s, it) => s + it.price, 0);

                return (
                  <div key={person} className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${isMe ? 'bg-orange-500' : 'bg-slate-400'}`} />
                        <span className={`text-xs font-bold ${isMe ? 'text-orange-600' : 'text-slate-700'}`}>
                          {person} {isMe && '(Bạn)'}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {personTotal.toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {items.map(it => (
                        <div key={it.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl text-xs shadow-2xs">
                          <div>
                            <span className="font-medium text-slate-800">{it.dishName}</span>
                            {it.note && <span className="text-[11px] text-slate-400 ml-1.5">({it.note})</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600 font-semibold">{it.price.toLocaleString('vi-VN')}đ</span>
                            {(isMe || isHost) && !room.isLocked && (
                              <button
                                onClick={() => handleRemoveItem(it.id)}
                                className="text-slate-300 hover:text-rose-500 transition p-0.5"
                                title="Xóa món"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* MENU SECTION */}
        <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Thực đơn quán</h3>
              <p className="text-[11px] text-slate-400">Bấm [+] để thêm món vào giỏ hàng chung</p>
            </div>
            {!room.isLocked && (
              <button
                onClick={() => setShowCustomDishModal(true)}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2.5 py-1.5 rounded-xl transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm món khác</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            {room.menu.map(dish => (
              <div
                key={dish.id}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 transition"
              >
                <div className="flex-1 pr-3">
                  <h4 className="text-xs font-bold text-slate-800">{dish.name}</h4>
                  {dish.desc && <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{dish.desc}</p>}
                  <p className="text-xs font-extrabold text-orange-600 mt-1">
                    {dish.price.toLocaleString('vi-VN')}đ
                  </p>
                </div>

                {!room.isLocked ? (
                  <button
                    onClick={() => handleAddItem(dish)}
                    className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 active:scale-95 transition flex items-center gap-1 text-xs font-bold"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Chọn</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">Đã khóa</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ALL MEMBERS BILL SUMMARY (When locked) */}
        {room.isLocked && room.bill && (
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">
              Bảng kê khai chi phí cả nhóm ({room.bill.userBills.length} người)
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {room.bill.userBills.map(ub => (
                <div key={ub.userName} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{ub.userName}</span>
                    <span className="text-[11px] text-slate-400 ml-2">({ub.items.length} món)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-orange-600 text-sm">
                      {ub.finalAmount.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t flex justify-between font-extrabold text-sm text-slate-800">
              <span>Tổng thanh toán thực tế:</span>
              <span className="text-orange-600">{room.bill.grandTotal.toLocaleString('vi-VN')}đ</span>
            </div>
          </section>
        )}
      </main>

      {/* STICKY BOTTOM ACTION BAR */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 backdrop-blur border-t border-slate-200 p-3 px-4 z-30 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-400 block">Tổng giỏ ({totalItemsCount} món)</span>
          <span className="text-lg font-black text-orange-600">
            {totalSubtotal.toLocaleString('vi-VN')}đ
          </span>
        </div>

        {isHost ? (
          !room.isLocked ? (
            <button
              onClick={() => setShowLockModal(true)}
              disabled={totalItemsCount === 0}
              className={`px-5 py-3 rounded-2xl font-bold text-sm text-white shadow-lg transition flex items-center gap-2 ${
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
              className="px-5 py-3 rounded-2xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Mở lại phòng</span>
            </button>
          )
        ) : (
          <span className="text-xs text-slate-500 font-medium">
            {room.isLocked ? 'Chờ quét VietQR thanh toán' : 'Đang đợi chủ phòng chốt'}
          </span>
        )}
      </footer>

      {/* MODAL 1: SHARE QR CODE MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center space-y-4 animate-scale-up">
            <h3 className="font-bold text-base text-slate-800">
              Quét mã vào phòng gom đơn
            </h3>
            <div className="p-3 bg-white border-2 border-orange-200 rounded-2xl inline-block shadow-sm">
              <QRCodeSVG
                value={`${window.location.origin}?room=${room.id}`}
                size={180}
                level="M"
              />
            </div>
            <div>
              <span className="text-xs text-slate-400">Mã phòng của bạn:</span>
              <p className="text-2xl font-black text-orange-600 tracking-widest font-mono">
                {room.id}
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}?room=${room.id}`);
                triggerToast('Đã sao chép liên kết vào clipboard!');
              }}
              className="w-full py-2.5 bg-orange-50 text-orange-600 font-bold text-xs rounded-xl hover:bg-orange-100 transition flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Sao chép Link phòng</span>
            </button>
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2 bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-200 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: LOCK ROOM & CALCULATE BILL MODAL (HOST ONLY) */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleLockRoom} className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 animate-scale-up">
            <div className="flex items-center gap-2 text-orange-600">
              <Lock className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-800">
                Chốt đơn & Nhập số tiền thực tế
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Nhập mã giảm giá và phí ship thực tế từ app ShopeeFood/GrabFood để hệ thống tự động phân bổ cho từng bạn:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tổng Voucher Giảm giá (VNĐ)
                </label>
                <input
                  type="number"
                  placeholder="Ví dụ: 30000"
                  value={discountInput}
                  onChange={e => setDiscountInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tổng Phí Vận chuyển / Phí Ship (VNĐ)
                </label>
                <input
                  type="number"
                  placeholder="Ví dụ: 16000"
                  value={shippingInput}
                  onChange={e => setShippingInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Tiền gốc giỏ hàng:</span>
                  <span className="font-bold">{totalSubtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-orange-600 font-extrabold text-sm pt-1 border-t">
                  <span>Dự kiến cần thanh toán:</span>
                  <span>
                    {(Math.max(0, totalSubtotal - (parseInt(discountInput) || 0) + (parseInt(shippingInput) || 0))).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLockModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-200 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/30 hover:opacity-95 transition"
              >
                Sinh mã VietQR
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: CUSTOM DISH MODAL */}
      {showCustomDishModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddCustomDish} className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 animate-scale-up">
            <h3 className="font-bold text-base text-slate-800">
              Thêm món tùy chọn vào quán
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên món ăn / Đồ uống
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bún chả đặc biệt, Cơm tấm sườn..."
                  value={customDishName}
                  onChange={e => setCustomDishName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Giá tiền ước tính (VNĐ)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ví dụ: 35000"
                  value={customDishPrice}
                  onChange={e => setCustomDishPrice(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Ít ngọt, nhiều đá, không hành..."
                  value={customDishNote}
                  onChange={e => setCustomDishNote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomDishModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-200 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-95 transition"
              >
                Thêm ngay
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
