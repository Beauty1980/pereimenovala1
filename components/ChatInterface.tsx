
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, HelpCircle, Check, ShieldAlert } from 'lucide-react';
import { Message, UserSettings, Transaction, ParsingResult, ObligationType } from '../types';
import { geminiService } from '../services/geminiService';
import { getLocalDate, STRICT_THRESHOLDS, getDaysRemaining } from '../constants';

interface ChatInterfaceProps {
  settings: UserSettings;
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ settings, transactions, onAddTransaction }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'agent', content: 'Привет! Расскажи, на что сегодня ушли деньги или сколько заработал?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    const categories = settings.limits.map(l => l.category);
    const results = await geminiService.parseInput(userMessage.content, categories);

    if (results.length === 0) {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + 'err',
        role: 'agent',
        content: 'Хм, я не совсем понял. Можешь перефразировать? Например: "продукты 1500" или "такси 800 вчера".'
      }]);
      setIsTyping(false);
      return;
    }

    // Process each result
    let currentAgentMessages: Message[] = [];
    for (const res of results) {
      if (res.needs_clarification) {
        currentAgentMessages.push({
          id: Math.random().toString(),
          role: 'agent',
          content: `Мне нужно уточнить детали: ${res.clarification_reason === 'category' ? 'к какой категории это отнесем?' : 'какая это была дата?'}`
        });
      } else if (res.type === 'expense') {
        currentAgentMessages.push({
          id: Math.random().toString(),
          role: 'agent',
          content: `Записываю трату: ${res.description} на сумму ${res.amount} ${settings.currency}. К какому типу её отнесем?`,
          awaitingObligation: res
        });
      } else {
        // Income - record immediately
        completeTransaction(res);
        currentAgentMessages.push({
          id: Math.random().toString(),
          role: 'agent',
          content: `Записал доход: ${res.amount} ${settings.currency} (${res.description}). Отлично!`
        });
      }
    }

    setMessages(prev => [...prev, ...currentAgentMessages]);
    setIsTyping(false);
  };

  const completeTransaction = async (res: ParsingResult, obligation?: ObligationType) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: res.date,
      type: res.type,
      category: res.category,
      amount: res.amount,
      description: res.description,
      obligation,
      timestamp: Date.now()
    };

    onAddTransaction(newTx);
    
    // Calculate Stats for Feedback
    const today = getLocalDate();
    const todayTx = [...transactions, newTx].filter(t => t.date === today && t.type === 'expense');
    const monthTx = [...transactions, newTx].filter(t => t.type === 'expense');
    
    const spentToday = todayTx.reduce((sum, t) => sum + t.amount, 0);
    const spentMonth = monthTx.reduce((sum, t) => sum + t.amount, 0);
    const daysLeft = getDaysRemaining();
    
    const remainingBudget = settings.freeBudget - spentMonth;
    const safeDailyLimit = Math.max(0, remainingBudget / daysLeft);
    
    const categoryLimit = settings.limits.find(l => l.category === res.category)?.limit || 0;
    const categorySpent = monthTx.filter(t => t.category === res.category).reduce((sum, t) => sum + t.amount, 0);
    
    const isRedZone = (categoryLimit > 0 && categorySpent > categoryLimit) || (spentMonth > settings.freeBudget);
    const isStrict = isRedZone || res.amount > STRICT_THRESHOLDS[settings.currency];

    const feedback = await geminiService.generateFeedback({
      spentToday,
      dailyLimit: safeDailyLimit,
      remainingBudget,
      daysLeft,
      categoryOverLimit: categorySpent > categoryLimit,
      isRedZone
    }, settings);

    setMessages(prev => [...prev, {
      id: Math.random().toString(),
      role: 'agent',
      content: feedback,
      isRedZone
    }]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl relative transition-all duration-300 ${
              msg.role === 'user' 
                ? 'bg-sky-600 text-white rounded-tr-none shadow-lg shadow-sky-900/20' 
                : msg.isRedZone 
                  ? 'bg-red-950/50 border border-red-500/50 text-red-100 rounded-tl-none red-glow'
                  : 'glass-panel text-slate-100 rounded-tl-none shadow-lg'
            }`}>
              {msg.isRedZone && <ShieldAlert size={16} className="inline-block mr-2 text-red-500 animate-pulse" />}
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
              
              {msg.awaitingObligation && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {(['Essential', 'Optional', 'Impulse'] as ObligationType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        completeTransaction(msg.awaitingObligation!, type);
                        setMessages(prev => prev.filter(m => m.id !== msg.id)); // Clear buttons
                      }}
                      className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/40 border border-sky-500/30 rounded-full text-xs transition-colors"
                    >
                      {type === 'Essential' ? 'Обязательное' : type === 'Optional' ? 'Опциональное' : 'Импульс'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="glass-panel p-3 rounded-2xl rounded-tl-none flex space-x-1">
              <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area - Fixed with Z-Index and proper spacing for mobile */}
      <div className="sticky bottom-0 left-0 right-0 p-4 pb-20 md:pb-6 bg-gradient-to-t from-[#000B1E] via-[#000B1E]/90 to-transparent">
        <div className="relative group">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Что записать?"
            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-4 pr-14 focus:outline-none focus:border-sky-500/50 transition-all text-slate-200 placeholder-slate-500 backdrop-blur-md"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="absolute right-2 top-2 bottom-2 w-10 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
