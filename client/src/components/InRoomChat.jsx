import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, ChevronDown, Smile, Crown } from 'lucide-react';
import { socket } from '../services/socket';

const QUICK_CHIPS = [
  '⏳ Chờ t 2 phút đang chọn món',
  '🏷️ Ai có voucher giảm giá kh?',
  '🛵 Shipper gọi tới cổng rồi nè',
  '💸 Đã chuyển khoản rồi nha!',
  '🥤 Ai uống chung trà sữa kh?'
];

export default function InRoomChat({ roomId, currentUserName, isHost, initialMessages = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Sync messages from socket
  useEffect(() => {
    const handleNewMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    };

    socket.on('chat_message_received', handleNewMessage);
    return () => {
      socket.off('chat_message_received', handleNewMessage);
    };
  }, [isOpen]);

  const handleOpenChat = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || !roomId) return;

    socket.emit('send_chat_message', {
      roomId,
      userName: currentUserName,
      text
    });

    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Toggle Button (Always visible at bottom-right above sticky footer) */}
      {!isOpen && (
        <button
          onClick={handleOpenChat}
          className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40 bg-gradient-to-tr from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-white p-3.5 rounded-full shadow-xl shadow-orange-500/30 transition-all duration-200 active:scale-95 flex items-center gap-2 group"
          title="Nhắn tin trao đổi trong phòng"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 group-hover:scale-110 transition" />
            {unreadCount > 0 && (
              <span className="absolute -top-2.5 -right-2.5 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full border-2 border-white animate-bounce">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-xs font-bold hidden sm:inline-block pr-1">
            Chat nhóm {unreadCount > 0 ? `(${unreadCount})` : ''}
          </span>
        </button>
      )}

      {/* Floating Chat Box Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-[92vw] sm:w-88 max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col max-h-[500px] h-[70vh] animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-xl">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wide">
                  Chat Nhóm Phòng {roomId}
                </h4>
                <p className="text-[10px] text-white/80">
                  Trao đổi &amp; chia sẻ mã giảm giá
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Chips Bar */}
          <div className="bg-slate-50 border-b border-slate-100 p-2 overflow-x-auto flex items-center gap-1.5 scrollbar-none shrink-0">
            {QUICK_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 text-[10px] font-bold rounded-lg border border-slate-200 transition shrink-0 active:scale-95"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/40 text-xs">
            {messages.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-1">
                <Sparkles className="w-6 h-6 mx-auto text-amber-400 stroke-1" />
                <p className="font-semibold text-xs text-slate-600">
                  Chưa có tin nhắn nào
                </p>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                  Hãy gửi lời chào hoặc bấm nút gợi ý bên trên để nhắn nhanh nhé!
                </p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe =
                  (msg.userName || '').toLowerCase() === (currentUserName || '').toLowerCase();
                const timeStr = msg.timestamp
                  ? new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '';

                return (
                  <div
                    key={msg.id || i}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {/* Sender name badge */}
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5 px-1">
                      <span className="font-bold text-slate-600">
                        {isMe ? 'Bạn' : msg.userName}
                      </span>
                      {msg.isHost && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-md">
                          <Crown className="w-2.5 h-2.5" />
                          <span>Host</span>
                        </span>
                      )}
                      <span>• {timeStr}</span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[85%] p-2.5 rounded-2xl text-xs leading-relaxed break-words shadow-2xs ${
                        isMe
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input & Send Form */}
          <div className="p-2.5 bg-white border-t border-slate-100 shrink-0">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={300}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 bg-slate-50/50 transition placeholder:text-slate-400"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className={`p-2 rounded-xl transition shrink-0 ${
                  inputText.trim()
                    ? 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95 shadow-sm'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
