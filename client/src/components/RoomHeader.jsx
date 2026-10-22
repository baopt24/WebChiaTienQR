import React from 'react';
import { QrCode, Users, LogOut, CheckCircle, Clock, Utensils } from 'lucide-react';

export default function RoomHeader({ room, userName, onOpenQR, onLeaveRoom }) {
  if (!room) return null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Left: Room info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
            <Utensils className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-orange-100 text-orange-700 tracking-wider font-mono shrink-0">
                {room.id}
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shrink-0 ${
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
                    {/* Animated ping dot */}
                    <span className="relative inline-flex w-2 h-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500" />
                    </span>
                    <span>Đang mở nhận món</span>
                  </>
                )}
              </span>
            </div>
            <h2 className="text-sm font-bold text-slate-800 line-clamp-1 mt-0.5">
              {room.title || `Phòng gom đơn của ${room.hostName}`}
            </h2>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Member count */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>{room.members?.length || 1} người</span>
          </div>

          {/* Current user badge */}
          {userName && (
            <div className="hidden md:flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl text-xs font-bold text-orange-700">
              <span className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white text-[10px] font-black">
                {userName.charAt(0).toUpperCase()}
              </span>
              <span>{userName}</span>
            </div>
          )}

          <button
            onClick={onOpenQR}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-orange-100 hover:text-orange-600 transition-all"
            title="Mã QR phòng"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Mobile member count */}
          <div className="flex sm:hidden items-center gap-1 bg-slate-100 px-2 py-1.5 rounded-xl text-xs font-semibold text-slate-600">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>{room.members?.length || 1}</span>
          </div>

          <button
            onClick={onLeaveRoom}
            className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
            title="Rời phòng"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
