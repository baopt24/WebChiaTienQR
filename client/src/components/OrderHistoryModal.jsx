import React, { useState, useEffect } from 'react';
import { X, Clock, Receipt, RefreshCw, ShoppingBag, CheckCircle2, Laptop, Calendar, Store, ShieldCheck, Lock } from 'lucide-react';
import { SERVER_URL } from '../services/socket';
import { formatVND } from '../utils/formatters';

export default function OrderHistoryModal({ onClose }) {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = () => {
    setLoading(true);
    fetch(`${SERVER_URL}/api/history`)
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
    fetchHistory();
  }, []);

  const orders = historyData?.orders || [];
  const clientIp = historyData?.clientIp || '127.0.0.1';
  const totalSpent = historyData?.totalSpent || 0;
  const totalOrders = historyData?.totalOrders || 0;
  const encryptedStorage = historyData?.encryptedStorage || 'AES-256-GCM';

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
                Lưu tự động khi người cuối cùng chuyển tiền xong
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

        {/* Security & Privacy Banner */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2 shrink-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-700">
              <Laptop className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span className="text-[11px] font-semibold">IP thiết bị này:</span>
              <span className="font-mono font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200 text-[11px]">
                {clientIp}
              </span>
            </div>

            <button
              onClick={fetchHistory}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold transition shadow-2xs"
              title="Làm mới lịch sử"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-orange-500' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>

          {/* Privacy & Encryption Guarantee Notice */}
          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-200/60 text-[10px] text-slate-500">
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-100">
              <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">Chỉ người trong phòng xem được</span>
            </div>
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-100">
              <ShieldCheck className="w-3 h-3 text-indigo-600 shrink-0" />
              <span className="truncate">Mã hóa {encryptedStorage} CSDL</span>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 gap-2.5 shrink-0">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
            <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider block">
              Đơn bạn đã tham gia
            </span>
            <span className="text-lg font-black text-slate-900 mt-0.5 block">
              {totalOrders} đơn
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              Tổng tiền bạn đã chi
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
              <span>Đang giải mã và tải lịch sử đơn hàng...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 mx-auto flex items-center justify-center text-slate-300">
                <ShoppingBag className="w-6 h-6 stroke-1" />
              </div>
              <p className="text-xs font-semibold text-slate-600">
                Chưa có đơn hàng nào từ thiết bị này
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Chỉ những thành viên trực tiếp tham gia phòng (ví dụ: máy của bạn và đồng nghiệp trong phòng) mới xem được lịch sử tại máy mình sau khi thanh toán xong!
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
                        <span className="font-mono text-[9px] text-slate-400">IP: {ord.clientIp}</span>
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
