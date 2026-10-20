import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, X, Check } from 'lucide-react';

export default function QRShareModal({ roomId, onClose, triggerToast }) {
  const joinUrl = `${window.location.origin}?room=${roomId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    triggerToast('Đã sao chép liên kết vào clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center space-y-4 animate-scale-up shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-800">
            Mã QR Tham Gia Phòng
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-white border-2 border-orange-200 rounded-2xl inline-block shadow-sm">
          <QRCodeSVG
            value={joinUrl}
            size={180}
            level="M"
            includeMargin={true}
          />
        </div>

        <div>
          <span className="text-xs text-slate-400">Mã phòng:</span>
          <p className="text-2xl font-black text-orange-600 tracking-widest font-mono">
            {roomId}
          </p>
        </div>

        <button
          onClick={handleCopyLink}
          className="w-full py-2.5 bg-orange-50 text-orange-600 font-bold text-xs rounded-xl hover:bg-orange-100 transition flex items-center justify-center gap-1.5"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Sao chép Link mời bạn bè</span>
        </button>

        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-200 transition"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
