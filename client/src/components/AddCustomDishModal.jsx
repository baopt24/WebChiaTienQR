import React, { useState } from 'react';
import { Plus, X, Store } from 'lucide-react';

export default function AddCustomDishModal({ existingRestaurants = [], onClose, onAddCustomDish }) {
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [selectedRestName, setSelectedRestName] = useState(existingRestaurants[0]?.name || 'Quán tự do');
  const [newRestName, setNewRestName] = useState('');
  const [dishCategory, setDishCategory] = useState('Món tự chọn');
  const [dishNote, setDishNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    const finalRestName = selectedRestName === '__NEW__' 
      ? (newRestName.trim() || 'Quán tự do')
      : selectedRestName;

    onAddCustomDish({
      name: dishName.trim(),
      price: Math.max(0, parseInt(dishPrice) || 0),
      restaurantName: finalRestName,
      category: dishCategory.trim() || 'Món tự chọn',
      desc: dishNote.trim() || 'Món thêm tùy chỉnh'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 animate-scale-up shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
            <Store className="w-4 h-4 text-orange-500" />
            <span>Thêm món & quán vào thực đơn</span>
          </h3>
          <button type="button" onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Restaurant Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Thuộc Quán ăn / Trà sữa nào?
            </label>
            <select
              value={selectedRestName}
              onChange={e => setSelectedRestName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-orange-500 font-medium"
            >
              {existingRestaurants.map(r => (
                <option key={r.id || r.name} value={r.name}>{r.name}</option>
              ))}
              <option value="__NEW__">➕ Nhập quán mới...</option>
            </select>
          </div>

          {selectedRestName === '__NEW__' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên quán mới
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Bún chả Hà Nội, Bánh mì Cô Ba..."
                value={newRestName}
                onChange={e => setNewRestName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên món ăn / Đồ uống
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Cơm gà chiên mắm, Trà mãng cầu..."
              value={dishName}
              onChange={e => setDishName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Giá tiền ước tính (VNĐ)
            </label>
            <input
              type="number"
              required
              min="0"
              step="1000"
              placeholder="Ví dụ: 35000"
              value={dishPrice}
              onChange={e => setDishPrice(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú món riêng của bạn (Tùy chọn)
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Ít cay, nhiều sốt, 50% đường..."
              value={dishNote}
              onChange={e => setDishNote(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-200 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-95 transition"
          >
            Thêm vào Menu & Giỏ
          </button>
        </div>
      </form>
    </div>
  );
}
