import React, { useState, useEffect } from 'react';
import { socket } from '../services/socket';

const QUICK_EMOJIS = ['❤️', '🔥', '🤤', '🧋', '👍', '😂'];

export default function FloatingReactions({ roomId, currentUserName }) {
  const [floatingList, setFloatingList] = useState([]);

  useEffect(() => {
    const handleReaction = (data) => {
      const randomLeft = 15 + Math.floor(Math.random() * 70); // 15% to 85% screen width
      const item = {
        ...data,
        left: randomLeft
      };
      setFloatingList(prev => [...prev.slice(-15), item]);

      setTimeout(() => {
        setFloatingList(prev => prev.filter(r => r.id !== item.id));
      }, 2500);
    };

    socket.on('reaction_received', handleReaction);
    return () => {
      socket.off('reaction_received', handleReaction);
    };
  }, []);

  const handleSendEmoji = (emoji) => {
    if (!roomId) return;
    socket.emit('send_reaction', {
      roomId,
      emoji,
      userName: currentUserName || 'Thành viên'
    });
  };

  return (
    <>
      {/* Floating Emoji Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingList.map(item => (
          <div
            key={item.id}
            style={{ left: `${item.left}%` }}
            className="absolute bottom-20 animate-float-up flex flex-col items-center"
          >
            <span className="text-3xl sm:text-4xl drop-shadow-md">{item.emoji}</span>
            <span className="text-[10px] font-bold bg-slate-900/80 text-white px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap -mt-1">
              {item.userName}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Reaction Bar */}
      <div className="bg-white rounded-2xl px-3.5 py-2 shadow-sm border border-slate-100 flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">
          Thả cảm xúc nhanh:
        </span>
        <div className="flex items-center gap-1 sm:gap-1.5">
          {QUICK_EMOJIS.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleSendEmoji(emoji)}
              className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-orange-50 hover:scale-125 active:scale-90 transition-all flex items-center justify-center text-base shadow-2xs border border-slate-100"
              title={`Thả ${emoji} cho cả phòng`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
