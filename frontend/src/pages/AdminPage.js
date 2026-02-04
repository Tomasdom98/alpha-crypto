import { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, Clock, Users, DollarSign, ChevronRight, MessageSquare, Mail, CheckCircle, Briefcase, Bell } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(function() {
    fetchData();
  }, [activeTab]);

  function fetchData() {
    setLoading(true);
    
    if (activeTab === 'users') {
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
    } else {
      axios.get(API + '/admin/payments?status=' + activeTab)
        .then(function(res) { setPayments(res.data); })
        .catch(function() { toast.error('Failed to load payments'); })
        .finally(function() { setLoading(false); });
    }
  }

  function verifyPayment(paymentId) {
    axios.post(API + '/admin/payments/' + paymentId + '/verify')
      .then(function() {
        toast.success('Payment verified!');
        fetchData();
      })
      .catch(function() { toast.error('Failed to verify'); });
  }

  function markFeedbackRead(feedbackId) {
    axios.post(API + '/admin/feedback/' + feedbackId + '/read')
      .then(function() {
        toast.success('Marked as read');
        fetchData();
      })
      .catch(function() { toast.error('Failed to update'); });
  }

  function updateConsultingStatus(requestId, status) {
    axios.post(API + '/admin/consulting/' + requestId + '/status?status=' + status)
      .then(function() {
        toast.success('Status updated to ' + status);
        fetchData();
      })
      .catch(function() { toast.error('Failed to update'); });
  }

  function getStatusColor(status) {
    if (status === 'verified' || status === 'completed') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (status === 'rejected') return 'bg-red-500/10 text-red-400 border-red-500/30';
    if (status === 'contacted') return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-4 transition-colors">
            <ChevronRight size={16} className="rotate-180" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" data-testid="admin-page-heading">Admin Dashboard</h1>
          <p className="text-gray-400 text-lg">Manage payments, users, feedback, consulting, and subscribers</p>
        </div>

        <div className="flex gap-2 mb-8 border-b border-gray-800 overflow-x-auto">
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

        {!loading && activeTab === 'subscribers' && (
          <div className="space-y-4" data-testid="subscribers-list">
            {subscribers.length === 0 ? (
              <div className="text-center py-20"><Bell className="mx-auto text-gray-600 mb-4" size={48} /><p className="text-gray-500 text-lg">No subscribers yet</p></div>
            ) : (
              <div>
                <div className="glass-card rounded-2xl p-6 mb-4">
                  <h3 className="text-lg font-bold text-white mb-2">Total Subscribers: {subscribers.length}</h3>
                  <p className="text-gray-400 text-sm">Users subscribed to premium airdrop alerts</p>
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
      </div>
    </div>
  );
}

export default AdminPage;
