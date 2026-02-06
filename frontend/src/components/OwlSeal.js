// Alpha Crypto Owl Seal - Brand identity component with Help Hub menu
// Clicks open a menu with ALPHA-I chat and Help/Support options

import { useState, useRef, useEffect } from 'react';
import { Bot, HelpCircle, X, Send, Loader2, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import axios from 'axios';

const OWL_URL = "https://customer-assets.emergentagent.com/job_aa332bb7-9735-40f0-a436-aa4f8697591d/artifacts/ophjijkw_Screenshot%202026-02-05%20at%2013.02.09.png";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL + '/api';

// Support Form Modal Component
function SupportFormModal({ isOpen, onClose }) {
  const { language } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const tx = {
    title: language === 'es' ? 'Contactar Soporte' : 'Contact Support',
    subtitle: language === 'es' ? '¿Necesitas ayuda? Escríbenos y te responderemos pronto.' : 'Need help? Write to us and we\'ll get back to you soon.',
    nameLabel: language === 'es' ? 'Nombre' : 'Name',
    namePlaceholder: language === 'es' ? 'Tu nombre' : 'Your name',
    emailLabel: 'Email',
    emailPlaceholder: language === 'es' ? 'tu@email.com' : 'your@email.com',
    messageLabel: language === 'es' ? 'Mensaje' : 'Message',
    messagePlaceholder: language === 'es' ? 'Describe tu consulta o problema...' : 'Describe your question or issue...',
    sendBtn: language === 'es' ? 'Enviar Mensaje' : 'Send Message',
    sending: language === 'es' ? 'Enviando...' : 'Sending...',
    successTitle: language === 'es' ? '¡Mensaje enviado!' : 'Message sent!',
    successText: language === 'es' ? 'Te responderemos pronto.' : 'We\'ll get back to you soon.',
    sendAnother: language === 'es' ? 'Enviar otro mensaje' : 'Send another message',
    close: language === 'es' ? 'Cerrar' : 'Close',
    errorRequired: language === 'es' ? 'Por favor completa todos los campos' : 'Please fill in all fields',
    errorSend: language === 'es' ? 'Error al enviar. Intenta de nuevo.' : 'Error sending. Please try again.',
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError(tx.errorRequired);
      return;
    }
    setSubmitting(true);
    setError('');
    
    try {
      await axios.post(API + '/support', {
        name: form.name,
        email: form.email,
        message: form.message,
        subject: 'Soporte - Alpha Crypto'
      });
      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError(tx.errorSend);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setSubmitted(false);
    setError('');
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md glass-card rounded-2xl p-8 border border-white/10 animate-fade-in-up"
        style={{ animationDuration: '0.3s' }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle className="text-emerald-400" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{tx.successTitle}</h3>
            <p className="text-gray-400 mb-6">{tx.successText}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setSubmitted(false)}
                className="btn-secondary px-5 py-2.5"
              >
                {tx.sendAnother}
              </button>
              <button
                onClick={handleClose}
                className="btn-primary px-5 py-2.5"
              >
                {tx.close}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/30 flex items-center justify-center">
                <HelpCircle className="text-violet-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{tx.title}</h2>
              <p className="text-gray-400 text-sm">{tx.subtitle}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{tx.nameLabel}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={tx.namePlaceholder}
                  className="w-full input-glass"
                  data-testid="support-name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{tx.emailLabel}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={tx.emailPlaceholder}
                  className="w-full input-glass"
                  data-testid="support-email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{tx.messageLabel}</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={tx.messagePlaceholder}
                  rows={4}
                  className="w-full input-glass resize-none"
                  data-testid="support-message"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-3.5 flex items-center justify-center gap-2"
                data-testid="support-submit"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {tx.sending}
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    {tx.sendBtn}
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// Owl Menu Component
function OwlMenu({ isOpen, onClose, onOpenAlphai, onOpenSupport }) {
  const { language } = useLanguage();
  const menuRef = useRef(null);

  const tx = {
    alphai: 'ALPHA-I',
    alphaiDesc: language === 'es' ? 'Asistente IA' : 'AI Assistant',
    help: language === 'es' ? 'Ayuda' : 'Help',
    helpDesc: language === 'es' ? 'Soporte' : 'Support',
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      className="absolute bottom-full right-0 mb-3 animate-fade-in-up"
      style={{ animationDuration: '0.2s' }}
    >
      <div className="glass-card rounded-2xl p-2 border border-emerald-500/30 shadow-2xl min-w-[180px]">
        {/* ALPHA-I Option */}
        <button
          onClick={() => { onOpenAlphai(); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 hover:bg-emerald-500/10 group"
          data-testid="owl-menu-alphai"
        >
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 group-hover:border-emerald-400/50 transition-colors">
            <Bot size={18} className="text-emerald-400" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">{tx.alphai}</div>
            <div className="text-xs text-gray-500">{tx.alphaiDesc}</div>
          </div>
        </button>

        {/* Divider */}
        <div className="h-px bg-white/10 mx-3 my-1" />

        {/* Help Option */}
        <button
          onClick={() => { onOpenSupport(); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 hover:bg-violet-500/10 group"
          data-testid="owl-menu-help"
        >
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/30 group-hover:border-violet-400/50 transition-colors">
            <HelpCircle size={18} className="text-violet-400" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">{tx.help}</div>
            <div className="text-xs text-gray-500">{tx.helpDesc}</div>
          </div>
        </button>
      </div>
      
      {/* Arrow pointing down to owl */}
      <div className="absolute -bottom-2 right-8 w-4 h-4 rotate-45 glass-card border-r border-b border-emerald-500/30" />
    </div>
  );
}

// Main OwlSeal Component
export default function OwlSeal({ 
  position = 'bottom-right',
  size = 'md',
  opacity = 0.5,
  className = '',
  onClick // Legacy prop - if provided, directly opens ALPHA-I
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [alphaiCallback, setAlphaiCallback] = useState(null);
  const { language } = useLanguage();

  const tx = {
    menu: language === 'es' ? 'Menú' : 'Menu',
  };

  // Store the onClick callback for ALPHA-I
  const handleOwlClick = () => {
    if (onClick) {
      // Store the callback so menu can use it
      setAlphaiCallback(() => onClick);
    }
    setMenuOpen(!menuOpen);
  };

  const handleOpenAlphai = () => {
    if (alphaiCallback) {
      alphaiCallback();
    } else if (onClick) {
      onClick();
    }
  };

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-18 h-18',
    lg: 'w-24 h-24', // Reduced from w-32 h-32
    xl: 'w-32 h-32'  // Reduced from w-40 h-40
  };

  // Fixed position for the watermark - with rounded border, depth and animations
  if (className.includes('fixed')) {
    return (
      <>
        <div 
          className="select-none z-50 pointer-events-auto"
          style={{ 
            opacity,
            position: 'fixed',
            bottom: '80px',
            right: '24px'
          }}
        >
          {/* Menu */}
          <OwlMenu 
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            onOpenAlphai={handleOpenAlphai}
            onOpenSupport={() => setShowSupport(true)}
          />

          {/* Owl Button */}
          <button
            onClick={handleOwlClick}
            className="relative cursor-pointer focus:outline-none group"
            title={tx.menu}
            data-testid="owl-menu-trigger"
          >
            <div 
              className={`relative p-2.5 rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 backdrop-blur-md border transition-all duration-300 ${menuOpen ? 'border-emerald-400/60 shadow-[0_0_40px_rgba(16,185,129,0.4)] scale-105' : 'border-emerald-500/30 group-hover:scale-110 group-hover:border-emerald-400/60 group-hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]'}`}
              style={{
                boxShadow: menuOpen 
                  ? '0 20px 40px rgba(0,0,0,0.5), 0 0 40px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                  : '0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
              }}
            >
              {/* Pulsing glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent animate-owl-pulse" />
              
              {/* Breathing glow ring */}
              <div 
                className="absolute -inset-1 rounded-2xl animate-owl-glow"
                style={{
                  background: 'radial-gradient(circle at center, rgba(16,185,129,0.15) 0%, transparent 70%)',
                }}
              />
              
              {/* Owl image - 75% of original size */}
              <img 
                src={OWL_URL}
                alt="Alpha Crypto"
                className="relative w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                style={{ filter: 'brightness(1.3) contrast(1.1)' }}
              />
              
              {/* Sparkle effects */}
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-owl-sparkle" />
              <div className="absolute bottom-3 left-1 w-1 h-1 bg-emerald-300 rounded-full animate-owl-sparkle-delay" />
            </div>
          </button>
        </div>

        {/* Support Form Modal */}
        <SupportFormModal 
          isOpen={showSupport}
          onClose={() => setShowSupport(false)}
        />
      </>
    );
  }

  const positionClasses = {
    'bottom-right': 'absolute bottom-6 right-6',
    'bottom-left': 'absolute bottom-6 left-6',
    'top-right': 'absolute top-6 right-6',
    'top-left': 'absolute top-6 left-6',
    'center': 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'inline': 'relative inline-block'
  };

  return (
    <div 
      className={`pointer-events-none select-none ${positionClasses[position]} ${className}`}
      style={{ opacity }}
    >
      <img 
        src={OWL_URL}
        alt="Alpha Crypto"
        className={`${sizeClasses[size]} object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-owl-breathe`}
        style={{ filter: 'brightness(1.2) contrast(1.1)' }}
      />
    </div>
  );
}

// Inline version for use in cards or sections
export function OwlBadge({ size = 'sm' }) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12'
  };

  return (
    <img 
      src={OWL_URL}
      alt="αC"
      className={`${sizeClasses[size]} object-contain opacity-60`}
    />
  );
}
