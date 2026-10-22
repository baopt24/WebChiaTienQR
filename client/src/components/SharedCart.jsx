import React, { useState } from 'react';
import { ShoppingBag, Trash2, Store, Users } from 'lucide-react';
import { formatVND } from '../utils/formatters';

// Generate a consistent color for each user avatar
const AVATAR_COLORS = [
  'from-orange-400 to-amber-400',
  'from-blue-400 to-cyan-400',
  'from-purple-400 to-pink-400',
  'from-emerald-400 to-teal-400',
  'from-rose-400 to-pink-400',
  'from-indigo-400 to-blue-400',
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function SharedCart({ items = [], currentUserName, isHost, isLocked, onRemoveItem }) {
  const [groupBy, setGroupBy] = useState('member'); // 'member' | 'restaurant'

  const totalCount = items.length;
  const totalSubtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  // 1. Group items by member name
  const groupedByMember = items.reduce((acc, item) => {
    const member = item.userName || 'Ẩn danh';
    if (!acc[member]) acc[member] = [];
    acc[member].push(item);
    return acc;
  }, {});

  // 2. Group items by restaurant
  const groupedByRestaurant = items.reduce((acc, item) => {
    const rest = item.restaurantName || 'Quán tự chọn';
    if (!acc[rest]) acc[rest] = [];
    acc[rest].push(item);
    return acc;
  }, {});

  return (
    <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-100 rounded-lg">
            <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">
            Giỏ hàng chung
            <span className="ml-1.5 text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {totalCount} món
            </span>
          </h3>
        </div>
        <span className="text-sm font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
          {formatVND(totalSubtotal)}
        </span>
      </div>

      {/* Grouping Switcher */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400">Xem giỏ hàng theo:</span>
          <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setGroupBy('member')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                groupBy === 'member' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Người đặt</span>
            </button>
            <button
              onClick={() => setGroupBy('restaurant')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                groupBy === 'restaurant' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              <Store className="w-3 h-3" />
              <span>Theo Quán</span>
            </button>
          </div>
        </div>
      )}

      {totalCount === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <div className="text-5xl mb-3">🛒</div>
          <p className="text-sm font-semibold text-slate-500 mb-1">Giỏ hàng trống</p>
          <p className="text-xs text-slate-400">Chọn món từ thực đơn bên cạnh.<br />Giỏ hàng sẽ cập nhật theo thời gian thực!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groupBy === 'member' ? (
            /* GROUPED BY MEMBER */
            Object.entries(groupedByMember).map(([memberName, memberItems]) => {
              const isMe = memberName.toLowerCase() === (currentUserName || '').trim().toLowerCase();
              const memberSubtotal = memberItems.reduce((s, it) => s + (Number(it.price) || 0), 0);
              const avatarColor = getAvatarColor(memberName);

              return (
                <div 
                  key={memberName} 
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isMe ? 'bg-orange-50/60 border-orange-200' : 'bg-slate-50/70 border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      {/* Avatar */}
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-[11px] font-black shadow-sm shrink-0`}>
                        {memberName.charAt(0).toUpperCase()}
                      </div>
                      <span className={`text-xs font-bold ${isMe ? 'text-orange-700' : 'text-slate-700'}`}>
                        {memberName} {isMe && <span className="text-[10px] font-semibold text-orange-500">(Bạn)</span>}
                      </span>
                      <span className="text-[10px] text-slate-400">({memberItems.length} món)</span>
                    </div>
                    <span className="text-xs font-bold text-slate-600">
                      {formatVND(memberSubtotal)}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {memberItems.map(item => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between bg-white px-3 py-2 rounded-xl text-xs shadow-sm border border-slate-100/70"
                      >
                        <div className="flex-1 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-800">{item.dishName}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 font-medium">
                              {item.restaurantName}
                            </span>
                          </div>
                          {item.note && (
                            <span className="text-[10px] text-slate-400 italic block mt-0.5">
                              📝 {item.note}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-slate-700 font-semibold">{formatVND(item.price)}</span>
                          {(isMe || isHost) && !isLocked && (
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="text-slate-300 hover:text-rose-500 transition-colors p-1 rounded-md hover:bg-rose-50"
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
            })
          ) : (
            /* GROUPED BY RESTAURANT (Crucial for placing orders on delivery apps) */
            Object.entries(groupedByRestaurant).map(([restName, restItems]) => {
              const restSubtotal = restItems.reduce((s, it) => s + (Number(it.price) || 0), 0);

              return (
                <div key={restName} className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200/60">
                  <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-amber-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
                        <Store className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-xs font-black text-amber-900">{restName}</span>
                      <span className="text-[10px] text-slate-400">({restItems.length} món)</span>
                    </div>
                    <span className="text-xs font-black text-amber-800">
                      {formatVND(restSubtotal)}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {restItems.map(item => {
                      const isMe = item.userName?.toLowerCase() === (currentUserName || '').trim().toLowerCase();
                      return (
                        <div key={item.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl text-xs shadow-sm border border-slate-100">
                          <div className="flex-1 pr-2">
                            <span className="font-semibold text-slate-800">{item.dishName}</span>
                            <span className="text-[10px] text-slate-500 ml-1.5 font-medium">
                              (bởi: <strong>{item.userName}</strong>)
                            </span>
                            {item.note && (
                              <span className="text-[10px] text-slate-400 italic block mt-0.5">
                                📝 {item.note}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-slate-700 font-semibold">{formatVND(item.price)}</span>
                            {(isMe || isHost) && !isLocked && (
                              <button
                                onClick={() => onRemoveItem(item.id)}
                                className="text-slate-300 hover:text-rose-500 transition-colors p-1 rounded-md hover:bg-rose-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}
