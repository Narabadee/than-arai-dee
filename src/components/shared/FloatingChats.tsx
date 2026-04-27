import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { Icon } from './Icon';
import { motion, AnimatePresence } from 'framer-motion';

export const FloatingChats: React.FC = () => {
  const { activeChats, closeChat, sendMessage } = useChat();

  return (
    <div className="fixed bottom-0 right-6 z-[100] flex items-end gap-4 pointer-events-none">
      <AnimatePresence>
        {activeChats.map((chat) => (
          <ChatWindow 
            key={chat.username} 
            chat={chat} 
            onClose={() => closeChat(chat.username)}
            onSend={(txt) => sendMessage(chat.username, txt)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ChatWindow: React.FC<{ 
  chat: any; 
  onClose: () => void; 
  onSend: (txt: string) => void 
}> = ({ chat, onClose, onSend }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <motion.div
      initial={{ y: 400, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 400, opacity: 0, scale: 0.9 }}
      className="w-80 h-[420px] bg-nm-card border border-nm-line rounded-t-2xl shadow-2xl flex flex-col pointer-events-auto"
    >
      {/* HEADER */}
      <div 
        className="px-4 py-3 border-b border-nm-line/60 flex items-center justify-between rounded-t-2xl"
        style={{ backgroundColor: `${chat.color}11` }}
      >
        <div className="flex items-center gap-2.5">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center font-black text-[12px] text-white"
            style={{ backgroundColor: chat.color }}
          >
            {chat.avatar}
          </div>
          <div>
            <div className="text-[13px] font-bold text-nm-ink">{chat.username}</div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-nm-lime animate-pulse" />
              <span className="text-[9px] font-mono text-nm-inkDim uppercase">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 text-nm-inkDim hover:text-nm-ink transition-colors">
            <Icon.Shuffle size={14} />
          </button>
          <button onClick={onClose} className="p-1.5 text-nm-inkDim hover:text-nm-red transition-colors">
            <Icon.X size={16} />
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-nm-bg/30"
      >
        {chat.messages.map((m: any, i: number) => (
          <div key={m.id} className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`
                max-w-[80%] px-3.5 py-2 rounded-2xl text-[13px] leading-relaxed
                ${m.sender === 'me' 
                  ? 'bg-nm-yellow text-nm-bg font-medium rounded-tr-none shadow-sm' 
                  : 'bg-nm-cardHi border border-nm-line text-nm-ink rounded-tl-none shadow-sm'}
              `}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-nm-line/60 bg-nm-card">
        <div className="flex items-center gap-2">
          <button type="button" className="text-nm-inkDim hover:text-nm-yellow transition-colors">
            <Icon.Plus size={18} />
          </button>
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Aa"
            className="flex-1 bg-nm-bg/50 border border-nm-line rounded-full px-4 py-2 text-[13px] text-nm-ink focus:outline-none focus:border-nm-yellow/40 transition-colors"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="text-nm-yellow hover:scale-110 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100"
          >
            <Icon.Check size={20} />
          </button>
        </div>
      </form>
    </motion.div>
  );
};
