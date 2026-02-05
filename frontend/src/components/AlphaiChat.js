import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Sparkles, Lock } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const OWL_URL = "https://customer-assets.emergentagent.com/job_aa332bb7-9735-40f0-a436-aa4f8697591d/artifacts/hvgiid52_Gemini_Generated_Image_abg785abg785abg7.png";

export default function AlphaiChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy ALPHA-I 🦉, tu asistente de investigación DeFi. ¿En qué puedo ayudarte hoy?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(5);
  const [sessionId] = useState(() => localStorage.getItem('alphai_session') || Math.random().toString(36).substring(7));
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('alphai_session', sessionId);
  }, [sessionId]);

  useEffect(() => {
    // Fetch usage on open
    if (isOpen) {
      fetchUsage();
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchUsage = async () => {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/alphai/usage/${sessionId}`);
      setRemainingMessages(data.remaining);
    } catch (err) {
      console.error('Error fetching usage:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const { data } = await axios.post(`${BACKEND_URL}/api/alphai/chat`, {
        message: userMessage,
        session_id: sessionId,
        is_premium: false
      });

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      setRemainingMessages(data.remaining_messages);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Lo siento, hubo un error. Por favor intenta de nuevo. 🦉' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, margin: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div 
        className="relative w-full max-w-2xl bg-[#0f172a] rounded-2xl border border-gray-700 shadow-2xl flex flex-col overflow-hidden"
        style={{ height: '550px', maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-[#0f172a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center overflow-hidden">
              <img src={OWL_URL} alt="ALPHA-I" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h2 className="text-white font-mono font-bold flex items-center gap-2">
                ALPHA-I
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">BETA</span>
              </h2>
              <p className="text-gray-500 text-xs">Tu asistente DeFi personal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-800 text-gray-200'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-emerald-400 text-sm font-mono font-medium">🦉 ALPHA-I</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
            {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-emerald-400" />
                  <span className="text-gray-400 text-sm">ALPHA-I está pensando...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/50">
          {remainingMessages <= 0 ? (
            <div className="text-center p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
              <Lock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <p className="text-amber-400 font-medium mb-1">Límite diario alcanzado</p>
              <p className="text-gray-400 text-sm mb-3">Has usado tus 5 mensajes gratis de hoy</p>
              <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-2 px-4 rounded-lg text-sm">
                Upgrade a Premium
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pregunta sobre crypto, DeFi, airdrops..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 text-white p-3 rounded-xl transition-colors"
                >
                  <Send size={20} />
                </button>
              </form>
              
              <div className="flex items-center justify-between mt-3 text-xs">
                <div className="flex items-center gap-2 text-gray-500">
                  <Sparkles size={12} />
                  <span>ALPHA-I Research - Powered by AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{remainingMessages} mensajes restantes</span>
                  <span className="text-amber-400 text-xs cursor-pointer hover:underline">
                    Upgrade a Premium
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
