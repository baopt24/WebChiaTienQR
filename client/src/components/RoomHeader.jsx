import React from 'react';
import { QrCode, Users, LogOut, CheckCircle, Clock } from 'lucide-react';

export default function RoomHeader({ room, onOpenQR, onLeaveRoom }) {
  if (!room) return null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-100 px-4 py-3 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 tracking-wider font-mono">
            {room.id}
          </span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
            room.isLocked 
              ? 'bg-rose-100 text-rose-700' 
              : 'bg-emerald-100 text-emerald-700'
          }`}>
            {room.isLocked ? (
              <>
                <CheckCircle className="w-3 h-3" />
                <span>Đã chốt đơn</span>
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 animate-spin" />
                <span>Đang mở nhận món</span>
              </>
            )}
          </span>
        </div>
        <h2 className="text-sm font-bold text-slate-800 line-clamp-1 mt-0.5">
          {room.restaurantName}
        </h2>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenQR}
          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          title="Mã QR phòng"
        >
          <QrCode className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <span>{room.members?.length || 1}</span>
        </div>

        <button
          onClick={onLeaveRoom}
          className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
          title="Rời phòng"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
