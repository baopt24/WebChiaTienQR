import React, { useState } from 'react';
import { Plus, Search, Tag, Sparkles } from 'lucide-react';
import { formatVND } from '../utils/formatters';

export default function MenuSection({ menu = [], isLocked, onAddItem, onOpenCustomModal }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [itemNoteMap, setItemNoteMap] = useState({});

  // Extract unique categories
  const categories = ['ALL', ...new Set(menu.map(item => item.category || 'Món chính'))];

  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === 'ALL' || (item.category || 'Món chính') === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleNoteChange = (dishId, note) => {
    setItemNoteMap(prev => ({ ...prev, [dishId]: note }));
  };

  const handleAddWithNote = (dish) => {
    const note = itemNoteMap[dish.id] || '';
    onAddItem(dish, note);
    // clear note
    setItemNoteMap(prev => ({ ...prev, [dish.id]: '' }));
  };

  return (
    <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Thực đơn quán</h3>
          <p className="text-[11px] text-slate-400">Chọn món bạn muốn ăn để thêm vào giỏ hàng chung</p>
        </div>
        {!isLocked && (
          <button
            onClick={onOpenCustomModal}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2.5 py-1.5 rounded-xl transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Món khác</span>
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      {categories.length > 2 && (
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat 
                  ? 'bg-orange-500 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'Tất cả' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Menu List */}
      <div className="space-y-2.5">
        {filteredMenu.map(dish => (
          <div
            key={dish.id}
            className="p-3.5 rounded-2xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/20 transition flex flex-col gap-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-800">{dish.name}</h4>
                  {dish.category && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                      {dish.category}
                    </span>
                  )}
                </div>
                {dish.desc && (
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{dish.desc}</p>
                )}
                <p className="text-xs font-extrabold text-orange-600 mt-1">
                  {formatVND(dish.price)}
                </p>
              </div>

              {!isLocked ? (
                <button
                  onClick={() => handleAddWithNote(dish)}
                  className="px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white shadow-md shadow-orange-500/20 transition flex items-center gap-1 text-xs font-bold shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Chọn món</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium shrink-0">Đã chốt</span>
              )}
            </div>

            {/* Note input for this item */}
            {!isLocked && (
              <input
                type="text"
                placeholder="Ghi chú (VD: ít đá, 50% đường, không cay...)"
                value={itemNoteMap[dish.id] || ''}
                onChange={e => handleNoteChange(dish.id, e.target.value)}
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-orange-400 bg-slate-50/60"
              />
            )}
          </div>
        ))}

        {filteredMenu.length === 0 && (
          <div className="text-center py-6 text-slate-400 text-xs">
            Chưa có món nào trong danh mục này. Hãy bấm "Món khác" để thêm!
          </div>
        )}
      </div>
    </section>
  );
}
