import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, Bell, TrendingUp, TrendingDown, Clock, ExternalLink, AlertCircle, Flame, Star, MessageCircle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function EarlySignalsPage() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch signals from API or use mock data
    const fetchSignals = async () => {
      try {
        const response = await axios.get(`${API}/early-signals`);
        setSignals(response.data);
      } catch (error) {
        // Use mock data if API not available
        setSignals(getMockSignals());
      } finally {
        setLoading(false);
      }
    };
    fetchSignals();
  }, []);

  const getMockSignals = () => [
    {
      id: '1',
      type: 'opportunity',
      priority: 'high',
      title: 'Arbitrum Airdrop Season 2 Hints',
      description: 'El equipo de Arbitrum ha insinuado una segunda ronda de airdrops. Usuarios activos en el ecosistema podrían calificar.',
      action: 'Bridge y usar protocolos en Arbitrum',
      link: 'https://arbitrum.io',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      premium: false
    },
    {
      id: '2',
      type: 'alert',
      priority: 'urgent',
      title: 'Bitcoin: Soporte Clave en $68K',
      description: 'BTC testeando soporte crítico. Ruptura podría llevar a $62K. Mantener stables listos para compra.',
      action: 'Set buy orders at $65K',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      premium: true
    },
    {
      id: '3',
      type: 'news',
      priority: 'medium',
      title: 'BlackRock ETF: Record Inflows',
      description: 'IBIT de BlackRock registró $500M en entradas en un solo día. Señal alcista institucional.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      premium: false
    },
    {
      id: '4',
      type: 'opportunity',
      priority: 'high',
      title: 'Solana DEX Rewards Program',
      description: 'Jupiter Exchange lanzó programa de puntos. Traders activos acumulan para posible airdrop.',
      action: 'Trade en Jupiter, acumular puntos',
      link: 'https://jup.ag',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      premium: false
    },
    {
      id: '5',
      type: 'community',
      priority: 'low',
      title: 'Alpha Crypto Discord: Q&A Esta Semana',
      description: 'Sesión de preguntas y respuestas con el equipo de análisis. Jueves 8PM UTC.',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      premium: false
    },
    {
      id: '6',
      type: 'alert',
      priority: 'high',
      title: 'ETH: Patrón Técnico Formándose',
      description: 'Ethereum formando cuña descendente. Breakout alcista esperado si supera $2,200.',
      action: 'Watch for breakout confirmation',
      timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      premium: true
    },
    {
      id: '7',
      type: 'news',
      priority: 'medium',
      title: 'Stripe Expande Pagos Crypto',
      description: 'Stripe habilita pagos con USDC para más merchants. Adopción institucional acelerando.',
      timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
      premium: false
    },
    {
      id: '8',
      type: 'opportunity',
      priority: 'urgent',
      title: 'Base: Nueva Temporada de Incentivos',
      description: 'Coinbase Base L2 lanzando programa de incentivos. $10M en rewards para usuarios activos.',
      action: 'Bridge a Base y usar DeFi',
      link: 'https://base.org',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      premium: true
    }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'opportunity': return <Zap className="text-emerald-400" size={18} />;
      case 'alert': return <AlertCircle className="text-amber-400" size={18} />;
      case 'news': return <Bell className="text-blue-400" size={18} />;
      case 'community': return <MessageCircle className="text-purple-400" size={18} />;
      default: return <Zap className="text-gray-400" size={18} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'opportunity': return 'border-emerald-500/30 bg-emerald-500/5';
      case 'alert': return 'border-amber-500/30 bg-amber-500/5';
      case 'news': return 'border-blue-500/30 bg-blue-500/5';
      case 'community': return 'border-purple-500/30 bg-purple-500/5';
      default: return 'border-gray-500/30 bg-gray-500/5';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1"><Flame size={12} /> URGENT</span>;
      case 'high':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1"><Star size={12} /> HIGH</span>;
      case 'medium':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">MEDIUM</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">LOW</span>;
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const urgentSignals = signals.filter(s => s.priority === 'urgent');
  const otherSignals = signals.filter(s => s.priority !== 'urgent');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-emerald-500 text-xl font-mono">Loading signals...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12" data-testid="early-signals-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-4 transition-colors">
            <ChevronRight size={16} className="rotate-180" /> Back to Home
          </Link>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" data-testid="signals-heading">
                Early Signals
              </h1>
              <p className="text-gray-400">Quick opportunities, express news, and community alerts</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-sm font-bold">Live Updates</span>
            </div>
          </div>
        </div>

        {/* Urgent Signals */}
        {urgentSignals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
              <Flame className="animate-pulse" /> Urgent Signals
            </h2>
            <div className="space-y-4">
              {urgentSignals.map((signal) => (
                <div 
                  key={signal.id}
                  data-testid={`signal-${signal.id}`}
                  className={`glass-card rounded-xl p-5 border-2 border-red-500/50 bg-red-500/5 ${signal.premium ? 'premium-glow' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-red-500/20">
                        {getTypeIcon(signal.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-white">{signal.title}</h3>
                          {signal.premium && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">PREMIUM</span>
                          )}
                          {getPriorityBadge(signal.priority)}
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{signal.description}</p>
                        {signal.action && (
                          <div className="p-2 bg-gray-800/50 rounded-lg mb-2">
                            <span className="text-xs text-gray-500">Action: </span>
                            <span className="text-emerald-400 text-sm font-medium">{signal.action}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} /> {getTimeAgo(signal.timestamp)}
                          </span>
                          {signal.link && (
                            <a 
                              href={signal.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                            >
                              Learn more <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Signals */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Bell /> All Signals
          </h2>
          <div className="space-y-4">
            {otherSignals.map((signal) => (
              <div 
                key={signal.id}
                data-testid={`signal-${signal.id}`}
                className={`glass-card rounded-xl p-5 border ${getTypeColor(signal.type)} ${signal.premium ? 'premium-glow' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-gray-800/50">
                      {getTypeIcon(signal.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-white">{signal.title}</h3>
                        {signal.premium && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">PREMIUM</span>
                        )}
                        {getPriorityBadge(signal.priority)}
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{signal.description}</p>
                      {signal.action && (
                        <div className="p-2 bg-gray-800/30 rounded-lg mb-2">
                          <span className="text-xs text-gray-500">Action: </span>
                          <span className="text-emerald-400 text-sm font-medium">{signal.action}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={12} /> {getTimeAgo(signal.timestamp)}
                        </span>
                        {signal.link && (
                          <a 
                            href={signal.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                          >
                            Learn more <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscribe CTA */}
        <div className="mt-10 glass-card rounded-2xl p-6 text-center border border-emerald-500/30">
          <h3 className="text-xl font-bold text-white mb-2">Never Miss an Opportunity</h3>
          <p className="text-gray-400 mb-4">Get instant notifications for urgent signals and premium alpha</p>
          <button className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-8 rounded-lg transition-all inline-flex items-center gap-2">
            <Bell size={18} />
            Enable Notifications
          </button>
        </div>
      </div>
    </div>
  );
}
