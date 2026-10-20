import React, { useState, useEffect } from 'react';
import { 
  Store, Plus, Trash2, Edit2, Image, DollarSign, 
  Tag, ArrowLeft, Check, RefreshCw, Layers, ExternalLink 
} from 'lucide-react';
import { SERVER_URL } from '../services/socket';
import { formatVND } from '../utils/formatters';

export default function AdminPortal({ onBackToUserApp }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('restaurants'); // 'restaurants' | 'dishes'
  const [selectedRestId, setSelectedRestId] = useState(null);
  const [notification, setNotification] = useState('');

  // Form states for Add Restaurant
  const [newRestName, setNewRestName] = useState('');
  const [newRestCategory, setNewRestCategory] = useState('Trà sữa');
  const [newRestImage, setNewRestImage] = useState('');
  const [newRestAddress, setNewRestAddress] = useState('');

  // Form states for Add Dish
  const [newDishName, setNewDishName] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('');
  const [newDishCategory, setNewDishCategory] = useState('Món chính');
  const [newDishImage, setNewDishImage] = useState('');
  const [newDishDesc, setNewDishDesc] = useState('');

  const triggerToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Fetch all restaurants and dishes
  const fetchRestaurants = () => {
    setLoading(true);
    fetch(`${SERVER_URL}/api/admin/restaurants`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setRestaurants(res.data);
          if (!selectedRestId && res.data.length > 0) {
            setSelectedRestId(res.data[0].id);
          }
        }
      })
      .catch(err => console.error('Error fetching admin data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // 1. Add Restaurant
  const handleAddRestaurant = (e) => {
    e.preventDefault();
    if (!newRestName.trim()) return;

    fetch(`${SERVER_URL}/api/admin/restaurants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newRestName.trim(),
        category: newRestCategory.trim(),
        image: newRestImage.trim(),
        address: newRestAddress.trim()
      })
    })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          triggerToast('Đã thêm quán mới thành công!');
          setNewRestName('');
          setNewRestImage('');
          setNewRestAddress('');
          fetchRestaurants();
        } else {
          alert(res.message);
        }
      });
  };

  // 2. Delete Restaurant
  const handleDeleteRestaurant = (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa quán "${name}" và toàn bộ menu?`)) return;

    fetch(`${SERVER_URL}/api/admin/restaurants/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          triggerToast('Đã xóa quán thành công!');
          fetchRestaurants();
        }
      });
  };

  // 3. Add Dish to Selected Restaurant
  const handleAddDish = (e) => {
    e.preventDefault();
    if (!selectedRestId || !newDishName.trim()) return;

    fetch(`${SERVER_URL}/api/admin/restaurants/${selectedRestId}/dishes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newDishName.trim(),
        price: parseInt(newDishPrice) || 0,
        image: newDishImage.trim(),
        category: newDishCategory.trim(),
        desc: newDishDesc.trim()
      })
    })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          triggerToast('Đã thêm món mới vào thực đơn!');
          setNewDishName('');
          setNewDishPrice('');
          setNewDishImage('');
          setNewDishDesc('');
          fetchRestaurants();
        } else {
          alert(res.message);
        }
      });
  };

  // 4. Delete Dish
  const handleDeleteDish = (restId, dishId, dishName) => {
    if (!window.confirm(`Xóa món "${dishName}" khỏi quán?`)) return;

    fetch(`${SERVER_URL}/api/admin/restaurants/${restId}/dishes/${dishId}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          triggerToast('Đã xóa món ăn thành công!');
          fetchRestaurants();
        }
      });
  };

  const currentRest = restaurants.find(r => r.id === selectedRestId) || restaurants[0];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Toast Alert */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-5 py-2.5 rounded-full shadow-2xl text-xs font-bold z-50 animate-bounce">
          ✓ {notification}
        </div>
      )}

      {/* Admin Navbar */}
      <header className="bg-slate-800/80 backdrop-blur border-b border-slate-700 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-500 rounded-2xl text-white shadow-lg shadow-orange-500/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>Hệ Thống Quản Trị Quán & Thực Đơn</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Admin Portal
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Quản lý quán ăn, giá tiền và hình ảnh món ăn độc lập
            </p>
          </div>
        </div>

        <button
          onClick={onBackToUserApp}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về Web Chia Tiền</span>
        </button>
      </header>

      {/* Tabs */}
      <div className="bg-slate-800/40 border-b border-slate-700/60 px-6 py-2.5 flex gap-2">
        <button
          onClick={() => setActiveTab('restaurants')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'restaurants'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Quản lý Quán ăn ({restaurants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dishes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'dishes'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Quản lý Thực đơn & Ảnh món ăn</span>
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
        {activeTab === 'restaurants' ? (
          /* ========================================================
             TAB 1: QUẢN LÝ QUÁN ĂN (ADD & LIST)
             ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form thêm quán */}
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-5 h-fit shadow-xl space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-orange-400" />
                <span>Thêm Quán ăn / Trà sữa mới</span>
              </h3>

              <form onSubmit={handleAddRestaurant} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tên quán ăn / thương hiệu
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Trà sữa Gong Cha, Bún bò Bà Diệu..."
                    value={newRestName}
                    onChange={e => setNewRestName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Danh mục / Thể loại
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Trà sữa, Cơm trưa, Đồ ăn vặt..."
                    value={newRestCategory}
                    onChange={e => setNewRestCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Link hình ảnh bìa / logo quán (URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newRestImage}
                    onChange={e => setNewRestImage(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Để trống sẽ dùng ảnh mặc định chất lượng cao</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Địa chỉ / Chi nhánh
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Làng Đại học Đà Nẵng, Ngũ Hành Sơn..."
                    value={newRestAddress}
                    onChange={e => setNewRestAddress(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 font-bold text-xs text-white rounded-xl shadow-lg shadow-orange-500/25 transition mt-2"
                >
                  Thêm Quán vào Hệ Thống
                </button>
              </form>
            </div>

            {/* Danh sách quán */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="font-bold text-sm text-slate-300">
                Các Quán đang có trên hệ thống ({restaurants.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {restaurants.map(rest => (
                  <div
                    key={rest.id}
                    className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-600 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-32 w-full bg-slate-950 relative overflow-hidden">
                        <img
                          src={rest.image}
                          alt={rest.name}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500 text-white">
                          {rest.category}
                        </span>
                      </div>

                      <div className="p-4 space-y-1">
                        <h4 className="font-extrabold text-sm text-white line-clamp-1">
                          {rest.name}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          📍 {rest.address || 'Khu vực ĐH Đà Nẵng'}
                        </p>
                        <p className="text-xs font-semibold text-orange-400 pt-1">
                          {rest.items?.length || 0} món ăn trong thực đơn
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-800/80 border-t border-slate-700/60 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedRestId(rest.id);
                          setActiveTab('dishes');
                        }}
                        className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                      >
                        <span>Chỉnh sửa menu quán →</span>
                      </button>

                      <button
                        onClick={() => handleDeleteRestaurant(rest.id, rest.name)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                        title="Xóa quán"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
             TAB 2: QUẢN LÝ THỰC ĐƠN & ẢNH TỪNG MÓN ĂN
             ======================================================== */
          <div className="space-y-6">
            {/* Thanh chọn quán đang quản lý */}
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">Đang chọn quản lý quán:</span>
                <select
                  value={selectedRestId || ''}
                  onChange={e => setSelectedRestId(e.target.value)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-600 text-xs font-bold text-orange-400 focus:outline-none"
                >
                  {restaurants.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.items?.length || 0} món)</option>
                  ))}
                </select>
              </div>

              {currentRest && (
                <span className="text-xs text-slate-400">
                  Tổng {currentRest.items?.length || 0} món ăn đang kinh doanh
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form thêm món mới vào quán này */}
              <div className="bg-slate-800 border border-slate-700 rounded-3xl p-5 h-fit shadow-xl space-y-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-orange-400" />
                  <span>Thêm món vào quán "{currentRest?.name}"</span>
                </h3>

                <form onSubmit={handleAddDish} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tên món ăn / đồ uống
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Trà Ô long nướng, Bún chả..."
                      value={newDishName}
                      onChange={e => setNewDishName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Giá tiền (VNĐ)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1000"
                      placeholder="Ví dụ: 30000"
                      value={newDishPrice}
                      onChange={e => setNewDishPrice(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-orange-400 font-bold focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Link hình ảnh riêng của món (URL)
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={newDishImage}
                      onChange={e => setNewDishImage(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      💡 Mỗi món đều có ảnh riêng hiển thị trong phòng gom đơn
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Phân loại nhóm món
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Trà sữa, Topping, Cơm, Canh..."
                      value={newDishCategory}
                      onChange={e => setNewDishCategory(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Mô tả món ăn
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Thành phần, vị ngọt, topping đi kèm..."
                      value={newDishDesc}
                      onChange={e => setNewDishDesc(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-orange-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 font-bold text-xs text-white rounded-xl shadow-lg shadow-orange-500/25 transition mt-2"
                  >
                    Thêm Món vào Thực Đơn
                  </button>
                </form>
              </div>

              {/* Danh sách món ăn của quán đang chọn */}
              <div className="lg:col-span-2 space-y-3">
                <h3 className="font-bold text-sm text-slate-300">
                  Thực đơn hiện tại của "{currentRest?.name}" ({currentRest?.items?.length || 0} món)
                </h3>

                <div className="space-y-2.5">
                  {currentRest?.items?.map(dish => (
                    <div
                      key={dish.id}
                      className="bg-slate-800 border border-slate-700 p-3.5 rounded-2xl flex items-center justify-between gap-4 hover:border-slate-600 transition"
                    >
                      {/* Ảnh riêng của món */}
                      <div className="w-16 h-16 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-slate-700">
                        <img
                          src={dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80'}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80';
                          }}
                        />
                      </div>

                      {/* Thông tin món */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{dish.name}</h4>
                          <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-slate-900 text-slate-400">
                            {dish.category || 'Món'}
                          </span>
                        </div>
                        {dish.desc && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{dish.desc}</p>
                        )}
                        <p className="text-xs font-black text-orange-400 mt-1">
                          {formatVND(dish.price)}
                        </p>
                      </div>

                      {/* Action */}
                      <button
                        onClick={() => handleDeleteDish(currentRest.id, dish.id, dish.name)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                        title="Xóa món"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {(!currentRest?.items || currentRest.items.length === 0) && (
                    <div className="text-center py-10 bg-slate-800/40 border border-dashed border-slate-700 rounded-2xl text-xs text-slate-400">
                      Quán này chưa có món nào. Hãy thêm món ăn ở form bên cạnh!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
