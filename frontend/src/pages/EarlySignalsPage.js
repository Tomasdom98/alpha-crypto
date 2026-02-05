import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, Bell, TrendingUp, TrendingDown, Clock, ExternalLink, AlertCircle, Flame, Star, MessageCircle, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL + '/api';

// Brand Assets
const OWL_URL = "https://customer-assets.emergentagent.com/job_aa332bb7-9735-40f0-a436-aa4f8697591d/artifacts/wqm01lrp_Gemini_Generated_Image_xn8vxaxn8vxaxn8v.png";

function EarlySignalsPage() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);

  useEffect(function() {
    async function fetchSignals() {
      try {
        const response = await axios.get(API + '/early-signals');
        setSignals(response.data);
      } catch (error) {
        setSignals(getMockSignals());
      } finally {
        setLoading(false);
      }
    }
    fetchSignals();
  }, []);

  function getMockSignals() {
    return [
      { id: '1', type: 'opportunity', priority: 'high', title: 'Arbitrum Airdrop Season 2', description: 'Usuarios activos podrian calificar.', action: 'Bridge y usar Arbitrum', link: 'https://arbitrum.io', timestamp: new Date().toISOString(), premium: false },
      { id: '2', type: 'alert', priority: 'urgent', title: 'Bitcoin: Soporte en $68K', description: 'BTC testeando soporte critico.', action: 'Set buy orders', timestamp: new Date().toISOString(), premium: true }
    ];
  }

  function getTypeIcon(type) {
    if (type === 'opportunity') return <Zap className="text-emerald-400" size={18} />;
    if (type === 'alert') return <AlertCircle className="text-amber-400" size={18} />;
    if (type === 'news') return <Bell className="text-blue-400" size={18} />;
    if (type === 'community') return <MessageCircle className="text-purple-400" size={18} />;
    return <Zap className="text-gray-400" size={18} />;
  }

  function getTypeColor(type) {
    if (type === 'opportunity') return 'border-emerald-500/30 bg-emerald-500/5';
    if (type === 'alert') return 'border-amber-500/30 bg-amber-500/5';
    if (type === 'news') return 'border-blue-500/30 bg-blue-500/5';
    if (type === 'community') return 'border-purple-500/30 bg-purple-500/5';
    return 'border-gray-500/30 bg-gray-500/5';
  }

  function getPriorityBadge(priority) {
    if (priority === 'urgent') {
      return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1"><Flame size={12} /> URGENT</span>;
    }
    if (priority === 'high') {
      return <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1"><Star size={12} /> HIGH</span>;
    }
    if (priority === 'medium') {
      return <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">MEDIUM</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">LOW</span>;
  }

  function getTimeAgo(timestamp) {
    var now = new Date();
    var time = new Date(timestamp);
    var diffMs = now - time;
    var diffMins = Math.floor(diffMs / 60000);
    var diffHours = Math.floor(diffMs / 3600000);
    var diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return diffMins + 'm ago';
    if (diffHours < 24) return diffHours + 'h ago';
    return diffDays + 'd ago';
  }

  var urgentSignals = [];
  var otherSignals = [];
  for (var i = 0; i < signals.length; i++) {
    if (signals[i].priority === 'urgent') {
      urgentSignals.push(signals[i]);
    } else {
      otherSignals.push(signals[i]);
    }
  }

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
    <div className="min-h-screen py-12 relative" data-testid="early-signals-page">
      {/* Owl mascot decoration - cropped to show only the owl */}
      <div className="absolute right-4 top-16 pointer-events-none hidden lg:block overflow-hidden" 
           style={{ width: '100px', height: '120px' }}>
        <img 
          src={OWL_URL}
          alt="Alpha Owl" 
          className="w-[250px] h-auto opacity-30 animate-float drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          style={{ 
            marginTop: '-145px',
            marginLeft: '-75px'
          }}
        />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {urgentSignals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
              <Flame className="animate-pulse" /> Urgent Signals
            </h2>
            <div className="space-y-4">
              {urgentSignals.map(function(signal) {
                return (
                  <div key={signal.id} data-testid={'signal-' + signal.id} className={'glass-card rounded-xl p-5 border-2 border-red-500/50 bg-red-500/5 ' + (signal.premium ? 'premium-glow' : '')}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-red-500/20">{getTypeIcon(signal.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-white">{signal.title}</h3>
                            {signal.premium && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">PREMIUM</span>}
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
                            <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12} /> {getTimeAgo(signal.timestamp)}</span>
                            {signal.link && <a href={signal.link} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">Learn more <ExternalLink size={12} /></a>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Bell /> All Signals
          </h2>
          <div className="space-y-4">
            {otherSignals.map(function(signal) {
              return (
                <div key={signal.id} data-testid={'signal-' + signal.id} className={'glass-card rounded-xl p-5 border ' + getTypeColor(signal.type) + ' ' + (signal.premium ? 'premium-glow' : '')}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-gray-800/50">{getTypeIcon(signal.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-white">{signal.title}</h3>
                          {signal.premium && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">PREMIUM</span>}
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
                          <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12} /> {getTimeAgo(signal.timestamp)}</span>
                          {signal.link && <a href={signal.link} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">Learn more <ExternalLink size={12} /></a>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 glass-card rounded-2xl p-6 text-center border border-emerald-500/30">
          <h3 className="text-xl font-bold text-white mb-2">Never Miss an Opportunity</h3>
          <p className="text-gray-400 mb-4">Get instant notifications for urgent signals and premium alpha</p>
          
          {subscribed ? (
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <CheckCircle size={20} />
              <span className="font-bold">Subscribed to alerts!</span>
            </div>
          ) : showEmailInput ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={function(e) { setEmail(e.target.value); }}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                data-testid="alert-email-input"
              />
              <button
                onClick={function() {
                  if (!email) { toast.error('Please enter your email'); return; }
                  setSubscribing(true);
                  axios.post(API + '/alerts/subscribe', { email: email })
                    .then(function() {
                      setSubscribed(true);
                      toast.success('Successfully subscribed to alerts!');
                    })
                    .catch(function() { toast.error('Failed to subscribe'); })
                    .finally(function() { setSubscribing(false); });
                }}
                disabled={subscribing}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
                data-testid="alert-subscribe-btn"
              >
                {subscribing ? <Loader2 size={18} className="animate-spin" /> : <Bell size={18} />}
                Subscribe
              </button>
            </div>
          ) : (
            <button 
              onClick={function() { setShowEmailInput(true); }}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-8 rounded-lg transition-all inline-flex items-center gap-2"
            >
              <Bell size={18} /> Enable Notifications
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EarlySignalsPage;
