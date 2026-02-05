import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle, Loader2, Twitter, Mail, ExternalLink } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Brand Assets - Dark theme versions
const LOGO_URL = "https://customer-assets.emergentagent.com/job_aa332bb7-9735-40f0-a436-aa4f8697591d/artifacts/wqm01lrp_Gemini_Generated_Image_xn8vxaxn8vxaxn8v.png";
const OWL_URL = "https://customer-assets.emergentagent.com/job_aa332bb7-9735-40f0-a436-aa4f8697591d/artifacts/wqm01lrp_Gemini_Generated_Image_xn8vxaxn8vxaxn8v.png";

export default function Footer() {
  const [feedbackForm, setFeedbackForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const currentYear = new Date().getFullYear();

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackForm.name || !feedbackForm.email || !feedbackForm.message) {
      setError('Please fill in all fields');
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
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 to-gray-950 border-t border-gray-800/50 mt-20" data-testid="site-footer">
      {/* Owl watermark */}
      <div className="absolute right-8 bottom-24 opacity-[0.03] pointer-events-none hidden lg:block">
        <img src={OWL_URL} alt="" className="w-48 h-auto" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center space-x-3 mb-4 group">
              <img 
                src={LOGO_URL} 
                alt="Alpha Crypto" 
                className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-transform group-hover:scale-110"
              />
              <span className="font-bold text-xl text-white group-hover:text-emerald-400 transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Alpha Crypto
              </span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              Tu fuente de alpha en crypto. Análisis profundo, airdrops verificados, e insights de mercado.
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
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contenido Gratuito</h4>
            <div className="space-y-3">
              <Link to="/articles" className="flex items-center gap-1 text-gray-400 hover:text-emerald-400 text-sm transition-colors group">
                Artículos
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link to="/airdrops" className="flex items-center gap-1 text-gray-400 hover:text-emerald-400 text-sm transition-colors group">
                Airdrops
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link to="/indices" className="flex items-center gap-1 text-gray-400 hover:text-emerald-400 text-sm transition-colors group">
                Índices de Mercado
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link to="/analysis" className="flex items-center gap-1 text-gray-400 hover:text-emerald-400 text-sm transition-colors group">
                Análisis
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>

          {/* Premium */}
          <div>
            <h4 className="font-semibold text-amber-500 mb-4 text-sm uppercase tracking-wider">Premium</h4>
            <div className="space-y-3">
              <Link to="/portfolio" className="flex items-center gap-1 text-gray-400 hover:text-amber-400 text-sm transition-colors group">
                Portfolio
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link to="/signals" className="flex items-center gap-1 text-gray-400 hover:text-amber-400 text-sm transition-colors group">
                Señales
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link to="/consulting" className="flex items-center gap-1 text-gray-400 hover:text-amber-400 text-sm transition-colors group">
                Consultoría
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>

          {/* Feedback Form */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Tu Feedback</h4>
            <p className="text-gray-500 text-xs mb-3">¿Qué te gustaría ver en Alpha Crypto?</p>
            
            {submitted ? (
              <div className="flex items-center gap-2 text-emerald-500 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                <CheckCircle size={18} />
                <span className="text-sm">¡Gracias por tu feedback!</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-3" data-testid="feedback-form">
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={feedbackForm.name}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  data-testid="feedback-name"
                />
                <input
                  type="email"
                  placeholder="Tu email"
                  value={feedbackForm.email}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  data-testid="feedback-email"
                />
                <textarea
                  placeholder="Tu mensaje..."
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
                      Enviar
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
            © {currentYear} Alpha Crypto. Tu alpha en el mercado.
          </p>
          <div className="flex items-center gap-2">
            <img 
              src={OWL_URL} 
              alt="Alpha Owl" 
              className="w-5 h-5 object-contain opacity-40"
            />
            <span className="text-gray-600 text-xs">Powered by Intelligence</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
