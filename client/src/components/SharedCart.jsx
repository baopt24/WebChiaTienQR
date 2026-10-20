import React, { useState } from 'react';
import { ShoppingBag, Trash2, Store, Users } from 'lucide-react';
import { formatVND } from '../utils/formatters';

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
          <ShoppingBag className="w-5 h-5 text-orange-500" />
          <h3 className="font-bold text-slate-800 text-sm">
            Giỏ hàng chung ({totalCount} món)
          </h3>
        </div>
        <span className="text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
          {formatVND(totalSubtotal)}
        </span>
      </div>

      {/* Grouping Switcher */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400">Xem giỏ hàng theo:</span>
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setGroupBy('member')}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                groupBy === 'member' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Người đặt</span>
            </button>
            <button
              onClick={() => setGroupBy('restaurant')}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                groupBy === 'restaurant' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              <Store className="w-3 h-3" />
              <span>Theo Quán</span>
            </button>
          </div>
        </div>
      )}

      {totalCount === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <ShoppingBag className="w-10 h-10 mx-auto stroke-1 mb-2 text-slate-300" />
          <p className="text-xs">Chưa có ai chọn món. Danh sách món bạn bè chọn sẽ nhảy tại đây theo thời gian thực!</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {groupBy === 'member' ? (
            /* GROUPED BY MEMBER */
            Object.entries(groupedByMember).map(([memberName, memberItems]) => {
              const isMe = memberName.toLowerCase() === (currentUserName || '').trim().toLowerCase();
              const memberSubtotal = memberItems.reduce((s, it) => s + (Number(it.price) || 0), 0);

              return (
                <div 
                  key={memberName} 
                  className={`p-3.5 rounded-2xl border transition ${
                    isMe ? 'bg-orange-50/40 border-orange-200' : 'bg-slate-50/70 border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${isMe ? 'bg-orange-500 ring-2 ring-orange-200' : 'bg-slate-400'}`} />
                      <span className={`text-xs font-bold ${isMe ? 'text-orange-700' : 'text-slate-700'}`}>
                        {memberName} {isMe && '(Bạn)'}
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
                        className="flex items-center justify-between bg-white px-3 py-2 rounded-xl text-xs shadow-2xs border border-slate-100/70"
                      >
                        <div className="flex-1 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800">{item.dishName}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-medium">
                              {item.restaurantName}
                            </span>
                          </div>
                          {item.note && (
                            <span className="text-[10px] text-slate-400 italic block mt-0.5">
                              Ghi chú: {item.note}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-700 font-semibold">{formatVND(item.price)}</span>
                          {(isMe || isHost) && !isLocked && (
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="text-slate-300 hover:text-rose-500 transition p-1 rounded-md"
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
                <div key={restName} className="p-3.5 rounded-2xl bg-amber-50/30 border border-amber-200/60">
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-amber-100">
                    <div className="flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-amber-700" />
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
                        <div key={item.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl text-xs shadow-2xs border border-slate-100">
                          <div className="flex-1 pr-2">
                            <span className="font-semibold text-slate-800">{item.dishName}</span>
                            <span className="text-[10px] text-slate-500 ml-1.5 font-medium">
                              (bởi: <strong>{item.userName}</strong>)
                            </span>
                            {item.note && (
                              <span className="text-[10px] text-slate-400 italic block">
                                Ghi chú: {item.note}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-slate-700 font-semibold">{formatVND(item.price)}</span>
                            {(isMe || isHost) && !isLocked && (
                              <button
                                onClick={() => onRemoveItem(item.id)}
                                className="text-slate-300 hover:text-rose-500 transition p-1 rounded-md"
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
