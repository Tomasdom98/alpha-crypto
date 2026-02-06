import { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, Clock, Users, DollarSign, ChevronRight, MessageSquare, Mail, Briefcase, Bell, FileText, Gift, Zap, Plus, Edit2, Trash2, Save, X, BarChart3, Coins, PiggyBank, Wallet, TrendingUp, TrendingDown, Lock, LogOut, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL + '/api';
const ADMIN_PASSWORD = 'alphacrypto2024';
const AUTH_KEY = 'alpha_admin_auth';

// Tab configurations
const TABS = [
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'articles', label: 'Articles', icon: FileText },
  { id: 'airdrops', label: 'Airdrops', icon: Gift },
  { id: 'signals', label: 'Signals', icon: Zap },
  { id: 'yields', label: 'Yields', icon: Coins },
  { id: 'staking', label: 'Staking', icon: PiggyBank },
  { id: 'portfolio', label: 'Portfolio', icon: Wallet },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  { id: 'subscribers', label: 'Subscribers', icon: Bell },
];

// Login Component
function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_KEY, 'true');
      onLogin();
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-emerald-500" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400">Ingresa la contraseña para acceder</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white pr-12 focus:border-emerald-500 focus:outline-none"
                placeholder="••••••••••••"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
          
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Acceder
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-400 hover:text-emerald-400 text-sm">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Check authentication on mount
  useEffect(() => {
    const auth = localStorage.getItem(AUTH_KEY);
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => { if (isAuthenticated) fetchData(); }, [activeTab, isAuthenticated]);

  function handleLogout() {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    toast.success('Sesión cerrada');
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  async function fetchData() {
    setLoading(true);
    try {
      const endpoints = {
        stats: '/admin/stats',
        users: '/admin/users',
        feedback: '/admin/feedback',
        consulting: '/admin/consulting',
        subscribers: '/admin/alert-subscribers',
        articles: '/admin/articles',
        airdrops: '/admin/airdrops',
        signals: '/admin/signals',
        yields: '/admin/yields',
        staking: '/admin/staking',
        portfolio: '/admin/portfolio',
      };
      const endpoint = endpoints[activeTab];
      if (endpoint) {
        const res = await axios.get(API + endpoint);
        setData(prev => ({ ...prev, [activeTab]: res.data }));
      }
    } catch (err) {
      toast.error('Failed to load ' + activeTab);
    }
    setLoading(false);
  }

  function openModal(type, item = null) {
    setModalType(type);
    setEditingItem(item);
    const defaults = {
      article: { title: '', excerpt: '', content: '', category: 'Mercado', premium: false, image_url: '', tags: '', read_time: '5 min' },
      airdrop: { project_name: '', description: '', chain: '', estimated_reward: '$1000-3000', deadline: '', status: 'active', link: '', premium: false, tasks: '' },
      signal: { type: 'opportunity', priority: 'medium', title: '', description: '', action: '', link: '', premium: false },
      yield: { name: '', chain: '', apy: '', description: '', risk_level: 'medium', link: '' },
      staking: { token: '', symbol: '', apy: '', platform: '', link: '' },
      holding: { name: '', symbol: '', allocation: 0, color: '#10b981' },
      trade: { type: 'buy', asset: '', amount: '', reason: '' },
      settings: data.portfolio?.settings || { total_value: 50000, monthly_return: 0, strategy_current: '', strategy_next: '' },
    };
    setFormData(item ? (type === 'article' ? { ...item, tags: (item.tags || []).join(', ') } : { ...item }) : defaults[type] || {});
    setShowModal(true);
  }

  async function handleSubmit() {
    try {
      const endpoints = {
        article: '/admin/articles',
        airdrop: '/admin/airdrops',
        signal: '/admin/signals',
        yield: '/admin/yields',
        staking: '/admin/staking',
        holding: '/admin/portfolio/holdings',
        trade: '/admin/portfolio/trades',
        settings: '/admin/portfolio/settings',
      };
      let payload = { ...formData };
      if (modalType === 'article') payload.tags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
      if (modalType === 'airdrop') payload.tasks = formData.tasks ? formData.tasks.split('\n').filter(t => t.trim()).map((t, i) => ({ id: 't' + (i+1), description: t.trim() })) : [];
      if (modalType === 'holding') payload.allocation = parseFloat(formData.allocation);
      if (modalType === 'settings') {
        payload = { total_value: parseFloat(formData.total_value), monthly_return: parseFloat(formData.monthly_return), strategy_current: formData.strategy_current, strategy_next: formData.strategy_next };
      }
      
      const endpoint = endpoints[modalType];
      const method = editingItem && modalType !== 'trade' && modalType !== 'settings' ? 'put' : (modalType === 'settings' ? 'put' : 'post');
      const url = editingItem && modalType !== 'trade' && modalType !== 'settings' ? API + endpoint + '/' + editingItem.id : API + endpoint;
      
      await axios[method](url, payload);
      toast.success('Saved successfully!');
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save');
    }
  }

  async function handleDelete(type, id) {
    if (!window.confirm('Delete this item?')) return;
    const endpoints = { article: '/admin/articles/', airdrop: '/admin/airdrops/', signal: '/admin/signals/', yield: '/admin/yields/', staking: '/admin/staking/', holding: '/admin/portfolio/holdings/', trade: '/admin/portfolio/trades/' };
    try {
      await axios.delete(API + endpoints[type] + id);
      toast.success('Deleted!');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  }

  function markRead(id) {
    axios.post(API + '/admin/feedback/' + id + '/read').then(() => { toast.success('Marked read'); fetchData(); });
  }

  const stats = data.stats || {};
  const items = data[activeTab] || [];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-4"><ChevronRight size={16} className="rotate-180" /> Back</Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-red-500/20 border border-gray-700 hover:border-red-500/50 text-gray-400 hover:text-red-400 rounded-lg transition-all"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-8 border-b border-gray-800 overflow-x-auto pb-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-3 font-semibold whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white'}`}>
                <Icon size={18} />{tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-20"><div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" /></div>
        ) : (
          <div>
            {activeTab === 'stats' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Articles', value: stats.articles, icon: FileText, color: 'blue' },
                  { label: 'Airdrops', value: stats.airdrops, icon: Gift, color: 'purple' },
                  { label: 'Signals', value: stats.signals, icon: Zap, color: 'yellow' },
                  { label: 'Subscribers', value: stats.subscribers, icon: Bell, color: 'emerald' },
                  { label: 'Users', value: stats.total_users, icon: Users, color: 'cyan' },
                  { label: 'Premium', value: stats.premium_users, icon: DollarSign, color: 'green' },
                  { label: 'Consulting', value: stats.pending_consulting, icon: Briefcase, color: 'orange' },
                  { label: 'Feedback', value: stats.unread_feedback, icon: MessageSquare, color: 'pink' },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="glass-card rounded-2xl p-6 text-center">
                      <Icon className={`mx-auto text-${stat.color}-400 mb-2`} size={32} />
                      <div className="text-3xl font-bold text-white">{stat.value || 0}</div>
                      <div className="text-gray-400 text-sm">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {['articles', 'airdrops', 'signals', 'yields', 'staking'].includes(activeTab) && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} ({items.length})</h2>
                  <button onClick={() => openModal(activeTab === 'yields' ? 'yield' : activeTab.slice(0, -1))} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><Plus size={18} /> Add</button>
                </div>
                {items.length === 0 ? (
                  <div className="text-center py-20 glass-card rounded-2xl"><p className="text-gray-500">No {activeTab} yet. Add some!</p></div>
                ) : (
                  <div className="space-y-4">
                    {items.map(item => (
                      <div key={item.id} className="glass-card rounded-2xl p-6 flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white">{item.title || item.project_name || item.name || item.token}</h3>
                            {item.apy && <span className="text-xl font-bold text-emerald-400">{item.apy}</span>}
                            {item.category && <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400">{item.category}</span>}
                            {item.chain && <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400">{item.chain}</span>}
                            {item.platform && <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400">{item.platform}</span>}
                            {item.premium && <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400">Premium</span>}
                          </div>
                          <p className="text-gray-400 text-sm">{item.description || item.excerpt}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button onClick={() => openModal(activeTab === 'yields' ? 'yield' : activeTab.slice(0, -1), item)} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(activeTab === 'yields' ? 'yield' : activeTab.slice(0, -1), item.id)} className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div className="space-y-8">
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Portfolio Settings</h2>
                    <button onClick={() => openModal('settings')} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><Edit2 size={16} /> Edit</button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4"><div className="text-gray-400 text-sm">Total Value</div><div className="text-2xl font-bold text-white">${(items.settings?.total_value || 50000).toLocaleString()}</div></div>
                    <div className="bg-gray-800/50 rounded-lg p-4"><div className="text-gray-400 text-sm">Monthly Return</div><div className="text-2xl font-bold text-emerald-400">+{items.settings?.monthly_return || 0}%</div></div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Holdings ({(items.holdings || []).length})</h2>
                    <button onClick={() => openModal('holding')} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><Plus size={18} /> Add</button>
                  </div>
                  {(items.holdings || []).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No holdings. Using mock data.</p>
                  ) : (
                    <div className="space-y-3">
                      {(items.holdings || []).map(h => (
                        <div key={h.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: h.color }}></div>
                            <div><div className="text-white font-bold">{h.name}</div><div className="text-gray-500 text-sm">{h.symbol}</div></div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-white font-bold">{h.allocation}%</span>
                            <button onClick={() => openModal('holding', h)} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"><Edit2 size={14} /></button>
                            <button onClick={() => handleDelete('holding', h.id)} className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2 rounded-lg"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Trades ({(items.trades || []).length})</h2>
                    <button onClick={() => openModal('trade')} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><Plus size={18} /> Add</button>
                  </div>
                  {(items.trades || []).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No trades. Using mock data.</p>
                  ) : (
                    <div className="space-y-3">
                      {(items.trades || []).map(t => (
                        <div key={t.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            {t.type === 'buy' ? <TrendingUp className="text-emerald-400" size={20} /> : <TrendingDown className="text-red-400" size={20} />}
                            <div><div className="text-white font-bold">{t.type.toUpperCase()} {t.asset}</div><div className="text-gray-500 text-xs">{t.reason}</div></div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-white font-bold">{t.amount}</span>
                            <button onClick={() => handleDelete('trade', t.id)} className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2 rounded-lg"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-4">
                {items.length === 0 ? <div className="text-center py-20"><p className="text-gray-500">No premium users yet</p></div> : items.map((user, i) => (
                  <div key={i} className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3"><Users className="text-emerald-500" size={24} /><h3 className="text-lg font-bold text-white">{user.email}</h3></div>
                    <div className="text-sm text-gray-400">Joined: {new Date(user.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="space-y-4">
                {items.length === 0 ? <div className="text-center py-20"><MessageSquare className="mx-auto text-gray-600 mb-4" size={48} /><p className="text-gray-500">No feedback yet</p></div> : items.map(item => (
                  <div key={item.id} className={`glass-card rounded-2xl p-6 border ${item.read ? 'border-gray-700/50 opacity-70' : 'border-emerald-500/30'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-3"><h3 className="text-lg font-bold text-white">{item.name}</h3><span className="text-gray-400 text-sm">{item.email}</span>{!item.read && <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">New</span>}</div>
                        <p className="text-gray-300 bg-gray-800/50 rounded-lg p-4">{item.message}</p>
                      </div>
                      {!item.read && <button onClick={() => markRead(item.id)} className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm">Mark Read</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'subscribers' && (
              <div>
                <div className="glass-card rounded-2xl p-6 mb-4"><h3 className="text-lg font-bold text-white">Total: {items.length}</h3></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {items.map(sub => (
                    <div key={sub.id} className="glass-card rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center"><Mail className="text-emerald-400" size={18} /></div>
                      <div><div className="text-white">{sub.email}</div><div className="text-xs text-gray-500">{new Date(sub.subscribed_at).toLocaleDateString()}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">{editingItem ? 'Edit' : 'Create'} {modalType}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
              </div>
              
              <div className="space-y-4">
                {modalType === 'article' && (
                  <>
                    <div><label className="block text-sm text-gray-400 mb-1">Title</label><input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                    <div><label className="block text-sm text-gray-400 mb-1">Excerpt</label><textarea value={formData.excerpt || ''} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-20" /></div>
                    <div><label className="block text-sm text-gray-400 mb-1">Content (Markdown)</label><textarea value={formData.content || ''} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-40 font-mono text-sm" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm text-gray-400 mb-1">Category</label><select value={formData.category || 'Mercado'} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"><option>Mercado</option><option>DeFi</option><option>Tecnología</option><option>Stablecoins</option></select></div>
                      <div><label className="block text-sm text-gray-400 mb-1">Read Time</label><input type="text" value={formData.read_time || ''} onChange={e => setFormData({...formData, read_time: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                    </div>
                    <div><label className="block text-sm text-gray-400 mb-1">Tags (comma separated)</label><input type="text" value={formData.tags || ''} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                    <div className="flex items-center gap-2"><input type="checkbox" checked={formData.premium || false} onChange={e => setFormData({...formData, premium: e.target.checked})} className="rounded" /><label className="text-sm text-gray-400">Premium</label></div>
                  </>
                )}
                
                {modalType === 'airdrop' && (
                  <>
                    <div><label className="block text-sm text-gray-400 mb-1">Project Name</label><input type="text" value={formData.project_name || ''} onChange={e => setFormData({...formData, project_name: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                    <div><label className="block text-sm text-gray-400 mb-1">Description</label><textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-20" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm text-gray-400 mb-1">Chain</label><input type="text" value={formData.chain || ''} onChange={e => setFormData({...formData, chain: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                      <div><label className="block text-sm text-gray-400 mb-1">Status</label><select value={formData.status || 'active'} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"><option value="active">Active</option><option value="upcoming">Upcoming</option><option value="expired">Expired</option></select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm text-gray-400 mb-1">Reward</label><input type="text" value={formData.estimated_reward || ''} onChange={e => setFormData({...formData, estimated_reward: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                      <div><label className="block text-sm text-gray-400 mb-1">Deadline</label><input type="date" value={formData.deadline ? formData.deadline.split('T')[0] : ''} onChange={e => setFormData({...formData, deadline: e.target.value + 'T23:59:59Z'})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                    </div>
                    <div><label className="block text-sm text-gray-400 mb-1">Link</label><input type="text" value={formData.link || ''} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                    <div><label className="block text-sm text-gray-400 mb-1">Tasks (one per line)</label><textarea value={formData.tasks || ''} onChange={e => setFormData({...formData, tasks: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-24 font-mono text-sm" /></div>
                    <div className="flex items-center gap-2"><input type="checkbox" checked={formData.premium || false} onChange={e => setFormData({...formData, premium: e.target.checked})} className="rounded" /><label className="text-sm text-gray-400">Premium</label></div>
                  </>
                )}
                
                {modalType === 'signal' && (
                  <>
                    <div><label className="block text-sm text-gray-400 mb-1">Title</label><input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                    <div><label className="block text-sm text-gray-400 mb-1">Description</label><textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-24" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm text-gray-400 mb-1">Type</label><select value={formData.type || 'opportunity'} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"><option value="opportunity">Opportunity</option><option value="alert">Alert</option><option value="news">News</option></select></div>
                      <div><label className="block text-sm text-gray-400 mb-1">Priority</label><select value={formData.priority || 'medium'} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"><option value="urgent">Urgent</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
                    </div>
                    <div><label className="block text-sm text-gray-400 mb-1">Action</label><input type="text" value={formData.action || ''} onChange={e => setFormData({...formData, action: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                    <div className="flex items-center gap-2"><input type="checkbox" checked={formData.premium || false} onChange={e => setFormData({...formData, premium: e.target.checked})} className="rounded" /><label className="text-sm text-gray-400">Premium</label></div>
                  </>
                )}
                
                {modalType === 'yield' && (
                  <>
                    <div><label className="block text-sm text-gray-400 mb-1">Protocol Name</label><input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="Based.one HLP" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm text-gray-400 mb-1">APY</label><input type="text" value={formData.apy || ''} onChange={e => setFormData({...formData, apy: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="139%" /></div>
                      <div><label className="block text-sm text-gray-400 mb-1">Chain</label><input type="text" value={formData.chain || ''} onChange={e => setFormData({...formData, chain: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="Hyperliquid L1" /></div>
                    </div>
                    <div><label className="block text-sm text-gray-400 mb-1">Description</label><textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-20" /></div>
                    <div><label className="block text-sm text-gray-400 mb-1">Risk Level</label><select value={formData.risk_level || 'medium'} onChange={e => setFormData({...formData, risk_level: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
                    <div><label className="block text-sm text-gray-400 mb-1">Link</label><input type="text" value={formData.link || ''} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                  </>
                )}
                
                {modalType === 'staking' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm text-gray-400 mb-1">Token</label><input type="text" value={formData.token || ''} onChange={e => setFormData({...formData, token: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="Solana" /></div>
                      <div><label className="block text-sm text-gray-400 mb-1">Symbol</label><input type="text" value={formData.symbol || ''} onChange={e => setFormData({...formData, symbol: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="SOL" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm text-gray-400 mb-1">APY</label><input type="text" value={formData.apy || ''} onChange={e => setFormData({...formData, apy: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="7-8%" /></div>
                      <div><label className="block text-sm text-gray-400 mb-1">Platform</label><input type="text" value={formData.platform || ''} onChange={e => setFormData({...formData, platform: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="Jupiter" /></div>
                    </div>
                    <div><label className="block text-sm text-gray-400 mb-1">Link</label><input type="text" value={formData.link || ''} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                  </>
                )}
                
                {modalType === 'holding' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm text-gray-400 mb-1">Name</label><input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="Bitcoin" /></div>
                      <div><label className="block text-sm text-gray-400 mb-1">Symbol</label><input type="text" value={formData.symbol || ''} onChange={e => setFormData({...formData, symbol: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="BTC" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm text-gray-400 mb-1">Allocation %</label><input type="number" min="0" max="100" value={formData.allocation || ''} onChange={e => setFormData({...formData, allocation: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                      <div><label className="block text-sm text-gray-400 mb-1">Color</label><input type="color" value={formData.color || '#10b981'} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg" /></div>
                    </div>
                  </>
                )}
                
                {modalType === 'trade' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm text-gray-400 mb-1">Type</label><select value={formData.type || 'buy'} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"><option value="buy">Buy</option><option value="sell">Sell</option></select></div>
                      <div><label className="block text-sm text-gray-400 mb-1">Asset</label><input type="text" value={formData.asset || ''} onChange={e => setFormData({...formData, asset: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="BTC" /></div>
                    </div>
                    <div><label className="block text-sm text-gray-400 mb-1">Amount</label><input type="text" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="$2,500" /></div>
                    <div><label className="block text-sm text-gray-400 mb-1">Reason</label><input type="text" value={formData.reason || ''} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="DCA" /></div>
                  </>
                )}
                
                {modalType === 'settings' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm text-gray-400 mb-1">Total Value ($)</label><input type="number" value={formData.total_value || ''} onChange={e => setFormData({...formData, total_value: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                      <div><label className="block text-sm text-gray-400 mb-1">Monthly Return (%)</label><input type="number" step="0.1" value={formData.monthly_return || ''} onChange={e => setFormData({...formData, monthly_return: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                    </div>
                    <div><label className="block text-sm text-gray-400 mb-1">Current Strategy</label><textarea value={formData.strategy_current || ''} onChange={e => setFormData({...formData, strategy_current: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-20" /></div>
                    <div><label className="block text-sm text-gray-400 mb-1">Next Moves</label><textarea value={formData.strategy_next || ''} onChange={e => setFormData({...formData, strategy_next: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-20" /></div>
                  </>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg">Cancel</button>
                <button onClick={handleSubmit} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2"><Save size={18} /> Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
