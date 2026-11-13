import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, X, ChevronDown, Sparkles } from 'lucide-react';
import { socket } from '../services/socket';
import { playTingTingSound } from '../utils/audio';

export default function CountdownBanner({ room, isHost, onTimerEnded }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [hasAlerted, setHasAlerted] = useState(false);

  const countdownEnd = room?.countdownEnd;

  useEffect(() => {
    if (!countdownEnd) {
      setTimeLeft(null);
      setHasAlerted(false);
      return;
    }

    const calculateTimeLeft = () => {
      const diff = countdownEnd - Date.now();
      if (diff <= 0) {
        setTimeLeft(0);
        if (!hasAlerted) {
          setHasAlerted(true);
          playTingTingSound();
          if (onTimerEnded) onTimerEnded();
        }
      } else {
        setTimeLeft(Math.floor(diff / 1000));
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [countdownEnd, hasAlerted, onTimerEnded]);

  const handleSetTimer = (minutes) => {
    socket.emit('set_countdown', {
      roomId: room.id,
      durationMinutes: minutes
    });
    setShowPicker(false);
  };

  const handleClearTimer = () => {
    socket.emit('clear_countdown', { roomId: room.id });
    setShowPicker(false);
  };

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    if (secs == null || secs <= 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isUrgent = timeLeft != null && timeLeft > 0 && timeLeft <= 60;
  const isFinished = timeLeft === 0;

  // Don't show if room is locked or no timer set and user is not host
  if (room?.isLocked) return null;
  if (!countdownEnd && !isHost) return null;

  return (
    <div className="relative mb-3 animate-fade-in-down">
      {countdownEnd ? (
        <div
          className={`rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-3 border shadow-sm transition-all duration-300 ${
            isFinished
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : isUrgent
              ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white border-rose-400 shadow-rose-500/20 animate-pulse'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400 shadow-orange-500/15'
          }`}
        >
          {/* Left: Timer display */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div
              className={`p-1.5 rounded-xl shrink-0 ${
                isUrgent || !isFinished ? 'bg-white/20' : 'bg-rose-100 text-rose-600'
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold block uppercase tracking-wider opacity-90 truncate">
                {isFinished
                  ? '⏳ Đã hết giờ chọn món!'
                  : isUrgent
                  ? '🚨 Sắp hết giờ đặt món!'
                  : 'Thời gian chốt đơn còn lại:'}
              </span>
              <span className="text-lg sm:text-xl font-black font-mono tracking-wider">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Right: Host controls / Member notice */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isHost ? (
              <div className="relative">
                <button
                  onClick={() => setShowPicker(!showPicker)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 active:scale-95 ${
                    isFinished
                      ? 'bg-rose-600 text-white hover:bg-rose-700'
                      : 'bg-white/25 hover:bg-white/35 text-white backdrop-blur-xs'
                  }`}
                >
                  <span>{isFinished ? 'Gia hạn' : 'Đổi giờ'}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showPicker && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-slate-800 space-y-1 animate-scale-in">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block pt-1">
                      Hẹn giờ chốt đơn:
                    </span>
                    {[5, 10, 15, 30].map(mins => (
                      <button
                        key={mins}
                        onClick={() => handleSetTimer(mins)}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold hover:bg-orange-50 hover:text-orange-600 transition flex items-center justify-between"
                      >
                        <span>{mins} phút</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {mins === 10 ? 'Chuẩn' : ''}
                        </span>
                      </button>
                    ))}
                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleClearTimer}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                      >
                        Hủy hẹn giờ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <span className="hidden sm:inline-block text-[11px] font-medium bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                {isFinished ? 'Vui lòng chờ Host chốt' : 'Hãy nhanh tay thêm món'}
              </span>
            )}
          </div>
        </div>
      ) : (
        /* Host can launch a timer anytime */
        isHost && (
          <div className="bg-white/90 border border-orange-200/80 rounded-2xl p-2.5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              <span className="font-semibold text-[11px]">Hẹn giờ tự động nhắc chốt đơn:</span>
            </div>
            <div className="flex items-center gap-1">
              {[5, 10, 15].map(mins => (
                <button
                  key={mins}
                  onClick={() => handleSetTimer(mins)}
                  className="px-2 py-1 bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-700 rounded-lg text-[10px] font-bold transition border border-orange-200/60 active:scale-95"
                >
                  +{mins}p
                </button>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
