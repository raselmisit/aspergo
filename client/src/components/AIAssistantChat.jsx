import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, X, Send, Sparkles, User, MessageSquare, 
  HelpCircle, ChevronRight, ShoppingBag, Truck, ShieldCheck 
} from 'lucide-react';
import { api } from '../api';

export default function AIAssistantChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'আসসালামু আলাইকুম! আমি ASPER GO এর স্মার্ট এআই সহকারী। ডেলিভারি, ক্যাশ অন ডেলিভারি বা পছন্দের পণ্য সংক্রান্ত যেকোনো প্রশ্ন আমাকে করতে পারেন।'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    '🔥 সেরা ট্রেন্ডিং পণ্য সাজেস্ট করুন',
    '📦 আমার অর্ডার ট্র্যাক করতে চাই',
    'ডেলিভারি চার্জ কত?',
    'ক্যাশ অন ডেলিভারি সুবিধা আছে কি?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (queryText) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim()) return;

    const userMessage = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    if (!queryText) setInputText('');
    setLoading(true);

    try {
      const res = await api.runAIAgent({
        mode: 'customer_support',
        prompt: textToSend
      });

      const reply = res.result?.reply || res.result?.summary || 'ধন্যবাদ আপনার মেসেজের জন্য। আমাদের একজন প্রতিনিধি আপনাকে দ্রুত কল বা এসএমএস এ সহায়তা করবেন।';
      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    } catch (err) {
      setMessages(prev => [
        ...prev, 
        { 
          sender: 'ai', 
          text: 'দুঃখিত, ইন্টারনেট বা সার্ভার সমস্যার কারণে উত্তর পেতে একটু বিলম্ব হচ্ছে। সরাসরি হেল্পলাইনে কল করতে পারেন: +880 1700-000000।' 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-5 z-40 bg-gradient-to-r from-[#C8102E] via-red-600 to-amber-500 hover:scale-105 active:scale-95 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl flex items-center gap-2.5 transition duration-300 group"
          title="ASPER GO AI সহকারী"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></span>
          </div>
          <span className="hidden sm:inline font-bold text-xs tracking-wide">
            AI সহকারী (২৪/৭ সাপোর্ট)
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 max-h-[540px] h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#C8102E] to-red-800 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                  ASPER GO AI সহকারী
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-300 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>অনলাইন (তাত্ক্ষণিক উত্তর)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-red-100 text-[#C8102E] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#C8102E] text-white rounded-br-xs shadow-md'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-xl bg-red-100 text-[#C8102E] flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 rounded-full text-[10px] font-semibold border border-slate-200 transition"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="আপনার প্রশ্ন লিখুন (যেমন: ডেলিভারি সময় কত?)..."
              className="flex-1 py-2 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-red-600 focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-2.5 bg-[#C8102E] hover:bg-red-700 disabled:opacity-40 text-white rounded-xl transition shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
