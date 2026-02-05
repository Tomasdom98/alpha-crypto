import { useState, useEffect } from 'react';
import { X, Mail, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '@/context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function NewsletterPopup({ delay = 3000 }) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { language } = useLanguage();

  // Translations
  const tx = {
    es: {
      badge: 'Newsletter Gratuito',
      title: 'Newsletter Gratuito 🔮',
      subtitle: 'Recibe nuestros artículos y análisis de mercado directo en tu inbox cada semana 🦉',
      weeklyArticles: 'Artículos semanales',
      marketAnalysis: 'Análisis de mercado',
      noSpam: 'Sin spam',
      cancelAnytime: 'Cancela cuando quieras',
      placeholder: 'tu@email.com',
      subscribe: 'Suscribirme Gratis',
      welcome: '¡Bienvenido! 🦉',
      nowPart: 'Ya eres parte de Alpha Crypto',
      joinCommunity: 'Únete a nuestra comunidad',
      enterEmail: 'Ingresa tu email',
      errorSubscribe: 'Error al suscribirse. Intenta de nuevo.',
    },
    en: {
      badge: 'Free Newsletter',
      title: 'Free Newsletter 🔮',
      subtitle: 'Receive our articles and market analysis directly in your inbox every week 🦉',
      weeklyArticles: 'Weekly articles',
      marketAnalysis: 'Market analysis',
      noSpam: 'No spam',
      cancelAnytime: 'Cancel anytime',
      placeholder: 'your@email.com',
      subscribe: 'Subscribe Free',
      welcome: 'Welcome! 🦉',
      nowPart: 'You are now part of Alpha Crypto',
      joinCommunity: 'Join our community',
      enterEmail: 'Enter your email',
      errorSubscribe: 'Error subscribing. Please try again.',
    }
  }[language];

  useEffect(() => {
    // Check if already subscribed or dismissed
    const dismissed = localStorage.getItem('newsletter_dismissed');
    const subscribed = localStorage.getItem('newsletter_subscribed');
    
    if (dismissed || subscribed) return;

    const timer = setTimeout(() => {
      setShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const handleClose = () => {
    setShow(false);
    localStorage.setItem('newsletter_dismissed', Date.now().toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Ingresa tu email');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await axios.post(`${BACKEND_URL}/api/alerts/subscribe`, { email });
      setSuccess(true);
      localStorage.setItem('newsletter_subscribed', 'true');
      setTimeout(() => setShow(false), 3000);
    } catch (err) {
      setError('Error al suscribirse. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden"
        data-testid="newsletter-popup"
      >
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2" />
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors z-10"
          data-testid="newsletter-popup-close"
        >
          <X size={20} />
        </button>

        <div className="relative p-8">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-emerald-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">¡Bienvenido! 🦉</h3>
              <p className="text-gray-400">Ya eres parte de Alpha Crypto</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <span>🔮</span>
                  <span>Newsletter Gratuito</span>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                  Newsletter Gratuito 🔮
                </h2>
                
                <p className="text-gray-400">
                  Recibe nuestros artículos y análisis de mercado directo en tu inbox cada semana 🦉
                </p>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-emerald-400">✓</span>
                  <span>Artículos semanales</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-emerald-400">✓</span>
                  <span>Análisis de mercado</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-emerald-400">✓</span>
                  <span>Sin spam</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-emerald-400">✓</span>
                  <span>Cancela cuando quieras</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    data-testid="newsletter-popup-email"
                  />
                </div>
                
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  data-testid="newsletter-popup-submit"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      Suscribirme Gratis
                      <span className="text-lg">→</span>
                    </>
                  )}
                </button>
              </form>

              <p className="text-gray-600 text-xs text-center mt-4">
                Únete a nuestra comunidad
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
