import { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, Clock, Users, DollarSign, ChevronRight, MessageSquare, Mail, Briefcase, Bell, FileText, Gift, Zap, Plus, Edit2, Trash2, Save, X, BarChart3 } from 'lucide-react';
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(function() {
    fetchData();
  }, [activeTab]);

  function fetchData() {
    setLoading(true);
    
    if (activeTab === 'stats') {
      axios.get(API + '/admin/stats')
        .then(function(res) { setStats(res.data); })
        .catch(function() { toast.error('Failed to load stats'); })
        .finally(function() { setLoading(false); });
    } else if (activeTab === 'users') {
      axios.get(API + '/admin/users')
        .then(function(res) { setUsers(res.data); })
        .catch(function() { toast.error('Failed to load users'); })
        .finally(function() { setLoading(false); });
    } else if (activeTab === 'feedback') {
      axios.get(API + '/admin/feedback')
        .then(function(res) { setFeedback(res.data); })
        .catch(function() { toast.error('Failed to load feedback'); })
        .finally(function() { setLoading(false); });
    } else if (activeTab === 'consulting') {
      axios.get(API + '/admin/consulting')
        .then(function(res) { setConsulting(res.data); })
        .catch(function() { toast.error('Failed to load consulting'); })
        .finally(function() { setLoading(false); });
    } else if (activeTab === 'subscribers') {
      axios.get(API + '/admin/alert-subscribers')
        .then(function(res) { setSubscribers(res.data); })
        .catch(function() { toast.error('Failed to load subscribers'); })
        .finally(function() { setLoading(false); });
    } else if (activeTab === 'articles') {
      axios.get(API + '/admin/articles')
        .then(function(res) { setArticles(res.data); })
        .catch(function() { toast.error('Failed to load articles'); })
        .finally(function() { setLoading(false); });
    } else if (activeTab === 'airdrops') {
      axios.get(API + '/admin/airdrops')
        .then(function(res) { setAirdrops(res.data); })
        .catch(function() { toast.error('Failed to load airdrops'); })
        .finally(function() { setLoading(false); });
    } else if (activeTab === 'signals') {
      axios.get(API + '/admin/signals')
        .then(function(res) { setSignals(res.data); })
        .catch(function() { toast.error('Failed to load signals'); })
        .finally(function() { setLoading(false); });
    } else if (activeTab === 'pending' || activeTab === 'verified') {
      axios.get(API + '/admin/payments?status=' + activeTab)
        .then(function(res) { setPayments(res.data); })
        .catch(function() { toast.error('Failed to load payments'); })
        .finally(function() { setLoading(false); });
    }
  }

  function verifyPayment(paymentId) {
    axios.post(API + '/admin/payments/' + paymentId + '/verify')
      .then(function() { toast.success('Payment verified!'); fetchData(); })
      .catch(function() { toast.error('Failed to verify'); });
  }

  function markFeedbackRead(feedbackId) {
    axios.post(API + '/admin/feedback/' + feedbackId + '/read')
      .then(function() { toast.success('Marked as read'); fetchData(); })
      .catch(function() { toast.error('Failed to update'); });
  }

  function updateConsultingStatus(requestId, status) {
    axios.post(API + '/admin/consulting/' + requestId + '/status?status=' + status)
      .then(function() { toast.success('Status updated'); fetchData(); })
      .catch(function() { toast.error('Failed to update'); });
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
    }
    
    axios[method](endpoint, data)
      .then(function() {
        toast.success(editingItem ? 'Updated successfully!' : 'Created successfully!');
        setShowModal(false);
        fetchData();
      })
      .catch(function(err) {
        toast.error('Failed to save: ' + (err.response?.data?.detail || 'Unknown error'));
      });
  }

  function handleDelete(type, id) {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    let endpoint;
    if (type === 'article') endpoint = API + '/admin/articles/' + id;
    else if (type === 'airdrop') endpoint = API + '/admin/airdrops/' + id;
    else if (type === 'signal') endpoint = API + '/admin/signals/' + id;
    
    axios.delete(endpoint)
      .then(function() { toast.success('Deleted successfully!'); fetchData(); })
      .catch(function() { toast.error('Failed to delete'); });
  }

  function getStatusColor(status) {
    if (status === 'verified' || status === 'completed' || status === 'active') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (status === 'rejected' || status === 'expired') return 'bg-red-500/10 text-red-400 border-red-500/30';
    if (status === 'contacted') return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }

  function getPriorityColor(priority) {
    if (priority === 'urgent') return 'bg-red-500/20 text-red-400';
    if (priority === 'high') return 'bg-orange-500/20 text-orange-400';
    if (priority === 'medium') return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-gray-500/20 text-gray-400';
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
          <button onClick={function() { setActiveTab('pending'); }} className={'px-4 py-3 font-semibold transition-all whitespace-nowrap ' + (activeTab === 'pending' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white')}>
            <Clock className="inline-block mr-2" size={18} />Pending
          </button>
          <button onClick={function() { setActiveTab('verified'); }} className={'px-4 py-3 font-semibold transition-all whitespace-nowrap ' + (activeTab === 'verified' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white')}>
            <Check className="inline-block mr-2" size={18} />Verified
          </button>
          <button onClick={function() { setActiveTab('users'); }} className={'px-4 py-3 font-semibold transition-all whitespace-nowrap ' + (activeTab === 'users' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white')}>
            <Users className="inline-block mr-2" size={18} />Users
          </button>
          <button onClick={function() { setActiveTab('feedback'); }} className={'px-4 py-3 font-semibold transition-all whitespace-nowrap ' + (activeTab === 'feedback' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white')} data-testid="feedback-tab">
            <MessageSquare className="inline-block mr-2" size={18} />Feedback
          </button>
          <button onClick={function() { setActiveTab('consulting'); }} className={'px-4 py-3 font-semibold transition-all whitespace-nowrap ' + (activeTab === 'consulting' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white')} data-testid="consulting-tab">
            <Briefcase className="inline-block mr-2" size={18} />Consulting
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
            <div className="glass-card rounded-2xl p-6 text-center">
              <FileText className="mx-auto text-blue-400 mb-2" size={32} />
              <div className="text-3xl font-bold text-white">{stats.articles}</div>
              <div className="text-gray-400 text-sm">Articles</div>
            </div>
            <div className="glass-card rounded-2xl p-6 text-center">
              <Gift className="mx-auto text-purple-400 mb-2" size={32} />
              <div className="text-3xl font-bold text-white">{stats.airdrops}</div>
              <div className="text-gray-400 text-sm">Airdrops</div>
            </div>
            <div className="glass-card rounded-2xl p-6 text-center">
              <Zap className="mx-auto text-yellow-400 mb-2" size={32} />
              <div className="text-3xl font-bold text-white">{stats.signals}</div>
              <div className="text-gray-400 text-sm">Signals</div>
            </div>
            <div className="glass-card rounded-2xl p-6 text-center">
              <Bell className="mx-auto text-emerald-400 mb-2" size={32} />
              <div className="text-3xl font-bold text-white">{stats.subscribers}</div>
              <div className="text-gray-400 text-sm">Subscribers</div>
            </div>
            <div className="glass-card rounded-2xl p-6 text-center">
              <Users className="mx-auto text-cyan-400 mb-2" size={32} />
              <div className="text-3xl font-bold text-white">{stats.total_users}</div>
              <div className="text-gray-400 text-sm">Total Users</div>
            </div>
            <div className="glass-card rounded-2xl p-6 text-center">
              <DollarSign className="mx-auto text-green-400 mb-2" size={32} />
              <div className="text-3xl font-bold text-white">{stats.premium_users}</div>
              <div className="text-gray-400 text-sm">Premium Users</div>
            </div>
            <div className="glass-card rounded-2xl p-6 text-center">
              <Briefcase className="mx-auto text-orange-400 mb-2" size={32} />
              <div className="text-3xl font-bold text-white">{stats.pending_consulting}</div>
              <div className="text-gray-400 text-sm">Pending Consulting</div>
            </div>
            <div className="glass-card rounded-2xl p-6 text-center">
              <MessageSquare className="mx-auto text-pink-400 mb-2" size={32} />
              <div className="text-3xl font-bold text-white">{stats.unread_feedback}</div>
              <div className="text-gray-400 text-sm">Unread Feedback</div>
            </div>
          </div>
        )}

        {/* Articles Tab */}
        {!loading && activeTab === 'articles' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Articles ({articles.length})</h2>
              <button onClick={function() { openCreateModal('article'); }} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2" data-testid="add-article-btn">
                <Plus size={18} /> Add Article
              </button>
            </div>
            {articles.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-2xl">
                <FileText className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-500 text-lg mb-4">No articles in database</p>
                <p className="text-gray-600 text-sm">Using mock data. Add articles to use MongoDB.</p>
              </div>
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
              <button onClick={function() { openCreateModal('airdrop'); }} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2" data-testid="add-airdrop-btn">
                <Plus size={18} /> Add Airdrop
              </button>
            </div>
            {airdrops.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-2xl">
                <Gift className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-500 text-lg mb-4">No airdrops in database</p>
                <p className="text-gray-600 text-sm">Using mock data. Add airdrops to use MongoDB.</p>
              </div>
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
                            {airdrop.premium && <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400">Premium</span>}
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{airdrop.description}</p>
                          <div className="flex gap-4 text-xs text-gray-500">
                            <span>Reward: {airdrop.estimated_reward}</span>
                            <span>Deadline: {new Date(airdrop.deadline).toLocaleDateString()}</span>
                            <span>Tasks: {(airdrop.tasks || []).length}</span>
                          </div>
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
              <button onClick={function() { openCreateModal('signal'); }} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2" data-testid="add-signal-btn">
                <Plus size={18} /> Add Signal
              </button>
            </div>
            {signals.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-2xl">
                <Zap className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-500 text-lg mb-4">No signals in database</p>
                <p className="text-gray-600 text-sm">Using mock data. Add signals to use MongoDB.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {signals.map(function(signal) {
                  return (
                    <div key={signal.id} className="glass-card rounded-2xl p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white">{signal.title}</h3>
                            <span className={'px-2 py-1 rounded-full text-xs font-bold ' + getPriorityColor(signal.priority)}>{signal.priority}</span>
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400">{signal.type}</span>
                            {signal.premium && <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400">Premium</span>}
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{signal.description}</p>
                          {signal.action && <p className="text-emerald-400 text-sm">Action: {signal.action}</p>}
                          <div className="text-xs text-gray-500 mt-2">{new Date(signal.timestamp).toLocaleString()}</div>
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

        {/* Payments Tabs */}
        {!loading && (activeTab === 'pending' || activeTab === 'verified') && (
          <div className="space-y-4">
            {payments.length === 0 ? (
              <div className="text-center py-20"><p className="text-gray-500 text-lg">No {activeTab} payments</p></div>
            ) : payments.map(function(payment) {
              return (
                <div key={payment.id} className="glass-card rounded-2xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <DollarSign className="text-emerald-500" size={24} />
                        <div>
                          <h3 className="text-lg font-bold text-white">{payment.user_email}</h3>
                          <p className="text-sm text-gray-400">{payment.wallet_address ? payment.wallet_address.substring(0, 20) + '...' : ''}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><div className="text-gray-500 mb-1">Amount</div><div className="text-white font-bold">${payment.amount} USDC</div></div>
                        <div><div className="text-gray-500 mb-1">Chain</div><div className="text-white font-medium">{payment.chain}</div></div>
                        <div><div className="text-gray-500 mb-1">Date</div><div className="text-white font-medium">{new Date(payment.created_at).toLocaleDateString()}</div></div>
                        <div><div className="text-gray-500 mb-1">Status</div><span className={'inline-block px-3 py-1 rounded-full text-xs font-bold border ' + getStatusColor(payment.status)}>{payment.status}</span></div>
                      </div>
                    </div>
                    {payment.status === 'pending' && (
                      <button onClick={function() { verifyPayment(payment.id); }} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-lg ml-4"><Check size={18} /></button>
                    )}
                  </div>
                </div>
              );
            })}
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
                        <div>
                          <h3 className="text-lg font-bold text-white">{item.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-400"><Mail size={14} />{item.email}</div>
                        </div>
                        {!item.read && <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">New</span>}
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4 mb-3"><p className="text-gray-300">{item.message}</p></div>
                      <div className="text-xs text-gray-500">Received: {new Date(item.created_at).toLocaleString()}</div>
                    </div>
                    {!item.read && (
                      <button onClick={function() { markFeedbackRead(item.id); }} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg text-sm ml-4">Mark Read</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Consulting Tab */}
        {!loading && activeTab === 'consulting' && (
          <div className="space-y-4" data-testid="consulting-list">
            {consulting.length === 0 ? (
              <div className="text-center py-20"><Briefcase className="mx-auto text-gray-600 mb-4" size={48} /><p className="text-gray-500 text-lg">No consulting requests yet</p></div>
            ) : consulting.map(function(item) {
              return (
                <div key={item.id} className="glass-card rounded-2xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Briefcase className="text-emerald-500" size={20} />
                        <div>
                          <h3 className="text-lg font-bold text-white">{item.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-400"><Mail size={14} />{item.email}</div>
                        </div>
                        <span className={'px-2 py-1 rounded-full text-xs font-bold capitalize ' + getStatusColor(item.status)}>{item.status}</span>
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400">{item.service_type}</span>
                      </div>
                      {item.company && <div className="text-sm text-gray-400 mb-2">Company: {item.company}</div>}
                      <div className="bg-gray-800/50 rounded-lg p-4 mb-3"><p className="text-gray-300">{item.message}</p></div>
                      <div className="text-xs text-gray-500">Received: {new Date(item.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      {item.status === 'new' && <button onClick={function() { updateConsultingStatus(item.id, 'contacted'); }} className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded-lg text-sm">Contacted</button>}
                      {item.status === 'contacted' && <button onClick={function() { updateConsultingStatus(item.id, 'completed'); }} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-lg text-sm">Complete</button>}
                    </div>
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
                <div className="glass-card rounded-2xl p-6 mb-4">
                  <h3 className="text-lg font-bold text-white mb-2">Total Subscribers: {subscribers.length}</h3>
                  <p className="text-gray-400 text-sm">Users subscribed to newsletter and alerts</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subscribers.map(function(sub) {
                    return (
                      <div key={sub.id} className="glass-card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center"><Mail className="text-emerald-400" size={18} /></div>
                          <div>
                            <div className="text-white font-medium">{sub.email}</div>
                            <div className="text-xs text-gray-500">Since {new Date(sub.subscribed_at).toLocaleDateString()}</div>
                          </div>
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
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Content * (Markdown supported)</label><textarea value={formData.content || ''} onChange={function(e) { setFormData({...formData, content: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-40 font-mono text-sm" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Category</label><select value={formData.category || 'Mercado'} onChange={function(e) { setFormData({...formData, category: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"><option>Mercado</option><option>DeFi</option><option>Tecnología</option><option>Stablecoins</option><option>AI</option><option>Tutoriales</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Read Time</label><input type="text" value={formData.read_time || ''} onChange={function(e) { setFormData({...formData, read_time: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="5 min" /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Image URL</label><input type="text" value={formData.image_url || ''} onChange={function(e) { setFormData({...formData, image_url: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="https://..." /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Tags (comma separated)</label><input type="text" value={formData.tags || ''} onChange={function(e) { setFormData({...formData, tags: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="Bitcoin, DeFi, Analysis" /></div>
                  <div className="flex items-center gap-2"><input type="checkbox" checked={formData.premium || false} onChange={function(e) { setFormData({...formData, premium: e.target.checked}); }} className="rounded bg-gray-800 border-gray-700" /><label className="text-sm text-gray-400">Premium content</label></div>
                </div>
              )}
              
              {modalType === 'airdrop' && (
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Project Name *</label><input type="text" value={formData.project_name || ''} onChange={function(e) { setFormData({...formData, project_name: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Description *</label><textarea value={formData.description || ''} onChange={function(e) { setFormData({...formData, description: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-20" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Full Description</label><textarea value={formData.full_description || ''} onChange={function(e) { setFormData({...formData, full_description: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-24" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Chain</label><input type="text" value={formData.chain || ''} onChange={function(e) { setFormData({...formData, chain: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="Arbitrum, Solana, Base..." /></div>
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Status</label><select value={formData.status || 'active'} onChange={function(e) { setFormData({...formData, status: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"><option value="active">Active</option><option value="upcoming">Upcoming</option><option value="expired">Expired</option></select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Estimated Reward</label><input type="text" value={formData.estimated_reward || ''} onChange={function(e) { setFormData({...formData, estimated_reward: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="$1000-3000" /></div>
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Deadline *</label><input type="date" value={formData.deadline ? formData.deadline.split('T')[0] : ''} onChange={function(e) { setFormData({...formData, deadline: e.target.value + 'T23:59:59Z'}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Backing</label><input type="text" value={formData.backing || ''} onChange={function(e) { setFormData({...formData, backing: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="Paradigm, a16z - $10M raised" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Timeline</label><input type="text" value={formData.timeline || ''} onChange={function(e) { setFormData({...formData, timeline: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="TGE Q2 2026" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Reward Note</label><input type="text" value={formData.reward_note || ''} onChange={function(e) { setFormData({...formData, reward_note: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="Points system based on volume" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Link</label><input type="text" value={formData.link || ''} onChange={function(e) { setFormData({...formData, link: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="https://..." /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Logo URL</label><input type="text" value={formData.logo_url || ''} onChange={function(e) { setFormData({...formData, logo_url: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="https://... (auto-generated if empty)" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Tasks (one per line)</label><textarea value={formData.tasks || ''} onChange={function(e) { setFormData({...formData, tasks: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-24 font-mono text-sm" placeholder="Create account and complete KYC&#10;Deposit funds&#10;Make trades" /></div>
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
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Action</label><input type="text" value={formData.action || ''} onChange={function(e) { setFormData({...formData, action: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="What should user do?" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Link</label><input type="text" value={formData.link || ''} onChange={function(e) { setFormData({...formData, link: e.target.value}); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="https://..." /></div>
                  <div className="flex items-center gap-2"><input type="checkbox" checked={formData.premium || false} onChange={function(e) { setFormData({...formData, premium: e.target.checked}); }} className="rounded bg-gray-800 border-gray-700" /><label className="text-sm text-gray-400">Premium signal</label></div>
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
