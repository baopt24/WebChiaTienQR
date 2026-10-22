import React, { useState } from 'react';
import { Lock, Truck, Tag, X, Sparkles, Calculator } from 'lucide-react';
import { formatVND } from '../utils/formatters';

export default function LockOrderModal({ totalSubtotal, onClose, onConfirmLock }) {
  const [shippingFee, setShippingFee] = useState('0');
  const [discountAmount, setDiscountAmount] = useState('0');

  const ship = Math.max(0, parseInt(shippingFee) || 0);
  const discount = Math.max(0, parseInt(discountAmount) || 0);
  const projectedGrandTotal = Math.max(0, totalSubtotal + ship - discount);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmLock({
      shippingFee: ship,
      discountAmount: discount
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-down">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 animate-scale-in shadow-2xl border border-slate-100"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-orange-500 to-amber-400 text-white rounded-2xl shadow-md shadow-orange-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-800">
                Chốt đơn &amp; Chia tiền
              </h3>
              <p className="text-[11px] text-slate-400">Nhập thông tin theo app giao hàng</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 pt-1">
          {/* Discount Field */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tổng Voucher Giảm giá (VNĐ)</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="Ví dụ: 30000"
              value={discountAmount}
              onChange={e => setDiscountAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          {/* Shipping Fee Field */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>Tổng Phí Vận chuyển / Ship (VNĐ)</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="Ví dụ: 16000"
              value={shippingFee}
              onChange={e => setShippingFee(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          {/* Live Calculation Preview */}
          <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-2 text-slate-600 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-200 pb-1.5">
              <Calculator className="w-3.5 h-3.5 text-orange-500" />
              <span>Bản xem trước số tiền cả nhóm:</span>
            </div>
            <div className="flex justify-between">
              <span>Tổng tiền món gốc:</span>
              <span className="font-semibold text-slate-800">{formatVND(totalSubtotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Voucher giảm giá:</span>
              <span className="font-bold">-{formatVND(discount)}</span>
            </div>
            <div className="flex justify-between text-blue-600">
              <span>Phí vận chuyển:</span>
              <span className="font-bold">+{formatVND(ship)}</span>
            </div>
            <div className="flex justify-between text-orange-600 font-black text-sm pt-2 border-t border-slate-200">
              <span>Thực tế cả nhóm phải trả:</span>
              <span>{formatVND(projectedGrandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition active:scale-95"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/30 hover:opacity-95 transition flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Khóa &amp; Sinh VietQR</span>
          </button>
        </div>
      </form>
    </div>
  );
}
