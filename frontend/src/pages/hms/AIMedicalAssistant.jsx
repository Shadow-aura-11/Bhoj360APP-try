import React, { useState } from 'react';
import { Bot, Send, Sparkles, Brain, ShieldAlert } from 'lucide-react';

export default function AIMedicalAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your HMS AI Assistant. How can I help with clinical decision support today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    // Mock AI response
    setTimeout(() => {
      setMessages([...newMessages, {
        role: 'assistant',
        text: 'Based on the symptoms provided, there is an 85% probability of a viral upper respiratory infection. Suggested next steps: Lab test for Influeanza A/B.'
      }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Bot className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">AI Medical Assistant</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Clinical Decision Support System Active
            </p>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about symptoms, diagnosis, or medical coding..."
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            />
            <button
              onClick={handleSend}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-700">
            <Brain className="w-4 h-4" /> Disease Prediction
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700">
            <ShieldAlert className="w-4 h-4" /> Clinical Alerts
          </div>
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-2 text-purple-700">
            <Sparkles className="w-4 h-4" /> Medical Coding AI
          </div>
        </div>
      </div>
    </div>
  );
}
