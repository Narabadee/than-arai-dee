import React, { createContext, useContext, useState, useCallback } from 'react';

interface Message {
  id: string;
  sender: 'me' | 'them';
  text: string;
  timestamp: Date;
}

interface Chat {
  username: string;
  avatar: string;
  color: string;
  messages: Message[];
}

interface ChatContextValue {
  activeChats: Chat[];
  openChat: (username: string, avatar: string, color: string) => void;
  closeChat: (username: string) => void;
  sendMessage: (username: string, text: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeChats, setActiveChats] = useState<Chat[]>([]);

  const openChat = useCallback((username: string, avatar: string, color: string) => {
    setActiveChats(prev => {
      if (prev.find(c => c.username === username)) return prev;
      
      const newChat: Chat = {
        username,
        avatar,
        color,
        messages: [
          { id: '1', sender: 'them', text: `Saw your recent post! That looks amazing.`, timestamp: new Date() }
        ]
      };
      // Keep only last 3 chats to avoid overcrowding (like FB)
      const next = [newChat, ...prev];
      return next.slice(0, 3);
    });
  }, []);

  const closeChat = useCallback((username: string) => {
    setActiveChats(prev => prev.filter(c => c.username !== username));
  }, []);

  const sendMessage = useCallback((username: string, text: string) => {
    setActiveChats(prev => prev.map(c => {
      if (c.username !== username) return c;
      return {
        ...c,
        messages: [
          ...c.messages,
          { id: Date.now().toString(), sender: 'me', text, timestamp: new Date() }
        ]
      };
    }));

    // Auto-reply mock
    setTimeout(() => {
      setActiveChats(prev => prev.map(c => {
        if (c.username !== username) return c;
        return {
          ...c,
          messages: [
            ...c.messages,
            { id: (Date.now() + 1).toString(), sender: 'them', text: "Thanks! I'll share the recipe soon.", timestamp: new Date() }
          ]
        };
      }));
    }, 1500);
  }, []);

  return (
    <ChatContext.Provider value={{ activeChats, openChat, closeChat, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};
