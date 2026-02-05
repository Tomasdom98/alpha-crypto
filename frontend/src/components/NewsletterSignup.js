import { useState } from 'react';
import { Mail, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function NewsletterSignup({ variant = 'default' }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
      setEmail('');
    } catch (err) {
      setError('Error al suscribirse. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`${variant === 'hero' ? 'p-8' : 'p-6'} bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center`}>
        <div className="flex items-center justify-center gap-3 text-emerald-400">
          <CheckCircle size={28} />
          <span className="text-xl font-bold">¡Suscrito!</span>
        </div>
        <p className="text-gray-400 mt-2">Revisa tu email para confirmar 📬</p>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/20 via-gray-900 to-gray-900 border border-emerald-500/30 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-emerald-400" size={24} />
            <span className="text-emerald-400 font-bold uppercase text-sm tracking-wider">Newsletter Gratuito</span>
          </div>
          
          <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
            Recibe alpha directo en tu inbox 🦉
          </h3>
          
          <p className="text-gray-400 mb-6 max-w-md">
            Únete a +1,000 inversores que reciben análisis de mercado, nuevos airdrops y contenido exclusivo cada semana.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full pl-12 pr-4 py-4 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                data-testid="newsletter-email-hero"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              data-testid="newsletter-submit-hero"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Suscribirme
                  <span className="text-xl">→</span>
                </>
              )}
            </button>
          </form>
          
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          
          <p className="text-gray-600 text-xs mt-4">
            Sin spam. Cancela cuando quieras. 🔒
          </p>
        </div>
      </div>
    );
  }

  // Default compact variant
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="text-emerald-400" size={20} />
        <span className="text-white font-bold">Newsletter</span>
      </div>
      
      <p className="text-gray-400 text-sm mb-4">
        Recibe artículos y airdrops en tu email
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
          data-testid="newsletter-email"
        />
        
        {error && <p className="text-red-400 text-xs">{error}</p>}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
          data-testid="newsletter-submit"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            'Suscribirme'
          )}
        </button>
      </form>
    </div>
  );
}
