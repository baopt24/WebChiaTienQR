import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, X, Check, Copy, Sparkles } from 'lucide-react';

export default function QRShareModal({ roomId, onClose, triggerToast }) {
  const [copied, setCopied] = useState(false);
  const joinUrl = `${window.location.origin}?room=${roomId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    triggerToast('Đã sao chép liên kết vào clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-down">
      <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center space-y-4 animate-scale-in shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-base text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Mã QR Vào Phòng</span>
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200/80 rounded-3xl inline-block shadow-inner">
          <div className="p-2 bg-white rounded-2xl shadow-sm inline-block">
            <QRCodeSVG
              value={joinUrl}
              size={180}
              level="M"
              includeMargin={true}
            />
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-400 font-medium">Mã phòng gom:</span>
          <p className="text-2xl font-black text-orange-600 tracking-widest font-mono mt-0.5">
            {roomId}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Quét mã QR bằng Camera điện thoại hoặc Zalo để tham gia ngay!
          </p>
        </div>

        <button
          onClick={handleCopyLink}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-95 transition flex items-center justify-center gap-1.5 active:scale-95"
        >
          {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
          <span>{copied ? 'Đã sao chép link!' : 'Sao chép Link mời bạn bè'}</span>
        </button>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition active:scale-95"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
