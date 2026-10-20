import React, { useState } from 'react';
import { Lock, DollarSign, Truck, Tag, AlertCircle } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 animate-scale-up shadow-2xl border border-slate-100"
      >
        <div className="flex items-center gap-2 text-orange-600">
          <div className="p-2 bg-orange-100 rounded-xl">
            <Lock className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">
              Khóa đơn & Chia tiền
            </h3>
            <p className="text-[11px] text-slate-400">Nhập phí thực tế trên app đặt món (ShopeeFood/Grab)</p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {/* Discount Field */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tổng Voucher Giảm giá (VNĐ)</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="Ví dụ: 30000"
              value={discountAmount}
              onChange={e => setDiscountAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Shipping Fee Field */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>Tổng Phí Vận chuyển / Phí Ship (VNĐ)</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="Ví dụ: 16000"
              value={shippingFee}
              onChange={e => setShippingFee(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Live Calculation Preview */}
          <div className="bg-slate-50 p-3.5 rounded-2xl text-xs space-y-1.5 text-slate-600 border border-slate-100">
            <div className="flex justify-between">
              <span>Tổng tiền món gốc:</span>
              <span className="font-bold">{formatVND(totalSubtotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Voucher giảm giá:</span>
              <span className="font-semibold">-{formatVND(discount)}</span>
            </div>
            <div className="flex justify-between text-blue-600">
              <span>Phí vận chuyển:</span>
              <span className="font-semibold">+{formatVND(ship)}</span>
            </div>
            <div className="flex justify-between text-orange-600 font-black text-sm pt-2 border-t border-slate-200">
              <span>Thực tế cả nhóm phải trả:</span>
              <span>{formatVND(projectedGrandTotal)}</span>
            </div>
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
            className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/30 hover:opacity-95 transition"
          >
            Khóa & Sinh VietQR
          </button>
        </div>
      </form>
    </div>
  );
}
