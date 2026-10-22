import React, { useState } from 'react';
import { Plus, Search, Store, ArrowLeft, ChevronRight, Tag, UtensilsCrossed } from 'lucide-react';
import { formatVND } from '../utils/formatters';

export default function MenuSection({ restaurants = [], cartItems = [], isLocked, onAddItem }) {
  // State: currently active restaurant (null = show restaurant list)
  const [activeRestId, setActiveRestId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [itemNoteMap, setItemNoteMap] = useState({});

  const activeRestaurant = restaurants.find(r => r.id === activeRestId);

  // Count items already chosen per restaurant in the cart
  const restCartCounts = cartItems.reduce((acc, item) => {
    const rName = item.restaurantName || '';
    acc[rName] = (acc[rName] || 0) + 1;
    return acc;
  }, {});

  const handleNoteChange = (dishId, note) => {
    setItemNoteMap(prev => ({ ...prev, [dishId]: note }));
  };

  const handleAddWithNote = (dish) => {
    const note = itemNoteMap[dish.id] || '';
    onAddItem({
      name: dish.name,
      price: dish.price,
      restaurantName: activeRestaurant?.name || 'Quán tự chọn'
    }, note);
    setItemNoteMap(prev => ({ ...prev, [dish.id]: '' }));
  };

  // -------------------------------------------------------------
  // VIEW 1: RESTAURANT CATALOG (CHỌN QUÁN)
  // -------------------------------------------------------------
  if (!activeRestaurant) {
    const filteredRestaurants = restaurants.filter(r => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <div className="p-1.5 bg-orange-100 rounded-lg">
                <Store className="w-3.5 h-3.5 text-orange-600" />
              </div>
              <span>Danh sách Quán ăn &amp; Trà sữa</span>
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {restaurants.length}
              </span>
            </h3>
            <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
              Ấn để xem menu
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 ml-1">
            Chọn quán bạn muốn đặt món. Mỗi quán có thực đơn và hình ảnh món ăn riêng biệt!
          </p>
        </div>

        {/* Search restaurant */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm tên quán hoặc loại đồ uống..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 bg-slate-50/50 transition-all"
          />
        </div>

        {/* Restaurant Cards Grid — 2 cols on mobile, 2-3 cols on larger */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          {filteredRestaurants.map(rest => {
            const chosenCount = restCartCounts[rest.name] || 0;

            return (
              <div
                key={rest.id}
                onClick={() => {
                  setActiveRestId(rest.id);
                  setSearchTerm('');
                  setSelectedCategory('ALL');
                }}
                className="group cursor-pointer rounded-2xl border border-slate-100 hover:border-orange-300 hover:shadow-lg transition-all duration-200 overflow-hidden bg-white flex flex-col active:scale-[0.98]"
              >
                {/* Restaurant Cover Image */}
                <div className="relative h-28 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={rest.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80'}
                    alt={rest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-400"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                  
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between text-white">
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500 text-white inline-block">
                        {rest.category || 'Quán ăn'}
                      </span>
                      <h4 className="text-xs font-extrabold line-clamp-1 mt-0.5 text-white drop-shadow">
                        {rest.name}
                      </h4>
                    </div>

                    {chosenCount > 0 && (
                      <span className="text-[9px] font-extrabold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full shadow-xs shrink-0 ml-1">
                        +{chosenCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-2.5 flex items-center justify-between text-xs text-slate-500 bg-white">
                  <span className="text-[10px] text-slate-400">
                    {rest.items?.length || 0} món
                  </span>
                  <div className="flex items-center gap-0.5 text-orange-600 font-bold text-[11px] shrink-0 group-hover:translate-x-0.5 transition">
                    <span>Xem</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}

          {filteredRestaurants.length === 0 && (
            <div className="col-span-2 text-center py-10 text-slate-400 text-xs">
              <UtensilsCrossed className="w-10 h-10 mx-auto stroke-1 mb-2 text-slate-300" />
              Không tìm thấy quán nào với từ khóa &ldquo;{searchTerm}&rdquo;.
            </div>
          )}
        </div>
      </section>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: DEDICATED MENU OF SELECTED RESTAURANT
  // (Mỗi món có ảnh riêng, giá tiền, ghi chú & nút thêm)
  // -------------------------------------------------------------
  const dishes = activeRestaurant.items || [];
  const categories = ['ALL', ...new Set(dishes.map(d => d.category || 'Món chính'))];

  const filteredDishes = dishes.filter(d => {
    const matchesCat = selectedCategory === 'ALL' || (d.category || 'Món chính') === selectedCategory;
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const chosenFromThisRest = restCartCounts[activeRestaurant.name] || 0;

  return (
    <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between border-b pb-3 border-slate-100">
        <button
          onClick={() => {
            setActiveRestId(null);
            setSearchTerm('');
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 bg-slate-100 hover:bg-orange-50 px-3 py-2 rounded-xl transition-all active:scale-[0.98]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Chọn quán khác</span>
        </button>

        {chosenFromThisRest > 0 && (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ✓ Đã chọn {chosenFromThisRest} món
          </span>
        )}
      </div>

      {/* Restaurant Info Header with Banner */}
      <div className="relative rounded-2xl overflow-hidden">
        <img
          src={activeRestaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80'}
          alt={activeRestaurant.name}
          className="w-full h-24 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 flex items-center p-4 gap-3">
          <div className="flex-1 text-white">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500 text-white inline-block">
              {activeRestaurant.category || 'Quán ăn'}
            </span>
            <h3 className="text-base font-extrabold line-clamp-1 mt-1">
              {activeRestaurant.name}
            </h3>
            <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
              {activeRestaurant.address || 'Khu vực Làng Đại học'}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Category Filter for this Restaurant */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Tìm món trong thực đơn ${activeRestaurant.name}...`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 bg-slate-50/50 transition-all"
          />
        </div>

        {/* Category Pills */}
        {categories.length > 2 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'Tất cả món' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* DISHES LIST - MỖI MÓN CÓ ẢNH RIÊNG */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredDishes.map(dish => (
          <div
            key={dish.id}
            className="rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all bg-white overflow-hidden"
          >
            {/* Dish image */}
            <div className="h-32 overflow-hidden bg-slate-100 relative">
              <img
                src={dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80'}
                alt={dish.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  // Fallback to default delicious image if link broken
                  e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80';
                }}
              />
              {dish.category && (
                <span className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-black/50 text-white backdrop-blur-sm">
                  {dish.category}
                </span>
              )}
            </div>

            {/* Dish info */}
            <div className="p-3 flex flex-col gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{dish.name}</h4>
                {dish.desc && (
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {dish.desc}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-orange-600">
                  {formatVND(dish.price)}
                </p>

                {!isLocked ? (
                  <button
                    onClick={() => handleAddWithNote(dish)}
                    className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white shadow-md shadow-orange-500/25 transition-all flex items-center gap-1 text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Chọn</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">Đã chốt</span>
                )}
              </div>

              {/* Input ghi chú cho món */}
              {!isLocked && (
                <input
                  type="text"
                  placeholder="Ghi chú (VD: ít đá, 50% đường...)"
                  value={itemNoteMap[dish.id] || ''}
                  onChange={e => handleNoteChange(dish.id, e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-400 bg-slate-50/60 transition-all"
                />
              )}
            </div>
          </div>
        ))}

        {filteredDishes.length === 0 && (
          <div className="col-span-2 text-center py-10 text-slate-400 text-xs">
            <UtensilsCrossed className="w-10 h-10 mx-auto stroke-1 mb-2 text-slate-300" />
            Quán này chưa có món nào trong phân loại &ldquo;{selectedCategory}&rdquo;.
          </div>
        )}
      </div>
    </section>
  );
}
