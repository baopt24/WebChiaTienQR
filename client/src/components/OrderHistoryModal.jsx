import React, { useState, useEffect } from 'react';
import { X, Clock, Receipt, RefreshCw, ShoppingBag, CheckCircle2, Laptop, Calendar, Store } from 'lucide-react';
import { SERVER_URL } from '../services/socket';
import { formatVND } from '../utils/formatters';

export default function OrderHistoryModal({ onClose }) {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllFilter, setShowAllFilter] = useState(false);

  const fetchHistory = (all = false) => {
    setLoading(true);
    const url = all ? `${SERVER_URL}/api/history?all=true` : `${SERVER_URL}/api/history`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setHistoryData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching order history:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHistory(showAllFilter);
  }, [showAllFilter]);

  const orders = historyData?.orders || [];
  const clientIp = historyData?.clientIp || '127.0.0.1';
  const totalSpent = historyData?.totalSpent || 0;
  const totalOrders = historyData?.totalOrders || 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-down">
      <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full space-y-4 animate-scale-in shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-tr from-orange-500 to-amber-400 text-white rounded-2xl shadow-md shadow-orange-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-800">
                Lịch Sử Mua Hàng
              </h3>
              <p className="text-[11px] text-slate-400">
                Lưu trữ tự động khi cả phòng hoàn tất chuyển tiền
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* IP Badge & Mode Switcher */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Laptop className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span className="text-[11px]">IP máy của bạn:</span>
            <span className="font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
              {clientIp}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setShowAllFilter(false)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                !showAllFilter
                  ? 'bg-orange-500 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Máy này
            </button>
            <button
              onClick={() => setShowAllFilter(true)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                showAllFilter
                  ? 'bg-orange-500 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Tất cả phòng
            </button>
            <button
              onClick={() => fetchHistory(showAllFilter)}
              className="p-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 transition ml-1"
              title="Làm mới"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 gap-2.5 shrink-0">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
            <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider block">
              Đơn hàng thành công
            </span>
            <span className="text-lg font-black text-slate-900 mt-0.5 block">
              {totalOrders} đơn
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              Tổng tiền đã thanh toán
            </span>
            <span className="text-lg font-black text-emerald-700 mt-0.5 block">
              {formatVND(totalSpent)}
            </span>
          </div>
        </div>

        {/* Orders Scrollable List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-orange-500" />
              <span>Đang tải lịch sử mua theo IP...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 mx-auto flex items-center justify-center text-slate-300">
                <ShoppingBag className="w-6 h-6 stroke-1" />
              </div>
              <p className="text-xs font-semibold text-slate-600">
                Chưa có đơn hàng nào hoàn tất từ IP này
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Khi phòng gom đơn được Chủ phòng xác nhận đủ tiền cho người cuối cùng, đơn hàng sẽ tự động lưu vĩnh viễn vào đây!
              </p>
            </div>
          ) : (
            orders.map((ord, idx) => {
              const dateStr = ord.completedAt
                ? new Date(ord.completedAt).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Vừa xong';

              return (
                <div
                  key={ord.id || idx}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2.5 transition hover:border-orange-300"
                >
                  {/* Top Bar of Card */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-orange-100 text-orange-700">
                          {ord.roomId}
                        </span>
                        <span className="text-[11px] font-bold text-slate-800">
                          {ord.userName} {ord.isHost && <span className="text-orange-500 font-semibold">(Host)</span>}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span>IP: {ord.clientIp}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-orange-600 block">
                        {formatVND(ord.finalAmount)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>HOÀN TẤT</span>
                      </span>
                    </div>
                  </div>

                  {/* Dishes list */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Món đã đặt ({ord.dishCount} món):
                    </span>
                    {(ord.dishes || []).map((d, dIdx) => (
                      <div
                        key={dIdx}
                        className="flex items-center justify-between text-xs py-0.5"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="font-semibold text-slate-700">{d.dishName}</span>
                          <span className="text-[9px] text-slate-400 ml-1.5">({d.restaurantName})</span>
                          {d.note && (
                            <span className="text-[10px] text-slate-400 italic block">
                              📝 {d.note}
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-slate-600 shrink-0">
                          {formatVND(d.price)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financial breakdown */}
                  <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] space-y-1 text-slate-500 border border-slate-100">
                    <div className="flex justify-between">
                      <span>Tiền món gốc:</span>
                      <span>{formatVND(ord.subtotal)}</span>
                    </div>
                    {ord.discountShare > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Chia sẻ voucher giảm giá:</span>
                        <span>-{formatVND(ord.discountShare)}</span>
                      </div>
                    )}
                    {ord.shippingShare > 0 && (
                      <div className="flex justify-between text-blue-600">
                        <span>Chia sẻ phí vận chuyển:</span>
                        <span>+{formatVND(ord.shippingShare)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-200 text-xs">
                      <span>Đã thanh toán cho {ord.hostName}:</span>
                      <span className="text-orange-600 font-black">{formatVND(ord.finalAmount)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
