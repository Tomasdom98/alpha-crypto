import { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, Clock, Users, DollarSign, ChevronRight, MessageSquare, Mail, Briefcase, Bell, FileText, Gift, Zap, Plus, Edit2, Trash2, Save, X, BarChart3, Coins, PiggyBank, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL + '/api';

function AdminPage() {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [consulting, setConsulting] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [airdrops, setAirdrops] = useState([]);
  const [signals, setSignals] = useState([]);
  const [yields, setYields] = useState([]);
  const [staking, setStaking] = useState([]);
  const [portfolio, setPortfolio] = useState({ holdings: [], trades: [], settings: null });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(function() { fetchData(); }, [activeTab]);

  function fetchData() {
    setLoading(true);
    
    if (activeTab === 'stats') {
      axios.get(API + '/admin/stats').then(function(res) { setStats(res.data); }).catch(function() { toast.error('Failed to load stats'); }).finally(function() { setLoading(false); });
    } else if (activeTab === 'users') {
      axios.get(API + '/admin/users').then(function(res) { setUsers(res.data); }).catch(function() { toast.error('Failed to load users'); }).finally(function() { setLoading(false); });
    } else if (activeTab === 'feedback') {
      axios.get(API + '/admin/feedback').then(function(res) { setFeedback(res.data); }).catch(function() { toast.error('Failed to load feedback'); }).finally(function() { setLoading(false); });
    } else if (activeTab === 'consulting') {
      axios.get(API + '/admin/consulting').then(function(res) { setConsulting(res.data); }).catch(function() { toast.error('Failed to load consulting'); }).finally(function() { setLoading(false); });
    } else if (activeTab === 'subscribers') {
      axios.get(API + '/admin/alert-subscribers').then(function(res) { setSubscribers(res.data); }).catch(function() { toast.error('Failed to load subscribers'); }).finally(function() { setLoading(false); });
    } else if (activeTab === 'articles') {
      axios.get(API + '/admin/articles').then(function(res) { setArticles(res.data); }).catch(function() { toast.error('Failed to load articles'); }).finally(function() { setLoading(false); });
    } else if (activeTab === 'airdrops') {
      axios.get(API + '/admin/airdrops').then(function(res) { setAirdrops(res.data); }).catch(function() { toast.error('Failed to load airdrops'); }).finally(function() { setLoading(false); });
    } else if (activeTab === 'signals') {
      axios.get(API + '/admin/signals').then(function(res) { setSignals(res.data); }).catch(function() { toast.error('Failed to load signals'); }).finally(function() { setLoading(false); });
    } else if (activeTab === 'yields') {
      axios.get(API + '/admin/yields').then(function(res) { setYields(res.data); }).catch(function() { toast.error('Failed to load yields'); }).finally(function() { setLoading(false); });
    } else if (activeTab === 'staking') {
      axios.get(API + '/admin/staking').then(function(res) { setStaking(res.data); }).catch(function() { toast.error('Failed to load staking'); }).finally(function() { setLoading(false); });
    } else if (activeTab === 'portfolio') {
      axios.get(API + '/admin/portfolio').then(function(res) { setPortfolio(res.data); }).catch(function() { toast.error('Failed to load portfolio'); }).finally(function() { setLoading(false); });
    } else if (activeTab === 'pending' || activeTab === 'verified') {
      axios.get(API + '/admin/payments?status=' + activeTab).then(function(res) { setPayments(res.data); }).catch(function() { toast.error('Failed to load payments'); }).finally(function() { setLoading(false); });
    }
  }

  function verifyPayment(paymentId) {
    axios.post(API + '/admin/payments/' + paymentId + '/verify').then(function() { toast.success('Payment verified!'); fetchData(); }).catch(function() { toast.error('Failed to verify'); });
  }

  function markFeedbackRead(feedbackId) {
    axios.post(API + '/admin/feedback/' + feedbackId + '/read').then(function() { toast.success('Marked as read'); fetchData(); }).catch(function() { toast.error('Failed to update'); });
  }

  function updateConsultingStatus(requestId, status) {
    axios.post(API + '/admin/consulting/' + requestId + '/status?status=' + status).then(function() { toast.success('Status updated'); fetchData(); }).catch(function() { toast.error('Failed to update'); });
  }

  function openCreateModal(type) {
    setModalType(type);
    setEditingItem(null);
    if (type === 'article') {
      setFormData({ title: '', excerpt: '', content: '', category: 'Mercado', premium: false, image_url: '', tags: '', read_time: '5 min' });
    } else if (type === 'airdrop') {
      setFormData({ project_name: '', description: '', full_description: '', chain: '', backing: '', timeline: '', reward_note: '', estimated_reward: '$1000-3000', deadline: '', status: 'active', link: '', premium: false, logo_url: '', tasks: '' });
    } else if (type === 'signal') {
      setFormData({ type: 'opportunity', priority: 'medium', title: '', description: '', action: '', link: '', premium: false });
    } else if (type === 'yield') {
      setFormData({ name: '', chain: '', apy: '', description: '', risk_level: 'medium', link: '', logo_url: '' });
    } else if (type === 'staking') {
      setFormData({ token: '', symbol: '', apy: '', platform: '', link: '', logo_url: '' });
    } else if (type === 'holding') {
      setFormData({ name: '', symbol: '', allocation: 0, color: '#10b981' });
    } else if (type === 'trade') {
      setFormData({ type: 'buy', asset: '', amount: '', reason: '' });
    } else if (type === 'settings') {
      setFormData({ total_value: portfolio.settings?.total_value || 50000, monthly_return: portfolio.settings?.monthly_return || 0, strategy_current: portfolio.settings?.strategy_current || '', strategy_next: portfolio.settings?.strategy_next || '' });
    }
    setShowModal(true);
  }

  function openEditModal(type, item) {
    setModalType(type);
    setEditingItem(item);
    if (type === 'article') {
      setFormData({ ...item, tags: (item.tags || []).join(', ') });
    } else if (type === 'airdrop') {
      setFormData({ ...item, tasks: (item.tasks || []).map(t => t.description).join('\n') });
    } else {
      setFormData({ ...item });
    }
    setShowModal(true);
  }

  function handleSubmit() {
    let endpoint, method, data;
    
    if (modalType === 'article') {
      data = { ...formData, tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [] };
      endpoint = editingItem ? API + '/admin/articles/' + editingItem.id : API + '/admin/articles';
      method = editingItem ? 'put' : 'post';
    } else if (modalType === 'airdrop') {
      const tasks = formData.tasks ? formData.tasks.split('\n').filter(t => t.trim()).map((t, i) => ({ id: 't' + (i+1), description: t.trim(), completed: false })) : [];
      data = { ...formData, tasks };
      endpoint = editingItem ? API + '/admin/airdrops/' + editingItem.id : API + '/admin/airdrops';
      method = editingItem ? 'put' : 'post';
    } else if (modalType === 'signal') {
      data = { ...formData };
      endpoint = editingItem ? API + '/admin/signals/' + editingItem.id : API + '/admin/signals';
      method = editingItem ? 'put' : 'post';
    } else if (modalType === 'yield') {
      data = { ...formData };
      endpoint = editingItem ? API + '/admin/yields/' + editingItem.id : API + '/admin/yields';
      method = editingItem ? 'put' : 'post';
    } else if (modalType === 'staking') {
      data = { ...formData };
      endpoint = editingItem ? API + '/admin/staking/' + editingItem.id : API + '/admin/staking';
      method = editingItem ? 'put' : 'post';
    } else if (modalType === 'holding') {
      data = { ...formData, allocation: parseFloat(formData.allocation) };
      endpoint = editingItem ? API + '/admin/portfolio/holdings/' + editingItem.id : API + '/admin/portfolio/holdings';
      method = editingItem ? 'put' : 'post';
    } else if (modalType === 'trade') {
      data = { ...formData };
      endpoint = API + '/admin/portfolio/trades';
      method = 'post';
    } else if (modalType === 'settings') {
      data = { total_value: parseFloat(formData.total_value), monthly_return: parseFloat(formData.monthly_return), strategy_current: formData.strategy_current, strategy_next: formData.strategy_next };
      endpoint = API + '/admin/portfolio/settings';
      method = 'put';
    }
    
    axios[method](endpoint, data)
      .then(function() { toast.success(editingItem ? 'Updated successfully!' : 'Created successfully!'); setShowModal(false); fetchData(); })
      .catch(function(err) { toast.error('Failed to save: ' + (err.response?.data?.detail || 'Unknown error')); });
  }

  function handleDelete(type, id) {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    let endpoint;
    if (type === 'article') endpoint = API + '/admin/articles/' + id;
    else if (type === 'airdrop') endpoint = API + '/admin/airdrops/' + id;
    else if (type === 'signal') endpoint = API + '/admin/signals/' + id;
    else if (type === 'yield') endpoint = API + '/admin/yields/' + id;
    else if (type === 'staking') endpoint = API + '/admin/staking/' + id;
    else if (type === 'holding') endpoint = API + '/admin/portfolio/holdings/' + id;
    else if (type === 'trade') endpoint = API + '/admin/portfolio/trades/' + id;
    
    axios.delete(endpoint).then(function() { toast.success('Deleted successfully!'); fetchData(); }).catch(function() { toast.error('Failed to delete'); });
  }

  function getStatusColor(status) {
    if (status === 'verified' || status === 'completed' || status === 'active') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (status === 'rejected' || status === 'expired') return 'bg-red-500/10 text-red-400 border-red-500/30';
    if (status === 'contacted') return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }

  function getRiskColor(risk) {
    if (risk === 'low') return 'bg-emerald-500/20 text-emerald-400';
    if (risk === 'high') return 'bg-red-500/20 text-red-400';
    return 'bg-amber-500/20 text-amber-400';
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-4 transition-colors">
            <ChevronRight size={16} className="rotate-180" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" data-testid="admin-page-heading">Admin Dashboard</h1>
          <p className="text-gray-400 text-lg">Manage content, payments, users and more</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-800 overflow-x-auto pb-1">
          <button onClick={function() { setActiveTab('stats'); }} className={'px-4 py-3 font-semibold transition-all whitespace-nowrap ' + (activeTab === 'stats' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white')}>
            <BarChart3 className="inline-block mr-2" size={18} />Stats
          </button>
          <button onClick={function() { setActiveTab('articles'); }} className={'px-4 py-3 font-semibold transition-all whitespace-nowrap ' + (activeTab === 'articles' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white')} data-testid="articles-tab">
            <FileText className="inline-block mr-2" size={18} />Articles
          </button>
          <button onClick={function() { setActiveTab('airdrops'); }} className={'px-4 py-3 font-semibold transition-all whitespace-nowrap ' + (activeTab === 'airdrops' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white')} data-testid="airdrops-tab">
            <Gift className="inline-block mr-2" size={18} />Airdrops
          </button>
          <button onClick={function() { setActiveTab('signals'); }} className={'px-4 py-3 font-semibold transition-all whitespace-nowrap ' + (activeTab === 'signals' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white')} data-testid="signals-tab">
            <Zap className="inline-block mr-2" size={18} />Signals
          </button>
          <button onClick={function() { setActiveTab('yields'); }} className={'px-4 py-3 font-semibold transition-all whitespace-nowrap ' + (activeTab === 'yields' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white')} data-testid="yields-tab">
            <Coins className="inline-block mr-2" size={18} />Yields
          </button>
          <button onClick={function() { setActiveTab('staking'); }} className={'px-4 py-3 font-semibold transition-all whitespace-nowrap ' + (activeTab === 'staking' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white')} data-testid="staking-tab">
            <PiggyBank className="inline-block mr-2" size={18} />Staking
          </button>
          <button onClick={function() { setActiveTab('portfolio'); }} className={'px-4 py-3 font-semibold transition-all whitespace-nowrap ' + (activeTab === 'portfolio' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white')} data-testid="portfolio-tab">
            <Wallet className="inline-block mr-2" size={18} />Portfolio
          </button>
          <button onClick={function() { setActiveTab('users'); }} className={'px-4 py-3 font-semibold transition-all whitespace-nowrap ' + (activeTab === 'users' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white')}>
            <Users className="inline-block mr-2" size={18} />Users
          </button>
          <button onClick={function() { setActiveTab('feedback'); }} className={'px-4 py-3 font-semibold transition-all whitespace-nowrap ' + (activeTab === 'feedback' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white')} data-testid="feedback-tab">
            <MessageSquare className="inline-block mr-2" size={18} />Feedback
          </button>
          <button onClick={function() { setActiveTab('subscribers'); }} className={'px-4 py-3 font-semibold transition-all whitespace-nowrap ' + (activeTab === 'subscribers' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white')} data-testid="subscribers-tab">
            <Bell className="inline-block mr-2" size={18} />Subscribers
          </button>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4" />
            <div className="text-emerald-500 text-xl font-semibold">Loading...</div>
          </div>
        )}

        {/* Stats Tab */}
        {!loading && activeTab === 'stats' && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-6 text-center"><FileText className="mx-auto text-blue-400 mb-2" size={32} /><div className="text-3xl font-bold text-white">{stats.articles}</div><div className="text-gray-400 text-sm">Articles</div></div>
            <div className="glass-card rounded-2xl p-6 text-center"><Gift className="mx-auto text-purple-400 mb-2" size={32} /><div className="text-3xl font-bold text-white">{stats.airdrops}</div><div className="text-gray-400 text-sm">Airdrops</div></div>
            <div className="glass-card rounded-2xl p-6 text-center"><Zap className="mx-auto text-yellow-400 mb-2" size={32} /><div className="text-3xl font-bold text-white">{stats.signals}</div><div className="text-gray-400 text-sm">Signals</div></div>
            <div className="glass-card rounded-2xl p-6 text-center"><Bell className="mx-auto text-emerald-400 mb-2" size={32} /><div className="text-3xl font-bold text-white">{stats.subscribers}</div><div className="text-gray-400 text-sm">Subscribers</div></div>
            <div className="glass-card rounded-2xl p-6 text-center"><Users className="mx-auto text-cyan-400 mb-2" size={32} /><div className="text-3xl font-bold text-white">{stats.total_users}</div><div className="text-gray-400 text-sm">Total Users</div></div>
            <div className="glass-card rounded-2xl p-6 text-center"><DollarSign className="mx-auto text-green-400 mb-2" size={32} /><div className="text-3xl font-bold text-white">{stats.premium_users}</div><div className="text-gray-400 text-sm">Premium Users</div></div>
            <div className="glass-card rounded-2xl p-6 text-center"><Briefcase className="mx-auto text-orange-400 mb-2" size={32} /><div className="text-3xl font-bold text-white">{stats.pending_consulting}</div><div className="text-gray-400 text-sm">Pending Consulting</div></div>
            <div className="glass-card rounded-2xl p-6 text-center"><MessageSquare className="mx-auto text-pink-400 mb-2" size={32} /><div className="text-3xl font-bold text-white">{stats.unread_feedback}</div><div className="text-gray-400 text-sm">Unread Feedback</div></div>
          </div>
        )}

        {/* Articles Tab */}
        {!loading && activeTab === 'articles' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Articles ({articles.length})</h2>
              <button onClick={function() { openCreateModal('article'); }} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2" data-testid="add-article-btn"><Plus size={18} /> Add Article</button>
            </div>
            {articles.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-2xl"><FileText className="mx-auto text-gray-600 mb-4" size={48} /><p className="text-gray-500 text-lg mb-4">No articles in database</p><p className="text-gray-600 text-sm">Using mock data. Add articles to use MongoDB.</p></div>
            ) : (
              <div className="space-y-4">
                {articles.map(function(article) {
                  return (
                    <div key={article.id} className="glass-card rounded-2xl p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white">{article.title}</h3>
                            {article.premium && <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400">Premium</span>}
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400">{article.category}</span>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{article.excerpt}</p>
                          <div className="text-xs text-gray-500">{new Date(article.published_at).toLocaleDateString()} • {article.read_time}</div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button onClick={function() { openEditModal('article', article); }} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"><Edit2 size={16} /></button>
                          <button onClick={function() { handleDelete('article', article.id); }} className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Airdrops Tab */}
        {!loading && activeTab === 'airdrops' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Airdrops ({airdrops.length})</h2>
              <button onClick={function() { openCreateModal('airdrop'); }} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2" data-testid="add-airdrop-btn"><Plus size={18} /> Add Airdrop</button>
            </div>
            {airdrops.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-2xl"><Gift className="mx-auto text-gray-600 mb-4" size={48} /><p className="text-gray-500 text-lg mb-4">No airdrops in database</p></div>
            ) : (
              <div className="space-y-4">
                {airdrops.map(function(airdrop) {
                  return (
                    <div key={airdrop.id} className="glass-card rounded-2xl p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white">{airdrop.project_name}</h3>
                            <span className={'px-2 py-1 rounded-full text-xs font-bold border ' + getStatusColor(airdrop.status)}>{airdrop.status}</span>
                            {airdrop.chain && <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400">{airdrop.chain}</span>}
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{airdrop.description}</p>
                          <div className="flex gap-4 text-xs text-gray-500"><span>Reward: {airdrop.estimated_reward}</span><span>Deadline: {new Date(airdrop.deadline).toLocaleDateString()}</span></div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button onClick={function() { openEditModal('airdrop', airdrop); }} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"><Edit2 size={16} /></button>
                          <button onClick={function() { handleDelete('airdrop', airdrop.id); }} className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Signals Tab */}
        {!loading && activeTab === 'signals' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Signals ({signals.length})</h2>
              <button onClick={function() { openCreateModal('signal'); }} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2" data-testid="add-signal-btn"><Plus size={18} /> Add Signal</button>
            </div>
            {signals.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-2xl"><Zap className="mx-auto text-gray-600 mb-4" size={48} /><p className="text-gray-500 text-lg mb-4">No signals in database</p></div>
            ) : (
              <div className="space-y-4">
                {signals.map(function(signal) {
                  return (
                    <div key={signal.id} className="glass-card rounded-2xl p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white">{signal.title}</h3>
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400">{signal.type}</span>
                          </div>
                          <p className="text-gray-400 text-sm">{signal.description}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button onClick={function() { openEditModal('signal', signal); }} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"><Edit2 size={16} /></button>
                          <button onClick={function() { handleDelete('signal', signal.id); }} className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Yields Tab */}
        {!loading && activeTab === 'yields' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Yield Stablecoins ({yields.length})</h2>
              <button onClick={function() { openCreateModal('yield'); }} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2" data-testid="add-yield-btn"><Plus size={18} /> Add Yield</button>
            </div>
            {yields.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-2xl"><Coins className="mx-auto text-gray-600 mb-4" size={48} /><p className="text-gray-500 text-lg mb-4">No yield protocols in database</p><p className="text-gray-600 text-sm">Add yield protocols to display in Portfolio page.</p></div>
            ) : (
              <div className="space-y-4">
                {yields.map(function(y) {
                  return (
                    <div key={y.id} className="glass-card rounded-2xl p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white">{y.name}</h3>
                            <span className="text-2xl font-black text-emerald-400">{y.apy}</span>
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-400">{y.chain}</span>
                            <span className={'px-2 py-1 rounded-full text-xs font-bold ' + getRiskColor(y.risk_level)}>{y.risk_level} risk</span>
                          </div>
                          <p className="text-gray-400 text-sm">{y.description}</p>
                          {y.link && <a href={y.link} target="_blank" rel="noopener noreferrer" className="text-emerald-400 text-xs hover:underline">{y.link}</a>}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button onClick={function() { openEditModal('yield', y); }} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"><Edit2 size={16} /></button>
                          <button onClick={function() { handleDelete('yield', y.id); }} className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Staking Tab */}
        {!loading && activeTab === 'staking' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Staking Options ({staking.length})</h2>
              <button onClick={function() { openCreateModal('staking'); }} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2" data-testid="add-staking-btn"><Plus size={18} /> Add Staking</button>
            </div>
            {staking.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-2xl"><PiggyBank className="mx-auto text-gray-600 mb-4" size={48} /><p className="text-gray-500 text-lg mb-4">No staking options in database</p><p className="text-gray-600 text-sm">Add staking options to display in Portfolio page.</p></div>
            ) : (
              <div className="space-y-4">
                {staking.map(function(s) {
                  return (
                    <div key={s.id} className="glass-card rounded-2xl p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white">{s.token} ({s.symbol})</h3>
                            <span className="text-xl font-black text-emerald-400">{s.apy}</span>
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400">{s.platform}</span>
                          </div>
                          {s.link && <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-emerald-400 text-xs hover:underline">{s.link}</a>}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button onClick={function() { openEditModal('staking', s); }} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"><Edit2 size={16} /></button>
                          <button onClick={function() { handleDelete('staking', s.id); }} className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Portfolio Tab */}
        {!loading && activeTab === 'portfolio' && (
          <div className="space-y-8">
            {/* Portfolio Settings */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><BarChart3 className="text-emerald-500" /> Portfolio Settings</h2>
                <button onClick={function() { openCreateModal('settings'); }} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><Edit2 size={16} /> Edit Settings</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4"><div className="text-gray-400 text-sm">Total Value</div><div className="text-2xl font-bold text-white">${(portfolio.settings?.total_value || 50000).toLocaleString()}</div></div>
                <div className="bg-gray-800/50 rounded-lg p-4"><div className="text-gray-400 text-sm">Monthly Return</div><div className="text-2xl font-bold text-emerald-400">+{portfolio.settings?.monthly_return || 0}%</div></div>
                <div className="bg-gray-800/50 rounded-lg p-4 col-span-2"><div className="text-gray-400 text-sm">Current Strategy</div><div className="text-white">{portfolio.settings?.strategy_current || 'Not set'}</div></div>
              </div>
            </div>

            {/* Holdings */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Wallet className="text-emerald-500" /> Holdings ({portfolio.holdings?.length || 0})</h2>
                <button onClick={function() { openCreateModal('holding'); }} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><Plus size={18} /> Add Holding</button>
              </div>
              {(!portfolio.holdings || portfolio.holdings.length === 0) ? (
                <p className="text-gray-500 text-center py-8">No holdings in database. Using default mock data in frontend.</p>
              ) : (
                <div className="space-y-3">
                  {portfolio.holdings.map(function(h) {
                    return (
                      <div key={h.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full" style={{ backgroundColor: h.color }}></div>
                          <div><div className="text-white font-bold">{h.name}</div><div className="text-gray-500 text-sm">{h.symbol}</div></div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-white font-bold text-lg">{h.allocation}%</span>
                          <button onClick={function() { openEditModal('holding', h); }} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"><Edit2 size={14} /></button>
                          <button onClick={function() { handleDelete('holding', h.id); }} className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2 rounded-lg"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Trades */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><TrendingUp className="text-emerald-500" /> Recent Trades ({portfolio.trades?.length || 0})</h2>
                <button onClick={function() { openCreateModal('trade'); }} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><Plus size={18} /> Add Trade</button>
              </div>
              {(!portfolio.trades || portfolio.trades.length === 0) ? (
                <p className="text-gray-500 text-center py-8">No trades in database. Using default mock data in frontend.</p>
              ) : (
                <div className="space-y-3">
                  {portfolio.trades.map(function(t) {
                    return (
                      <div key={t.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className={'w-8 h-8 rounded-full flex items-center justify-center ' + (t.type === 'buy' ? 'bg-emerald-500/20' : 'bg-red-500/20')}>
                            {t.type === 'buy' ? <TrendingUp size={16} className="text-emerald-400" /> : <TrendingDown size={16} className="text-red-400" />}
                          </div>
                          <div><div className="text-white font-bold">{t.type.toUpperCase()} {t.asset}</div><div className="text-gray-500 text-xs">{t.reason}</div></div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right"><div className="text-white font-bold">{t.amount}</div><div className="text-gray-500 text-xs">{t.date}</div></div>
                          <button onClick={function() { handleDelete('trade', t.id); }} className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2 rounded-lg"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {!loading && activeTab === 'users' && (
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-20"><p className="text-gray-500 text-lg">No premium users yet</p></div>
            ) : users.map(function(user, index) {
              return (
                <div key={index} className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="text-emerald-500" size={24} />
                    <div><h3 className="text-lg font-bold text-white">{user.email}</h3></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div><div className="text-gray-500 mb-1">Status</div><span className="inline-block px-3 py-1 rounded-full text-xs font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Active Premium</span></div>
                    <div><div className="text-gray-500 mb-1">Premium Until</div><div className="text-white">{user.premium_until ? new Date(user.premium_until).toLocaleDateString() : 'N/A'}</div></div>
                    <div><div className="text-gray-500 mb-1">Joined</div><div className="text-white">{new Date(user.created_at).toLocaleDateString()}</div></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Feedback Tab */}
        {!loading && activeTab === 'feedback' && (
          <div className="space-y-4" data-testid="feedback-list">
            {feedback.length === 0 ? (
              <div className="text-center py-20"><MessageSquare className="mx-auto text-gray-600 mb-4" size={48} /><p className="text-gray-500 text-lg">No feedback received yet</p></div>
            ) : feedback.map(function(item) {
              return (
                <div key={item.id} className={'glass-card rounded-2xl p-6 border ' + (item.read ? 'border-gray-700/50 opacity-70' : 'border-emerald-500/30')}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <MessageSquare className={item.read ? 'text-gray-400' : 'text-emerald-500'} size={20} />
                        <div><h3 className="text-lg font-bold text-white">{item.name}</h3><div className="flex items-center gap-2 text-sm text-gray-400"><Mail size={14} />{item.email}</div></div>
                        {!item.read && <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">New</span>}
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4 mb-3"><p className="text-gray-300">{item.message}</p></div>
                      <div className="text-xs text-gray-500">Received: {new Date(item.created_at).toLocaleString()}</div>
                    </div>
                    {!item.read && (<button onClick={function() { markFeedbackRead(item.id); }} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg text-sm ml-4">Mark Read</button>)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Subscribers Tab */}
        {!loading && activeTab === 'subscribers' && (
          <div className="space-y-4" data-testid="subscribers-list">
            {subscribers.length === 0 ? (
              <div className="text-center py-20"><Bell className="mx-auto text-gray-600 mb-4" size={48} /><p className="text-gray-500 text-lg">No subscribers yet</p></div>
            ) : (
              <div>
                <div className="glass-card rounded-2xl p-6 mb-4"><h3 className="text-lg font-bold text-white mb-2">Total Subscribers: {subscribers.length}</h3><p className="text-gray-400 text-sm">Users subscribed to newsletter and alerts</p></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subscribers.map(function(sub) {
                    return (
                      <div key={sub.id} className="glass-card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center"><Mail className="text-emerald-400" size={18} /></div>
                          <div><div className="text-white font-medium">{sub.email}</div><div className="text-xs text-gray-500">Since {new Date(sub.subscribed_at).toLocaleDateString()}</div></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal for Create/Edit */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">{editingItem ? 'Edit' : 'Create'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}</h2>
                <button onClick={function() { setShowModal(false); }} className="text-gray-400 hover:text-white"><X size={24} /></button>
              </div>
              
              {modalType === 'article' && (
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Title *</label><input type="text" value={formData.title || ''} onChange={function(e) { setFormData({...formData, title: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Excerpt *</label><textarea value={formData.excerpt || ''} onChange={function(e) { setFormData({...formData, excerpt: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-20" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Content * (Markdown)</label><textarea value={formData.content || ''} onChange={function(e) { setFormData({...formData, content: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-40 font-mono text-sm" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Category</label><select value={formData.category || 'Mercado'} onChange={function(e) { setFormData({...formData, category: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"><option>Mercado</option><option>DeFi</option><option>Tecnología</option><option>Stablecoins</option><option>AI</option><option>Tutoriales</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Read Time</label><input type="text" value={formData.read_time || ''} onChange={function(e) { setFormData({...formData, read_time: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="5 min" /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Image URL</label><input type="text" value={formData.image_url || ''} onChange={function(e) { setFormData({...formData, image_url: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Tags (comma separated)</label><input type="text" value={formData.tags || ''} onChange={function(e) { setFormData({...formData, tags: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                  <div className="flex items-center gap-2"><input type="checkbox" checked={formData.premium || false} onChange={function(e) { setFormData({...formData, premium: e.target.checked}); }} className="rounded bg-gray-800 border-gray-700" /><label className="text-sm text-gray-400">Premium content</label></div>
                </div>
              )}
              
              {modalType === 'airdrop' && (
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Project Name *</label><input type="text" value={formData.project_name || ''} onChange={function(e) { setFormData({...formData, project_name: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Description *</label><textarea value={formData.description || ''} onChange={function(e) { setFormData({...formData, description: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-20" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Chain</label><input type="text" value={formData.chain || ''} onChange={function(e) { setFormData({...formData, chain: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Status</label><select value={formData.status || 'active'} onChange={function(e) { setFormData({...formData, status: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"><option value="active">Active</option><option value="upcoming">Upcoming</option><option value="expired">Expired</option></select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Estimated Reward</label><input type="text" value={formData.estimated_reward || ''} onChange={function(e) { setFormData({...formData, estimated_reward: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Deadline *</label><input type="date" value={formData.deadline ? formData.deadline.split('T')[0] : ''} onChange={function(e) { setFormData({...formData, deadline: e.target.value + 'T23:59:59Z'}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Link</label><input type="text" value={formData.link || ''} onChange={function(e) { setFormData({...formData, link: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Tasks (one per line)</label><textarea value={formData.tasks || ''} onChange={function(e) { setFormData({...formData, tasks: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-24 font-mono text-sm" /></div>
                  <div className="flex items-center gap-2"><input type="checkbox" checked={formData.premium || false} onChange={function(e) { setFormData({...formData, premium: e.target.checked}); }} className="rounded bg-gray-800 border-gray-700" /><label className="text-sm text-gray-400">Premium airdrop</label></div>
                </div>
              )}
              
              {modalType === 'signal' && (
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Title *</label><input type="text" value={formData.title || ''} onChange={function(e) { setFormData({...formData, title: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Description *</label><textarea value={formData.description || ''} onChange={function(e) { setFormData({...formData, description: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-24" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Type</label><select value={formData.type || 'opportunity'} onChange={function(e) { setFormData({...formData, type: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"><option value="opportunity">Opportunity</option><option value="alert">Alert</option><option value="news">News</option><option value="community">Community</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Priority</label><select value={formData.priority || 'medium'} onChange={function(e) { setFormData({...formData, priority: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"><option value="urgent">Urgent</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Action</label><input type="text" value={formData.action || ''} onChange={function(e) { setFormData({...formData, action: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Link</label><input type="text" value={formData.link || ''} onChange={function(e) { setFormData({...formData, link: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                  <div className="flex items-center gap-2"><input type="checkbox" checked={formData.premium || false} onChange={function(e) { setFormData({...formData, premium: e.target.checked}); }} className="rounded bg-gray-800 border-gray-700" /><label className="text-sm text-gray-400">Premium signal</label></div>
                </div>
              )}
              
              {modalType === 'yield' && (
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Protocol Name *</label><input type="text" value={formData.name || ''} onChange={function(e) { setFormData({...formData, name: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="Based.one HLP" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">APY *</label><input type="text" value={formData.apy || ''} onChange={function(e) { setFormData({...formData, apy: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="139%" /></div>
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Chain *</label><input type="text" value={formData.chain || ''} onChange={function(e) { setFormData({...formData, chain: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="Hyperliquid L1" /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Description</label><textarea value={formData.description || ''} onChange={function(e) { setFormData({...formData, description: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-20" placeholder="Market making en perpetuos + liquidaciones" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Risk Level</label><select value={formData.risk_level || 'medium'} onChange={function(e) { setFormData({...formData, risk_level: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Link</label><input type="text" value={formData.link || ''} onChange={function(e) { setFormData({...formData, link: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="https://app.based.one/vaults" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Logo URL (optional)</label><input type="text" value={formData.logo_url || ''} onChange={function(e) { setFormData({...formData, logo_url: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                </div>
              )}
              
              {modalType === 'staking' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Token Name *</label><input type="text" value={formData.token || ''} onChange={function(e) { setFormData({...formData, token: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="Solana" /></div>
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Symbol *</label><input type="text" value={formData.symbol || ''} onChange={function(e) { setFormData({...formData, symbol: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="SOL" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">APY *</label><input type="text" value={formData.apy || ''} onChange={function(e) { setFormData({...formData, apy: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="7-8%" /></div>
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Platform *</label><input type="text" value={formData.platform || ''} onChange={function(e) { setFormData({...formData, platform: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="Jupiter" /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Link</label><input type="text" value={formData.link || ''} onChange={function(e) { setFormData({...formData, link: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="https://www.jup.ag" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Logo URL (optional)</label><input type="text" value={formData.logo_url || ''} onChange={function(e) { setFormData({...formData, logo_url: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                </div>
              )}
              
              {modalType === 'holding' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Asset Name *</label><input type="text" value={formData.name || ''} onChange={function(e) { setFormData({...formData, name: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="Bitcoin" /></div>
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Symbol *</label><input type="text" value={formData.symbol || ''} onChange={function(e) { setFormData({...formData, symbol: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="BTC" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Allocation % *</label><input type="number" min="0" max="100" value={formData.allocation || ''} onChange={function(e) { setFormData({...formData, allocation: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="35" /></div>
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Color</label><input type="color" value={formData.color || '#10b981'} onChange={function(e) { setFormData({...formData, color: e.target.value}); }} className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg" /></div>
                  </div>
                </div>
              )}
              
              {modalType === 'trade' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Type *</label><select value={formData.type || 'buy'} onChange={function(e) { setFormData({...formData, type: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"><option value="buy">Buy</option><option value="sell">Sell</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Asset *</label><input type="text" value={formData.asset || ''} onChange={function(e) { setFormData({...formData, asset: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="BTC" /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Amount *</label><input type="text" value={formData.amount || ''} onChange={function(e) { setFormData({...formData, amount: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="$2,500" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Reason</label><input type="text" value={formData.reason || ''} onChange={function(e) { setFormData({...formData, reason: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="DCA" /></div>
                </div>
              )}
              
              {modalType === 'settings' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Total Value ($)</label><input type="number" value={formData.total_value || ''} onChange={function(e) { setFormData({...formData, total_value: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="50000" /></div>
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Monthly Return (%)</label><input type="number" step="0.1" value={formData.monthly_return || ''} onChange={function(e) { setFormData({...formData, monthly_return: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="12" /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Current Strategy</label><textarea value={formData.strategy_current || ''} onChange={function(e) { setFormData({...formData, strategy_current: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-20" placeholder="DCA semanal en BTC y ETH..." /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Next Moves</label><textarea value={formData.strategy_next || ''} onChange={function(e) { setFormData({...formData, strategy_next: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-20" placeholder="Monitorear soporte en $65K BTC..." /></div>
                </div>
              )}
              
              <div className="flex gap-3 mt-6">
                <button onClick={function() { setShowModal(false); }} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg">Cancel</button>
                <button onClick={handleSubmit} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2" data-testid="save-btn"><Save size={18} /> Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
