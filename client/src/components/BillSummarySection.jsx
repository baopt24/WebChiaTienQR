import React, { useState } from 'react';
import { Copy, Check, CreditCard, Lock, Unlock, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { formatVND } from '../utils/formatters';

export default function BillSummarySection({
  billSummary,
  currentUserName,
  hostName,
  hostAccount,
  roomId,
  isHost,
  onUnlockRoom,
  triggerToast
}) {
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [showAllDetails, setShowAllDetails] = useState(true);

  if (!billSummary) return null;

  const myBill = billSummary.memberBills?.find(
    m => m.userName.toLowerCase() === (currentUserName || '').trim().toLowerCase()
  );

  const transferMemo = `${roomId} ${currentUserName}`.toUpperCase();

  const handleCopyMemo = () => {
    navigator.clipboard.writeText(transferMemo);
    setCopiedMemo(true);
    triggerToast('Đã sao chép nội dung chuyển khoản!');
    setTimeout(() => setCopiedMemo(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Lock Notification Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-3xl shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xs">
          <Lock className="w-4 h-4 shrink-0" />
          <span>Đơn đã được khóa. Hệ thống đã tự động chia tiền theo tỷ lệ công bằng!</span>
        </div>
        {isHost && (
          <button
            onClick={onUnlockRoom}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-semibold flex items-center gap-1 transition shrink-0 ml-2"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Mở lại</span>
          </button>
        )}
      </div>

      {/* CURRENT USER'S PERSONALIZED VIETQR CARD */}
      {myBill ? (
        <div className="bg-white rounded-3xl p-5 border-2 border-orange-500 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-md">
                Phần tiền cá nhân của bạn
              </span>
              <h3 className="text-xl font-extrabold text-slate-800 mt-1">
                {currentUserName}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 line-through block">
                {formatVND(myBill.subtotal)}
              </span>
              <p className="text-2xl font-black text-orange-600">
                {formatVND(myBill.finalAmount)}
              </p>
            </div>
          </div>

          {/* Itemized Calculation Breakdown */}
          <div className="bg-slate-50 p-3.5 rounded-2xl text-xs space-y-1.5 text-slate-600 border border-slate-100">
            <div className="flex justify-between">
              <span>Tiền món gốc ({myBill.items.length} món):</span>
              <span className="font-semibold">{formatVND(myBill.subtotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Được chia voucher giảm giá:</span>
              <span className="font-semibold">-{formatVND(myBill.discountShare)}</span>
            </div>
            <div className="flex justify-between text-blue-600">
              <span>Phí vận chuyển chia đều:</span>
              <span className="font-semibold">+{formatVND(myBill.shippingShare)}</span>
            </div>
            <div className="flex justify-between font-bold pt-1.5 border-t border-slate-200 text-slate-800 text-[13px]">
              <span>Cần chuyển khoản cho {hostName}:</span>
              <span className="text-orange-600 font-black">{formatVND(myBill.finalAmount)}</span>
            </div>
          </div>

          {/* VietQR Display */}
          <div className="text-center pt-1">
            <p className="text-xs font-bold text-slate-700 mb-2.5">
              Quét mã VietQR chuyển tiền chính xác 1-chạm:
            </p>
            
            <div className="inline-block p-3 bg-white rounded-2xl shadow-md border border-slate-200">
              <img
                src={myBill.vietQRUrl}
                alt={`VietQR for ${currentUserName}`}
                className="w-52 h-52 mx-auto rounded-lg object-contain"
              />
            </div>

            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-xs text-slate-500">Nội dung CK:</span>
              <button
                onClick={handleCopyMemo}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition"
              >
                <span>{transferMemo}</span>
                {copiedMemo ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm text-center text-xs text-slate-500">
          Bạn chưa chọn món nào trong phiên gom đơn này.
        </div>
      )}

      {/* ALL MEMBERS EXPANDABLE BREAKDOWN */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowAllDetails(prev => !prev)}
        >
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              Bảng phân bổ chi phí ({billSummary.memberBills?.length || 0} người)
            </h3>
            <p className="text-[11px] text-slate-400">Xem minh bạch số tiền của từng thành viên</p>
          </div>
          <button className="p-1 rounded-lg bg-slate-100 text-slate-500">
            {showAllDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showAllDetails && (
          <div className="space-y-2 pt-2 divide-y divide-slate-100 text-xs">
            {billSummary.memberBills?.map(mb => (
              <div key={mb.userName} className="pt-2.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800">{mb.userName}</span>
                    {mb.userName.toLowerCase() === currentUserName.toLowerCase() && (
                      <span className="text-[9px] bg-orange-100 text-orange-700 font-bold px-1.5 py-0.2 rounded">
                        Bạn
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Gốc: {formatVND(mb.subtotal)} | Giảm: -{formatVND(mb.discountShare)} | Ship: +{formatVND(mb.shippingShare)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-orange-600 text-sm">
                    {formatVND(mb.finalAmount)}
                  </span>
                </div>
              </div>
            ))}

            <div className="pt-3 flex justify-between font-black text-sm text-slate-800 border-t-2 border-slate-100">
              <span>Tổng số tiền thực tế cả nhóm:</span>
              <span className="text-orange-600 text-base">{formatVND(billSummary.grandTotal)}</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
