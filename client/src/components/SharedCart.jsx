import React from 'react';
import { ShoppingBag, Trash2, User } from 'lucide-react';
import { formatVND } from '../utils/formatters';

export default function SharedCart({ items = [], currentUserName, isHost, isLocked, onRemoveItem }) {
  const totalCount = items.length;
  const totalSubtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  // Group items by member name
  const groupedByMember = items.reduce((acc, item) => {
    const member = item.userName || 'Ẩn danh';
    if (!acc[member]) acc[member] = [];
    acc[member].push(item);
    return acc;
  }, {});

  return (
    <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
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

      {totalCount === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <ShoppingBag className="w-10 h-10 mx-auto stroke-1 mb-2 text-slate-300" />
          <p className="text-xs">Chưa có ai chọn món. Danh sách món bạn bè chọn sẽ nhảy tại đây theo thời gian thực!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByMember).map(([memberName, memberItems]) => {
            const isMe = memberName.toLowerCase() === (currentUserName || '').trim().toLowerCase();
            const memberSubtotal = memberItems.reduce((s, it) => s + (Number(it.price) || 0), 0);

            return (
              <div 
                key={memberName} 
                className={`p-3.5 rounded-2xl border transition ${
                  isMe ? 'bg-orange-50/40 border-orange-200' : 'bg-slate-50/70 border-slate-100'
                }`}
              >
                {/* Member Header */}
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

                {/* Items of this member */}
                <div className="space-y-1.5">
                  {memberItems.map(item => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between bg-white px-3 py-2 rounded-xl text-xs shadow-2xs border border-slate-100/70"
                    >
                      <div className="flex-1 pr-2">
                        <span className="font-semibold text-slate-800">{item.dishName}</span>
                        {item.note && (
                          <span className="text-[10px] text-slate-400 ml-1.5 italic">
                            ({item.note})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-700 font-semibold">{formatVND(item.price)}</span>
                        
                        {/* Can remove if it's my item or if I am the Host */}
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
          })}
        </div>
      )}
    </section>
  );
}
