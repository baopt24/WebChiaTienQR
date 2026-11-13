import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, Copy, Check, Sparkles, Receipt, Download, Building2, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatVND } from '../utils/formatters';

export default function BillReceiptModal({ room, billSummary, onClose, triggerToast }) {
  const [copied, setCopied] = useState(false);
  const receiptRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!billSummary) return null;

  const memberBills = billSummary.memberBills || [];
  const grandTotal = billSummary.grandTotal || 0;
  const shippingFee = billSummary.shippingFee || 0;
  const discountAmount = billSummary.discountAmount || 0;
  const subtotal = billSummary.subtotal || 0;

  const currentDateStr = new Date().toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Generate plain text formatted for Zalo / Messenger sharing
  const generateZaloText = () => {
    let text = `🧾 [BIÊN LAI GOM ĐƠN VKU - ${room?.id || 'ROOM'}]\n`;
    text += `👑 Chủ phòng: ${room?.hostName || 'Chủ phòng'}\n`;
    text += `📅 Thời gian: ${currentDateStr}\n`;
    text += `📍 Tiêu đề: ${room?.title || 'Gom đơn ăn uống'}\n`;
    text += `------------------------------------\n`;

    memberBills.forEach((mb, idx) => {
      const itemsStr = (mb.items || []).map(it => it.dishName).join(', ');
      const statusIcon = mb.paymentStatus === 'PAID' ? '✅ ĐÃ TRẢ' : '⏳ CHƯA TRẢ';
      text += `${idx + 1}. ${mb.userName}: ${itemsStr || 'Món'}\n`;
      text += `   👉 Cần thanh toán: ${formatVND(mb.finalAmount)} [${statusIcon}]\n`;
    });

    text += `------------------------------------\n`;
    text += `💵 Tiền món gốc: ${formatVND(subtotal)}\n`;
    if (discountAmount > 0) text += `🏷️ Giảm giá: -${formatVND(discountAmount)}\n`;
    if (shippingFee > 0) text += `🛵 Phí vận chuyển: +${formatVND(shippingFee)}\n`;
    text += `💰 TỔNG CỘNG: ${formatVND(grandTotal)}\n`;
    text += `🏦 STK nhận tiền (${room?.hostAccount?.bankId || 'MB'}): ${room?.hostAccount?.accountNo || ''} - ${room?.hostAccount?.accountName || ''}\n`;
    text += `✨ Cảm ơn mọi người đã tham gia gom đơn!`;

    return text;
  };

  const fallbackCopy = (text) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      if (triggerToast) triggerToast('Đã sao chép hóa đơn để dán vào Zalo/Messenger!');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      alert('Vui lòng chọn và sao chép thủ công văn bản hóa đơn.');
    }
  };

  const handleCopyZalo = () => {
    const text = generateZaloText();
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        if (triggerToast) triggerToast('Đã sao chép hóa đơn để dán vào Zalo/Messenger!');
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-down overflow-y-auto"
    >
      <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full space-y-4 animate-scale-in shadow-2xl border border-slate-100 relative z-10 max-h-[92vh] flex flex-col">
        {/* Top Header Controls (Hidden when printed) */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-800">
                Biên Lai Thanh Toán
              </h3>
              <p className="text-[10px] text-slate-400">
                Phiếu thanh toán &amp; chia tiền nhóm
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

        {/* Printable Receipt Paper Container */}
        <div
          ref={receiptRef}
          id="printable-receipt"
          className="flex-1 overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-4 text-xs font-mono"
        >
          {/* Receipt Header */}
          <div className="text-center space-y-1 border-b border-slate-300 pb-3">
            <h2 className="text-base font-black text-slate-900 font-sans tracking-tight">
              HÓA ĐƠN GOM ĐƠN VKU
            </h2>
            <p className="text-[10px] text-slate-500 font-sans">
              Hệ thống đặt hàng nhóm &amp; Phân chia VietQR tự động
            </p>
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 pt-1">
              <span className="font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                Phòng: {room?.id}
              </span>
              <span>•</span>
              <span>{currentDateStr}</span>
            </div>
            <p className="text-[11px] text-slate-700 font-bold pt-0.5">
              👑 Chủ phòng: {room?.hostName}
            </p>
          </div>

          {/* Member items list */}
          <div className="space-y-2.5">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-200">
              <span>Thành viên / Món</span>
              <span>Tiền trả</span>
            </div>

            {memberBills.map((mb, idx) => {
              const isPaid = mb.paymentStatus === 'PAID';
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1">
                      <span>{mb.userName}</span>
                      {isPaid ? (
                        <span className="text-[9px] text-emerald-600 bg-emerald-100/70 px-1.5 py-0.2 rounded font-sans font-semibold">
                          ✓ Đã trả
                        </span>
                      ) : (
                        <span className="text-[9px] text-rose-600 bg-rose-100/70 px-1.5 py-0.2 rounded font-sans font-semibold">
                          ⏳ Chưa trả
                        </span>
                      )}
                    </span>
                    <span className="text-orange-600">{formatVND(mb.finalAmount)}</span>
                  </div>

                  <div className="pl-2 space-y-0.5 text-[10px] text-slate-500">
                    {(mb.items || []).map((it, itIdx) => (
                      <div key={itIdx} className="flex justify-between">
                        <span className="truncate pr-2">• {it.dishName}</span>
                        <span className="shrink-0">{formatVND(it.price)}</span>
                      </div>
                    ))}
                    {(mb.discountShare > 0 || mb.shippingShare > 0) && (
                      <div className="flex justify-between text-[9px] text-slate-400 italic">
                        <span>Giảm: -{formatVND(mb.discountShare || 0)} | Ship: +{formatVND(mb.shippingShare || 0)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Math */}
          <div className="border-t border-slate-300 pt-2.5 space-y-1 text-[11px] text-slate-600">
            <div className="flex justify-between">
              <span>Tiền món gốc:</span>
              <span>{formatVND(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Voucher giảm giá:</span>
                <span>-{formatVND(discountAmount)}</span>
              </div>
            )}
            {shippingFee > 0 && (
              <div className="flex justify-between text-blue-600 font-bold">
                <span>Phí vận chuyển:</span>
                <span>+{formatVND(shippingFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-400">
              <span>TỔNG THU:</span>
              <span className="text-orange-600">{formatVND(grandTotal)}</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center pt-2 border-t border-dashed border-slate-300 space-y-1 text-[10px] text-slate-400 font-sans">
            <p>Tài khoản nhận tiền: {room?.hostAccount?.bankId} - {room?.hostAccount?.accountNo}</p>
            <p className="italic">Cảm ơn mọi người đã chia sẻ bữa ăn cùng nhau! ❤️</p>
          </div>
        </div>

        {/* Action Buttons Footer (Hidden when printed) */}
        <div className="space-y-2 shrink-0 print:hidden pt-1">
          <button
            onClick={handleCopyZalo}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 active:scale-98"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Đã sao chép vào clipboard!' : 'Sao chép biên lai gửi Zalo / Messenger'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePrint}
              className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>In / Lưu PDF</span>
            </button>
            <button
              onClick={onClose}
              className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
