import React, { useState } from 'react';
import { 
  Copy, Check, CreditCard, Lock, Unlock, CheckCircle2, 
  Clock, AlertTriangle, ChevronDown, ChevronUp, Sparkles, Send, RefreshCw, XCircle
} from 'lucide-react';
import { socket } from '../services/socket';
import { formatVND } from '../utils/formatters';
import { playTingTingSound } from '../utils/audio';

// Helper for vibrant avatar initials
const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarGradient = (name) => {
  const gradients = [
    'from-orange-500 to-amber-500',
    'from-blue-500 to-indigo-500',
    'from-emerald-500 to-teal-500',
    'from-purple-500 to-pink-500',
    'from-rose-500 to-red-500',
    'from-cyan-500 to-blue-500'
  ];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

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
  const [proofNote, setProofNote] = useState('');

  if (!billSummary) return null;

  const memberBills = billSummary.memberBills || [];
  const myBill = memberBills.find(
    m => m.userName.toLowerCase() === (currentUserName || '').trim().toLowerCase()
  );

  // Statistics
  const totalMembers = memberBills.length;
  const paidMembers = memberBills.filter(m => m.paymentStatus === 'PAID').length;
  const pendingMembers = memberBills.filter(m => m.paymentStatus === 'PENDING').length;
  const collectedAmount = memberBills
    .filter(m => m.paymentStatus === 'PAID')
    .reduce((sum, m) => sum + m.finalAmount, 0);
  const percentCollected = totalMembers > 0 ? Math.round((paidMembers / totalMembers) * 100) : 0;

  const transferMemo = `${roomId} ${currentUserName}`.toUpperCase();

  const handleCopyMemo = () => {
    navigator.clipboard.writeText(transferMemo);
    setCopiedMemo(true);
    triggerToast('Đã sao chép nội dung chuyển khoản!');
    setTimeout(() => setCopiedMemo(false), 2000);
  };

  // Step 1: Member reports paid
  const handleReportPaid = () => {
    socket.emit('report_paid', {
      roomId,
      memberName: currentUserName,
      proofNote: proofNote.trim()
    });
    playTingTingSound();
    triggerToast('Đã gửi thông báo cho Chủ phòng! Vui lòng chờ xác nhận.');
  };

  // Step 2: Host confirms payment
  const handleConfirmPayment = (memberName) => {
    socket.emit('confirm_payment', {
      roomId,
      memberName
    });
    playTingTingSound();
    triggerToast(`Đã xác nhận thanh toán thành công cho ${memberName}!`);
  };

  // Step 3: Host rejects payment
  const handleRejectPayment = (memberName) => {
    socket.emit('reject_payment', {
      roomId,
      memberName,
      reason: 'Chưa thấy tiền vào tài khoản'
    });
    triggerToast(`Đã báo chưa nhận được tiền từ ${memberName}!`);
  };

  return (
    <div className="space-y-4 animate-scale-in">
      {/* 1. Header Banner & Lock State */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white p-4 sm:p-5 rounded-3xl shadow-xl shadow-orange-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white/20 backdrop-blur rounded-xl shrink-0">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xs sm:text-sm block">Đơn đã khóa &amp; Chia tiền tự động</span>
            <span className="text-[11px] text-orange-100 block">Hệ thống phân bổ phí ship &amp; voucher theo tỷ lệ công bằng</span>
          </div>
        </div>
        {isHost && (
          <button
            onClick={onUnlockRoom}
            className="px-3.5 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 ml-2 backdrop-blur active:scale-95"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Mở lại</span>
          </button>
        )}
      </div>

      {/* 2. Collection Progress Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <span>Tiến độ thanh toán cả phòng</span>
            {percentCollected === 100 && <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-bounce" />}
          </span>
          <span className="font-black text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100">
            {paidMembers}/{totalMembers} người ({percentCollected}%)
          </span>
        </div>

        {/* Animated Bar */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5">
          <div 
            className="bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${percentCollected}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
          <span>Đã thu: <strong className="text-emerald-600 font-bold">{formatVND(collectedAmount)}</strong></span>
          <span>Tổng cần thu: <strong className="text-slate-800 font-bold">{formatVND(billSummary.grandTotal)}</strong></span>
        </div>
      </div>

      {/* 3. CURRENT USER'S PERSONALIZED BILL & VIETQR CARD */}
      {myBill ? (
        <div className={`bg-white rounded-3xl p-5 sm:p-6 border-2 shadow-xl space-y-4 transition-all duration-300 ${
          myBill.paymentStatus === 'PAID'
            ? 'border-emerald-500 shadow-emerald-500/10 bg-emerald-50/20'
            : myBill.paymentStatus === 'PENDING'
            ? 'border-amber-400 shadow-amber-500/10 bg-amber-50/20'
            : 'border-orange-500 shadow-orange-500/10'
        }`}>
          {/* Header of personal bill */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-100/70 px-2.5 py-0.5 rounded-md">
                  Phần tiền của bạn
                </span>
                
                {/* Status Badge */}
                {myBill.paymentStatus === 'PAID' && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ĐÃ THANH TOÁN</span>
                  </span>
                )}
                {myBill.paymentStatus === 'PENDING' && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 inline-flex items-center gap-1 animate-pulse">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>CHỜ XÁC NHẬN</span>
                  </span>
                )}
                {myBill.paymentStatus === 'UNPAID' && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 inline-flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>CHƯA THANH TOÁN</span>
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-slate-800 mt-1">
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
          <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-2 text-slate-600 border border-slate-100">
            <div className="flex justify-between">
              <span>Tiền món gốc ({myBill.items.length} món):</span>
              <span className="font-semibold text-slate-800">{formatVND(myBill.subtotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Được chia voucher giảm giá:</span>
              <span className="font-bold">-{formatVND(myBill.discountShare)}</span>
            </div>
            <div className="flex justify-between text-blue-600">
              <span>Phí vận chuyển chia sẻ:</span>
              <span className="font-bold">+{formatVND(myBill.shippingShare)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-slate-200 text-slate-800 text-sm">
              <span>Cần chuyển cho {hostName}:</span>
              <span className="text-orange-600 font-black">{formatVND(myBill.finalAmount)}</span>
            </div>
          </div>

          {/* Conditional View based on Payment Status */}
          {myBill.paymentStatus === 'PAID' ? (
            /* PAID VIEW: SUCCESSFUL RECEIPT */
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-scale-in">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/30">
                <Check className="w-7 h-7 stroke-3" />
              </div>
              <h4 className="font-black text-base text-emerald-900">
                Chủ phòng đã xác nhận nhận tiền thành công!
              </h4>
              <p className="text-xs text-emerald-700 max-w-xs mx-auto">
                Cảm ơn bạn đã thanh toán sòng phẳng cho phiên gom đơn này. Chúc bạn ngon miệng! 🎉
              </p>
            </div>
          ) : (
            /* UNPAID / PENDING VIEW: VIETQR & REPORT BUTTON */
            <div className="text-center space-y-4 pt-1">
              <div>
                <p className="text-xs font-bold text-slate-700">
                  Quét mã VietQR để chuyển khoản cho {hostName}:
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tương thích tất cả App Ngân hàng (MB, VCB, Techcombank, MoMo...)
                </p>
              </div>
              
              <div className="inline-block p-3.5 bg-white rounded-3xl shadow-lg border-2 border-orange-100 hover:border-orange-300 transition">
                <img
                  src={myBill.vietQRUrl}
                  alt={`VietQR for ${currentUserName}`}
                  className="w-56 h-56 mx-auto rounded-xl object-contain"
                />
              </div>

              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Nội dung CK:</span>
                <button
                  onClick={handleCopyMemo}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition active:scale-95 border border-slate-200"
                >
                  <span>{transferMemo}</span>
                  {copiedMemo ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                </button>
              </div>

              {/* ACTION BUTTON: REPORT PAID */}
              {myBill.paymentStatus === 'PENDING' ? (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-1.5 animate-pulse">
                  <p className="text-xs font-bold text-amber-800 flex items-center justify-center gap-1.5">
                    <Clock className="w-4 h-4 animate-spin text-amber-600" />
                    <span>Đã báo chuyển tiền - Đang đợi {hostName} kiểm tra tài khoản...</span>
                  </p>
                  <p className="text-[11px] text-amber-600">
                    Ngay khi {hostName} bấm xác nhận, chuông Ting Ting sẽ tự động phát!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  <input
                    type="text"
                    placeholder="Ghi chú thêm (Tùy chọn, VD: Đã chuyển từ app MB...)"
                    value={proofNote}
                    onChange={e => setProofNote(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <button
                    onClick={handleReportPaid}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-emerald-500/25 hover:opacity-95 active:scale-[0.98] transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Tôi đã chuyển tiền xong cho {hostName}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center text-xs text-slate-500">
          Bạn không chọn món nào trong phiên gom đơn này.
        </div>
      )}

      {/* 4. ALL MEMBERS BREAKDOWN & HOST CONFIRMATION DASHBOARD */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-3">
        <div 
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setShowAllDetails(prev => !prev)}
        >
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <span>Trạng thái thanh toán cả nhóm</span>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {memberBills.length} người
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isHost ? 'Chủ phòng bấm xác nhận khi đã thấy tiền vào tài khoản' : 'Xem ai đã chuyển tiền, ai chưa chuyển'}
            </p>
          </div>
          <button className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition">
            {showAllDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showAllDetails && (
          <div className="space-y-3 pt-2 divide-y divide-slate-100 text-xs">
            {memberBills.map(mb => {
              const isMe = mb.userName.toLowerCase() === currentUserName.toLowerCase();

              return (
                <div key={mb.userName} className="pt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* User Avatar */}
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${getAvatarGradient(mb.userName)} text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm`}>
                      {getInitials(mb.userName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 truncate">{mb.userName}</span>
                        {isMe && (
                          <span className="text-[9px] bg-orange-100 text-orange-700 font-bold px-1.5 py-0.2 rounded-md shrink-0">
                            Bạn
                          </span>
                        )}
                      </div>
                      
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        Cần trả: <strong className="text-orange-600 font-bold">{formatVND(mb.finalAmount)}</strong>
                        {mb.proofNote && <span className="text-slate-400 block italic truncate mt-0.5">"{mb.proofNote}"</span>}
                      </div>
                    </div>
                  </div>

                  {/* Payment Status & Host Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    {mb.paymentStatus === 'PAID' && (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1.5 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã trả</span>
                      </span>
                    )}

                    {mb.paymentStatus === 'PENDING' && (
                      <div className="flex items-center gap-1.5">
                        {isHost ? (
                          <>
                            <button
                              onClick={() => handleConfirmPayment(mb.userName)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center gap-1 active:scale-95"
                              title="Xác nhận đã nhận tiền"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Đã nhận</span>
                            </button>
                            <button
                              onClick={() => handleRejectPayment(mb.userName)}
                              className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 transition"
                              title="Chưa thấy tiền"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 font-semibold text-xs border border-amber-200 animate-pulse">
                            ⏳ Chờ duyệt
                          </span>
                        )}
                      </div>
                    )}

                    {mb.paymentStatus === 'UNPAID' && (
                      isHost ? (
                        <button
                          onClick={() => handleConfirmPayment(mb.userName)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-xs font-semibold transition border border-slate-200"
                          title="Đánh dấu đã thu tiền mặt hoặc nhận chuyển khoản"
                        >
                          Xác nhận thu
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-400 font-medium text-xs">
                          Chưa trả
                        </span>
                      )
                    )}
                  </div>
                </div>
              );
            })}

            <div className="pt-3.5 flex justify-between font-black text-sm sm:text-base text-slate-800 border-t-2 border-slate-100">
              <span>Tổng số tiền cả nhóm:</span>
              <span className="text-orange-600 text-lg">{formatVND(billSummary.grandTotal)}</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
