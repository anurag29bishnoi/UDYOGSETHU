import React, { useState } from 'react';
import { HelpCircle, MessageSquare, X, Send, BookOpen, ShieldCheck, ChevronRight } from 'lucide-react';
import { api } from '../../api/client';

export const AssistantWidget: React.FC<{ projectId?: string }> = ({ projectId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<
    Array<{ text: string; isUser: boolean; source?: string; disclaimer?: string }>
  >([
    {
      text: 'Namaskar! I am your UdyogSetu Statutory Regulatory Guide. I can assist you with required industrial approvals, missing documents, compliance deadlines, and government scheme incentives based on verified state regulations.',
      isUser: false,
      source: 'Maharashtra Industrial Directorate Statutes'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim() || loading) return;

    const userMsg = { text: q, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setQuery('');
    setLoading(true);

    try {
      const res = await api.post('/assistant/ask', { query: q, projectId });
      setMessages(prev => [
        ...prev,
        {
          text: res.answer,
          isUser: false,
          source: res.source,
          disclaimer: res.disclaimer
        }
      ]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          text: 'Unable to retrieve statutory information right now. Please check official department gazette or ask assigned desk officer.',
          isUser: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'What approvals do I need for my project?',
    'What document is missing from my vault?',
    'When is my compliance due?',
    'What government schemes apply to me?'
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-full shadow-lg border border-slate-700 flex items-center space-x-2 focus:outline-hidden group"
          title="Open Statutory Regulatory Assistant"
        >
          <BookOpen className="w-5 h-5 text-blue-400 group-hover:scale-105 transition" />
          <span className="text-xs font-semibold pr-1 hidden sm:inline">Regulatory Guide</span>
        </button>
      ) : (
        <div className="w-96 max-w-[calc(100vw-2rem)] bg-white rounded border border-slate-300 shadow-2xl flex flex-col h-[520px]">
          {/* Header */}
          <div className="bg-slate-900 text-white p-3 rounded-t flex justify-between items-center border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-blue-900 rounded flex items-center justify-center text-blue-300">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">Statutory Regulatory Guide</h4>
                <p className="text-[10px] text-slate-400">Assisted guidance &bull; Maharashtra Statutes</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded focus:outline-hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-2.5 rounded max-w-[90%] ${
                    m.isUser
                      ? 'bg-blue-700 text-white'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-2xs whitespace-pre-line'
                  }`}
                >
                  {m.text}
                </div>
                {!m.isUser && m.source && (
                  <div className="text-[9px] text-slate-500 mt-1 flex items-center space-x-1">
                    <ShieldCheck className="w-2.5 h-2.5 text-blue-600" />
                    <span>Source: {m.source}</span>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center space-x-2 text-[11px] text-slate-500 italic p-2">
                <span>Checking statutory regulations...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="p-2 border-t border-slate-200 bg-white">
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1 px-1">
              Common Inquiries:
            </div>
            <div className="flex flex-wrap gap-1">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded text-left transition truncate max-w-full"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2 border-t border-slate-200 bg-white flex items-center space-x-2"
          >
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ask regarding approvals, documents, SLAs..."
              className="flex-1 border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white p-2 rounded focus:outline-hidden"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
