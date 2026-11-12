import React, { useState, useEffect } from 'react';
import { X, Sparkles, Trophy, RotateCw, Users } from 'lucide-react';
import { socket } from '../services/socket';
import { playTingTingSound } from '../utils/audio';

const WHEEL_COLORS = [
  '#f97316', // orange-500
  '#10b981', // emerald-500
  '#3b82f6', // blue-500
  '#ec4899', // pink-500
  '#8b5cf6', // violet-500
  '#eab308', // yellow-500
  '#06b6d4', // cyan-500
  '#f43f5e', // rose-500
];

const PRESET_TOPICS = [
  '🛵 Ai xuống cổng lấy đồ ăn?',
  '💸 Ai trả tiền giữ xe / phụ phí?',
  '🧋 Ai khao cả nhóm 1 ly nước?',
  '🧹 Ai dọn dẹp sau khi ăn xong?'
];

export default function LuckyWheelModal({
  room,
  currentUserName,
  externalSpinData,
  onClose,
  triggerToast
}) {
  // Gather unique member names from room members and cart items
  const initialCandidates = React.useMemo(() => {
    const set = new Set();
    (room?.members || []).forEach(m => {
      if (m.name) set.add(m.name.trim());
    });
    (room?.items || []).forEach(it => {
      if (it.userName) set.add(it.userName.trim());
    });
    const list = Array.from(set);
    return list.length > 0 ? list : [currentUserName || 'Chủ phòng', 'Bạn A', 'Bạn B'];
  }, [room, currentUserName]);

  const [candidates, setCandidates] = useState(initialCandidates);
  const [topic, setTopic] = useState(PRESET_TOPICS[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winnerResult, setWinnerResult] = useState(null);

  // Listen to spin data coming from server (real-time synchronized across all devices)
  useEffect(() => {
    if (!externalSpinData) return;

    const {
      topic: spunTopic,
      candidates: spunCandidates,
      winnerIndex,
      winner,
      extraSpins,
      spunBy
    } = externalSpinData;

    if (Array.isArray(spunCandidates) && spunCandidates.length > 0) {
      setCandidates(spunCandidates);
    }
    if (spunTopic) {
      setTopic(spunTopic);
    }

    setIsSpinning(true);
    setWinnerResult(null);

    const count = (spunCandidates || candidates).length;
    const sliceAngle = 360 / count;
    // Pointer is at the top (0 deg / 270 deg in SVG coordinates).
    // Align center of winning slice to the top pointer:
    const targetSliceCenter = winnerIndex * sliceAngle + sliceAngle / 2;
    const targetAngle = (extraSpins || 6) * 360 + (360 - targetSliceCenter);

    setRotation(prev => {
      const base = prev - (prev % 360);
      return base + targetAngle;
    });

    const timer = setTimeout(() => {
      setIsSpinning(false);
      setWinnerResult({ winner, spunBy, topic: spunTopic });
      playTingTingSound();
    }, 4000);

    return () => clearTimeout(timer);
  }, [externalSpinData]);

  const handleTriggerSpin = () => {
    if (isSpinning || candidates.length < 1) return;
    socket.emit('spin_wheel', {
      roomId: room.id,
      topic,
      candidates,
      spunBy: currentUserName || 'Chủ phòng'
    });
  };

  // Build SVG wheel slices
  const numSlices = candidates.length;
  const sliceAngle = 360 / numSlices;

  const renderSlices = () => {
    if (numSlices === 1) {
      return (
        <circle cx="150" cy="150" r="140" fill={WHEEL_COLORS[0]} />
      );
    }

    return candidates.map((name, i) => {
      const startAngle = i * sliceAngle - 90; // -90 so index 0 starts from top
      const endAngle = startAngle + sliceAngle;
      const startRad = (Math.PI / 180) * startAngle;
      const endRad = (Math.PI / 180) * endAngle;

      const x1 = 150 + 140 * Math.cos(startRad);
      const y1 = 150 + 140 * Math.sin(startRad);
      const x2 = 150 + 140 * Math.cos(endRad);
      const y2 = 150 + 140 * Math.sin(endRad);

      const largeArc = sliceAngle > 180 ? 1 : 0;
      const pathData = `M 150 150 L ${x1} ${y1} A 140 140 0 ${largeArc} 1 ${x2} ${y2} Z`;

      // Label position
      const midAngle = startAngle + sliceAngle / 2;
      const midRad = (Math.PI / 180) * midAngle;
      const textX = 150 + 88 * Math.cos(midRad);
      const textY = 150 + 88 * Math.sin(midRad);

      return (
        <g key={`${name}-${i}`}>
          <path
            d={pathData}
            fill={WHEEL_COLORS[i % WHEEL_COLORS.length]}
            stroke="#ffffff"
            strokeWidth="2.5"
          />
          <text
            x={textX}
            y={textY}
            fill="#ffffff"
            fontSize="11"
            fontWeight="800"
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${midAngle}, ${textX}, ${textY})`}
          >
            {name.length > 12 ? name.slice(0, 11) + '…' : name}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-down">
      <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full space-y-4 animate-scale-in shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-orange-500 to-amber-400 text-white rounded-2xl shadow-md shadow-orange-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-800">
                Vòng Quay May Mắn Realtime
              </h3>
              <p className="text-[11px] text-slate-400">
                Đồng bộ trực tiếp trên màn hình tất cả thành viên!
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

        {/* Topic Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Chủ đề bốc thăm:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TOPICS.map(t => (
              <button
                key={t}
                type="button"
                disabled={isSpinning}
                onClick={() => setTopic(t)}
                className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-xl border transition ${
                  topic === t
                    ? 'bg-orange-50 border-orange-300 text-orange-700 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Spinning Wheel Visual */}
        <div className="relative flex flex-col items-center justify-center py-2">
          {/* Top Pointer Arrow */}
          <div className="z-20 -mb-3">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-slate-900 drop-shadow-md" />
          </div>

          {/* Wheel Container */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full p-2 bg-gradient-to-tr from-orange-100 to-amber-50 shadow-inner border-4 border-orange-200 flex items-center justify-center">
            <svg
              viewBox="0 0 300 300"
              className="w-full h-full rounded-full drop-shadow-md"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning
                  ? 'transform 4s cubic-bezier(0.15, 0.85, 0.25, 1)'
                  : 'none'
              }}
            >
              {renderSlices()}
              <circle cx="150" cy="150" r="22" fill="#ffffff" stroke="#f97316" strokeWidth="4" />
            </svg>

            {/* Center Cap */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-sm">🎯</span>
            </div>
          </div>
        </div>

        {/* Winner Announcement Banner */}
        {winnerResult && !isSpinning && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-orange-300 text-center space-y-1 animate-scale-in shadow-sm">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>KẾT QUẢ: {winnerResult.topic}</span>
            </div>
            <p className="text-xl font-black text-slate-900">
              🎉 {winnerResult.winner} 🎉
            </p>
            <p className="text-[11px] text-slate-400">
              (Quay bởi {winnerResult.spunBy} • Đã đồng bộ tới cả phòng)
            </p>
          </div>
        )}

        {/* Participants list */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-semibold">
            <Users className="w-3.5 h-3.5 text-orange-500" />
            <span>Thành viên trên vòng quay ({candidates.length}):</span>
          </div>
          <span className="text-[11px] text-slate-500 truncate max-w-[180px]">
            {candidates.join(', ')}
          </span>
        </div>

        {/* Spin Action Button */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 bg-slate-100 text-slate-600 font-bold text-xs rounded-2xl hover:bg-slate-200 transition"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={isSpinning}
            onClick={handleTriggerSpin}
            className={`flex-1 py-3.5 rounded-2xl font-bold text-xs text-white shadow-lg transition flex items-center justify-center gap-2 ${
              isSpinning
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/30 hover:opacity-95 active:scale-95'
            }`}
          >
            <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>
              {isSpinning ? 'Đang quay trên mọi thiết bị...' : 'Quay ngay cho cả phòng xem!'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
