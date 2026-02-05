import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle, Loader2, Twitter, Mail, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '@/context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Brand Assets - Updated with proper backgrounds
const LOGO_URL = "https://customer-assets.emergentagent.com/job_aa332bb7-9735-40f0-a436-aa4f8697591d/artifacts/3t4s66a5_Gemini_Generated_Image_2rrfmj2rrfmj2rrf.png";
const OWL_URL = "https://customer-assets.emergentagent.com/job_aa332bb7-9735-40f0-a436-aa4f8697591d/artifacts/hvgiid52_Gemini_Generated_Image_abg785abg785abg7.png";

export default function Footer() {
  const [feedbackForm, setFeedbackForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const currentYear = new Date().getFullYear();
  const { language } = useLanguage();

  // Translations
  const tx = {
    es: {
      description: 'Tu fuente de alpha en crypto. Análisis profundo, airdrops verificados, e insights de mercado.',
      freeContent: 'Contenido Gratuito',
      articles: 'Artículos',
      airdrops: 'Airdrops',
      marketIndices: 'Índices de Mercado',
      analysis: 'Análisis',
      premium: 'Premium',
      portfolio: 'Portfolio',
      signals: 'Señales',
      consulting: 'Consultoría',
      yourFeedback: 'Tu Feedback',
      whatWouldYouLike: '¿Qué te gustaría ver en Alpha Crypto?',
      yourName: 'Tu nombre',
      yourEmail: 'Tu email',
      yourMessage: 'Tu mensaje...',
      send: 'Enviar',
      thanksFeedback: '¡Gracias por tu feedback!',
      errorSending: 'Error al enviar. Por favor intenta de nuevo.',
      fillAllFields: 'Por favor llena todos los campos',
      copyright: 'Alpha Crypto. Tu alpha en el mercado.',
      poweredBy: 'Powered by Intelligence',
    },
    en: {
      description: 'Your source of alpha in crypto. Deep analysis, verified airdrops, and market insights.',
      freeContent: 'Free Content',
      articles: 'Articles',
      airdrops: 'Airdrops',
      marketIndices: 'Market Indices',
      analysis: 'Analysis',
      premium: 'Premium',
      portfolio: 'Portfolio',
      signals: 'Signals',
      consulting: 'Consulting',
      yourFeedback: 'Your Feedback',
      whatWouldYouLike: 'What would you like to see in Alpha Crypto?',
      yourName: 'Your name',
      yourEmail: 'Your email',
      yourMessage: 'Your message...',
      send: 'Send',
      thanksFeedback: 'Thanks for your feedback!',
      errorSending: 'Error sending. Please try again.',
      fillAllFields: 'Please fill in all fields',
      copyright: 'Alpha Crypto. Your alpha in the market.',
      poweredBy: 'Powered by Intelligence',
    }
  }[language];

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackForm.name || !feedbackForm.email || !feedbackForm.message) {
      setError(tx.fillAllFields);
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      await axios.post(`${API}/feedback`, feedbackForm);
      setSubmitted(true);
      setFeedbackForm({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(tx.errorSending);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="relative bg-gradient-to-b from-[#0f172a] to-[#0a0f1a] border-t border-gray-800/50 mt-20" data-testid="site-footer">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4 group">
              <span className="text-2xl font-bold transition-all duration-300 group-hover:scale-105">
                <span className="text-emerald-400" style={{ fontFamily: 'serif' }}>α</span>
                <span className="text-white">C</span>
              </span>
              <span className="font-bold text-xl text-white group-hover:text-emerald-400 transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Alpha Crypto
              </span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              {tx.description}
            </p>
            <div className="flex items-center gap-3">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-gray-800/50 hover:bg-emerald-500/20 border border-gray-700 hover:border-emerald-500/50 rounded-lg text-gray-400 hover:text-emerald-400 transition-all"
                aria-label="Twitter"
              >
                <Twitter size={16} />
              </a>
              <a 
                href="mailto:contact@alphacrypto.com"
                className="p-2 bg-gray-800/50 hover:bg-emerald-500/20 border border-gray-700 hover:border-emerald-500/50 rounded-lg text-gray-400 hover:text-emerald-400 transition-all"
                aria-label="Email"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{tx.freeContent}</h4>
            <div className="space-y-3">
              <Link to="/articles" className="flex items-center gap-1 text-gray-400 hover:text-emerald-400 text-sm transition-colors group">
                {tx.articles}
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link to="/airdrops" className="flex items-center gap-1 text-gray-400 hover:text-emerald-400 text-sm transition-colors group">
                {tx.airdrops}
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link to="/indices" className="flex items-center gap-1 text-gray-400 hover:text-emerald-400 text-sm transition-colors group">
                {tx.marketIndices}
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link to="/analysis" className="flex items-center gap-1 text-gray-400 hover:text-emerald-400 text-sm transition-colors group">
                {tx.analysis}
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>

          {/* Premium */}
          <div>
            <h4 className="font-semibold text-amber-500 mb-4 text-sm uppercase tracking-wider">{tx.premium}</h4>
            <div className="space-y-3">
              <Link to="/portfolio" className="flex items-center gap-1 text-gray-400 hover:text-amber-400 text-sm transition-colors group">
                {tx.portfolio}
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link to="/signals" className="flex items-center gap-1 text-gray-400 hover:text-amber-400 text-sm transition-colors group">
                {tx.signals}
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link to="/consulting" className="flex items-center gap-1 text-gray-400 hover:text-amber-400 text-sm transition-colors group">
                {tx.consulting}
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>

          {/* Feedback Form */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{tx.yourFeedback}</h4>
            <p className="text-gray-500 text-xs mb-3">{tx.whatWouldYouLike}</p>
            
            {submitted ? (
              <div className="flex items-center gap-2 text-emerald-500 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                <CheckCircle size={18} />
                <span className="text-sm">{tx.thanksFeedback}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-3" data-testid="feedback-form">
                <input
                  type="text"
                  placeholder={tx.yourName}
                  value={feedbackForm.name}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  data-testid="feedback-name"
                />
                <input
                  type="email"
                  placeholder={tx.yourEmail}
                  value={feedbackForm.email}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  data-testid="feedback-email"
                />
                <textarea
                  placeholder={tx.yourMessage}
                  rows={2}
                  value={feedbackForm.message}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                  data-testid="feedback-message"
                />
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all"
                  data-testid="feedback-submit"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={14} />
                      {tx.send}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} {tx.copyright}
          </p>
          <div className="flex items-center gap-2">
            <img 
              src={OWL_URL} 
              alt="Alpha Owl" 
              className="w-5 h-5 object-contain opacity-40"
            />
            <span className="text-gray-600 text-xs">{tx.poweredBy}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
