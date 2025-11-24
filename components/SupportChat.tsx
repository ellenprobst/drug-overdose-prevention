import React, { useState, useRef, useEffect } from 'react';
import { Send, HeartHandshake, Loader2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { ChatMessage } from '../types';

export const SupportChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: "Hi there. I'm Haven. I'm here to listen without judgment. How are you feeling right now?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const responseText = await geminiService.generateSupportResponse(history, userMsg.text);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      // Error handled silently in UI, keeps conversation flow open
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="bg-haven-50 p-6 flex items-center gap-3 border-b border-haven-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-haven-200 rounded-full flex items-center justify-center text-haven-700">
                <HeartHandshake size={20} />
            </div>
            <div>
                <h2 className="font-bold text-haven-900 text-lg">Support Companion</h2>
                <p className="text-xs text-haven-500">Private & Automated</p>
            </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white pb-28">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-haven-600 text-white rounded-tr-sm'
                  : 'bg-haven-50 text-haven-900 rounded-tl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-haven-50 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-haven-400" />
                <span className="text-sm text-haven-400">Thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pt-4 pb-8 border-t border-haven-100 bg-white/95 backdrop-blur-sm z-20">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type here..."
            className="flex-1 bg-haven-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-haven-300 focus:outline-none placeholder-haven-300 text-haven-800"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-haven-600 text-white p-3 rounded-xl hover:bg-haven-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};