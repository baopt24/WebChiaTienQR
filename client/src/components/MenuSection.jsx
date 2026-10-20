import React, { useState } from 'react';
import { Plus, Search, Store, Sparkles, Filter } from 'lucide-react';
import { formatVND } from '../utils/formatters';

export default function MenuSection({ restaurants = [], isLocked, onAddItem, onOpenCustomModal }) {
  const [selectedRestId, setSelectedRestId] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [itemNoteMap, setItemNoteMap] = useState({});

  // Flatten all dishes and attach restaurant metadata
  const allDishes = restaurants.flatMap(rest => 
    (rest.items || []).map(item => ({
      ...item,
      restaurantId: rest.id,
      restaurantName: rest.name
    }))
  );

  // Extract unique categories based on selected restaurant
  const candidateDishesForCat = selectedRestId === 'ALL'
    ? allDishes
    : allDishes.filter(d => d.restaurantId === selectedRestId);

  const categories = ['ALL', ...new Set(candidateDishesForCat.map(d => d.category || 'Món chính'))];

  // Filter dishes by restaurant, category, and search keyword
  const filteredDishes = allDishes.filter(d => {
    const matchesRest = selectedRestId === 'ALL' || d.restaurantId === selectedRestId;
    const matchesCat = selectedCategory === 'ALL' || (d.category || 'Món chính') === selectedCategory;
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.restaurantName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRest && matchesCat && matchesSearch;
  });

  const handleNoteChange = (dishId, note) => {
    setItemNoteMap(prev => ({ ...prev, [dishId]: note }));
  };

  const handleAddWithNote = (dish) => {
    const note = itemNoteMap[dish.id] || '';
    onAddItem({
      name: dish.name,
      price: dish.price,
      restaurantName: dish.restaurantName
    }, note);
    setItemNoteMap(prev => ({ ...prev, [dish.id]: '' }));
  };

  return (
    <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3.5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Store className="w-4 h-4 text-orange-500" />
            <span>Thực đơn các quán ăn & trà sữa</span>
          </h3>
          <p className="text-[11px] text-slate-400">Chọn món từ nhiều quán khác nhau trong cùng một phòng</p>
        </div>
        {!isLocked && (
          <button
            onClick={onOpenCustomModal}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2.5 py-1.5 rounded-xl transition shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm món/quán</span>
          </button>
        )}
      </div>

      {/* 1. RESTAURANT SELECTOR TABS */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => {
            setSelectedRestId('ALL');
            setSelectedCategory('ALL');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
            selectedRestId === 'ALL'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>Tất cả quán ({allDishes.length})</span>
        </button>

        {restaurants.map(rest => (
          <button
            key={rest.id}
            onClick={() => {
              setSelectedRestId(rest.id);
              setSelectedCategory('ALL');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedRestId === rest.id
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{rest.name}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedRestId === rest.id ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {rest.items?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* 2. SEARCH & CATEGORY FILTER */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm tên món hoặc tên quán..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 bg-slate-50/50"
          />
        </div>

        {/* Category Pills */}
        {categories.length > 2 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'Tất cả nhóm' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. DISHES LIST */}
      <div className="space-y-2.5 pt-1">
        {filteredDishes.map(dish => (
          <div
            key={dish.id}
            className="p-3 rounded-2xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/20 transition flex flex-col gap-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                {/* Restaurant tag badge */}
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 inline-flex items-center gap-1">
                    <Store className="w-2.5 h-2.5" />
                    <span>{dish.restaurantName}</span>
                  </span>
                  {dish.category && (
                    <span className="text-[9px] font-medium text-slate-400">
                      • {dish.category}
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-800">{dish.name}</h4>
                {dish.desc && (
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{dish.desc}</p>
                )}
                <p className="text-xs font-black text-orange-600 mt-1">
                  {formatVND(dish.price)}
                </p>
              </div>

              {!isLocked ? (
                <button
                  onClick={() => handleAddWithNote(dish)}
                  className="px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white shadow-md shadow-orange-500/20 transition flex items-center gap-1 text-xs font-bold shrink-0 self-center"
                >
                  <Plus className="w-4 h-4" />
                  <span>Chọn</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium shrink-0 self-center">
                  Đã chốt
                </span>
              )}
            </div>

            {/* Note input for this item */}
            {!isLocked && (
              <input
                type="text"
                placeholder="Ghi chú món (VD: ít đường, không đá, nhiều tương...)"
                value={itemNoteMap[dish.id] || ''}
                onChange={e => handleNoteChange(dish.id, e.target.value)}
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-orange-400 bg-slate-50/60"
              />
            )}
          </div>
        ))}

        {filteredDishes.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs">
            Không tìm thấy món nào phù hợp. Bấm <strong>"Thêm món/quán"</strong> để tự nhập món bạn thích!
          </div>
        )}
      </div>
    </section>
  );
}
