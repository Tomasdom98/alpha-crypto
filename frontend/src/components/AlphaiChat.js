import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Sparkles, Lock } from 'lucide-react';
import axios from 'axios';
import ReactDOM from 'react-dom';
import { useLanguage } from '@/context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const OWL_URL = "https://customer-assets.emergentagent.com/job_aa332bb7-9735-40f0-a436-aa4f8697591d/artifacts/hvgiid52_Gemini_Generated_Image_abg785abg785abg7.png";

export default function AlphaiChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(5);
  const [sessionId] = useState(() => localStorage.getItem('alphai_session') || Math.random().toString(36).substring(7));
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { language } = useLanguage();

  // Translations
  const tx = {
    es: {
      greeting: '¡Hola! Soy ALPHA-I 🦉, tu asistente de investigación DeFi. ¿En qué puedo ayudarte hoy?',
      subtitle: 'Tu asistente DeFi personal',
      placeholder: 'Pregunta sobre crypto, DeFi, airdrops...',
      thinking: 'ALPHA-I está pensando...',
      error: 'Lo siento, hubo un error. Por favor intenta de nuevo. 🦉',
      dailyLimit: 'Límite diario alcanzado',
      usedAllMessages: 'Has usado tus 5 mensajes gratis de hoy',
      upgradePremium: 'Upgrade a Premium',
      poweredBy: 'ALPHA-I Research - Powered by AI',
      messagesRemaining: 'mensajes restantes',
    },
    en: {
      greeting: 'Hello! I\'m ALPHA-I 🦉, your DeFi research assistant. How can I help you today?',
      subtitle: 'Your personal DeFi assistant',
      placeholder: 'Ask about crypto, DeFi, airdrops...',
      thinking: 'ALPHA-I is thinking...',
      error: 'Sorry, there was an error. Please try again. 🦉',
      dailyLimit: 'Daily limit reached',
      usedAllMessages: 'You have used your 5 free messages today',
      upgradePremium: 'Upgrade to Premium',
      poweredBy: 'ALPHA-I Research - Powered by AI',
      messagesRemaining: 'messages remaining',
    }
  }[language];

  // Initialize greeting message based on language
  useEffect(() => {
    setMessages([{ role: 'assistant', content: tx.greeting }]);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('alphai_session', sessionId);
  }, [sessionId]);

  useEffect(() => {
    if (isOpen) {
      fetchUsage();
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
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
        content: tx.error 
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)'
        }}
      />
      
      {/* Modal */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '650px',
          height: '550px',
          backgroundColor: '#0f172a',
          borderRadius: '16px',
          border: '1px solid #374151',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          borderBottom: '1px solid #1f2937',
          background: 'linear-gradient(to right, #111827, #0f172a)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img src={OWL_URL} alt="ALPHA-I" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            </div>
            <div>
              <h2 style={{ color: 'white', fontWeight: 'bold', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                ALPHA-I
                <span style={{ fontSize: '10px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '2px 8px', borderRadius: '4px' }}>BETA</span>
              </h2>
              <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>{tx.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              color: '#6b7280',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '12px'
              }}
            >
              <div
                style={{
                  maxWidth: '80%',
                  borderRadius: '16px',
                  padding: '12px 16px',
                  backgroundColor: msg.role === 'user' ? '#10b981' : '#1f2937',
                  color: msg.role === 'user' ? 'white' : '#e5e7eb'
                }}
              >
                {msg.role === 'assistant' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ color: '#10b981', fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold' }}>🦉 ALPHA-I</span>
                  </div>
                )}
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
              <div style={{ backgroundColor: '#1f2937', borderRadius: '16px', padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 size={16} className="animate-spin" style={{ color: '#10b981' }} />
                  <span style={{ color: '#9ca3af', fontSize: '14px' }}>{tx.thinking}</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ flexShrink: 0, padding: '16px', borderTop: '1px solid #1f2937', backgroundColor: 'rgba(17, 24, 39, 0.5)' }}>
          {remainingMessages <= 0 ? (
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <Lock style={{ width: '24px', height: '24px', color: '#f59e0b', margin: '0 auto 8px' }} />
              <p style={{ color: '#f59e0b', fontWeight: 'bold', marginBottom: '4px' }}>Límite diario alcanzado</p>
              <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '12px' }}>Has usado tus 5 mensajes gratis de hoy</p>
              <button style={{ background: 'linear-gradient(to right, #f59e0b, #ea580c)', color: 'white', fontWeight: 'bold', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                Upgrade a Premium
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pregunta sobre crypto, DeFi, airdrops..."
                  disabled={loading}
                  style={{
                    flex: 1,
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  style={{
                    backgroundColor: loading || !input.trim() ? '#374151' : '#10b981',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: loading || !input.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Send size={20} />
                </button>
              </form>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
                  <Sparkles size={12} />
                  <span>ALPHA-I Research - Powered by AI</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#6b7280' }}>{remainingMessages} mensajes restantes</span>
                  <span style={{ color: '#f59e0b', cursor: 'pointer' }}>
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

  return ReactDOM.createPortal(modalContent, document.body);
}
