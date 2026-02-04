import { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, X, Clock, Users, DollarSign, ChevronRight, MessageSquare, Mail, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminPage() {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const { data } = await axios.get(`${API}/admin/users`);
        setUsers(data);
      } else if (activeTab === 'feedback') {
        const { data } = await axios.get(`${API}/admin/feedback`);
        setFeedback(data);
      } else {
        const { data } = await axios.get(`${API}/admin/payments?status=${activeTab}`);
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentId) => {
    try {
      await axios.post(`${API}/admin/payments/${paymentId}/verify`);
      toast.success('Payment verified and premium activated!');
      fetchData();
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment');
    }
  };

  const markFeedbackRead = async (feedbackId) => {
    try {
      await axios.post(`${API}/admin/feedback/${feedbackId}/read`);
      toast.success('Feedback marked as read');
      fetchData();
    } catch (error) {
      console.error('Error marking feedback:', error);
      toast.error('Failed to update feedback');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-4 transition-colors"
          >
            <ChevronRight size={16} className="rotate-180" />
            Back to Home
          </Link>
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-3"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            data-testid="admin-page-heading"
          >
            Admin Dashboard
          </h1>
          <p className="text-gray-400 text-lg">Manage payments, users, and feedback</p>
        </div>

        <div className="flex gap-2 mb-8 border-b border-gray-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'pending'
                ? 'text-emerald-400 border-b-2 border-emerald-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="inline-block mr-2" size={18} />
            Pending Payments
          </button>
          <button
            onClick={() => setActiveTab('verified')}
            className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'verified'
                ? 'text-emerald-400 border-b-2 border-emerald-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Check className="inline-block mr-2" size={18} />
            Verified
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'text-emerald-400 border-b-2 border-emerald-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="inline-block mr-2" size={18} />
            Premium Users
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'feedback'
                ? 'text-emerald-400 border-b-2 border-emerald-500'
                : 'text-gray-400 hover:text-white'
            }`}
            data-testid="feedback-tab"
          >
            <MessageSquare className="inline-block mr-2" size={18} />
            Feedback
          </button>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4" />
            <div className="text-emerald-500 text-xl font-semibold">Loading...</div>
          </div>
        )}

        {/* Payments Tab */}
        {!loading && (activeTab === 'pending' || activeTab === 'verified') && (
          <div className="space-y-4">
            {payments.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No {activeTab} payments</p>
              </div>
            ) : (
              payments.map((payment) => (
                <div
                  key={payment.id}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-6 transition-all duration-300 hover:border-emerald-500/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <DollarSign className="text-emerald-500" size={24} />
                        <div>
                          <h3 className="text-lg font-bold text-white">{payment.user_email}</h3>
                          <p className="text-sm text-gray-400">{payment.wallet_address?.substring(0, 20)}...</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500 mb-1">Amount</div>
                          <div className="text-white font-bold">${payment.amount} USDC</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Chain</div>
                          <div className="text-white font-medium">{payment.chain}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Date</div>
                          <div className="text-white font-medium">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Status</div>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                      </div>

                      {payment.tx_hash && (
                        <div className="mt-3">
                          <div className="text-xs text-gray-500 mb-1">Transaction Hash:</div>
                          <code className="text-xs text-emerald-400 break-all">{payment.tx_hash}</code>
                        </div>
                      )}
                    </div>

                    {payment.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => verifyPayment(payment.id)}
                          data-testid={`verify-${payment.id}`}
                          className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-lg transition-all hover:scale-105"
                        >
                          <Check size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Users Tab */}
        {!loading && activeTab === 'users' && (
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No premium users yet</p>
              </div>
            ) : (
              users.map((user, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-6 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Users className="text-emerald-500" size={24} />
                        <div>
                          <h3 className="text-lg font-bold text-white">{user.email}</h3>
                          <p className="text-sm text-gray-400">{user.wallet_address?.substring(0, 30)}...</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500 mb-1">Status</div>
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                            Active Premium
                          </span>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Premium Until</div>
                          <div className="text-white font-medium">
                            {user.premium_until ? new Date(user.premium_until).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Joined</div>
                          <div className="text-white font-medium">
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Feedback Tab */}
        {!loading && activeTab === 'feedback' && (
          <div className="space-y-4" data-testid="feedback-list">
            {feedback.length === 0 ? (
              <div className="text-center py-20">
                <MessageSquare className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-500 text-lg">No feedback received yet</p>
                <p className="text-gray-600 text-sm mt-2">Feedback submitted by users will appear here</p>
              </div>
            ) : (
              feedback.map((item) => (
                <div
                  key={item.id}
                  data-testid={`feedback-${item.id}`}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border p-6 transition-all duration-300 ${
                    item.read ? 'border-gray-700/50 opacity-70' : 'border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${item.read ? 'bg-gray-700/50' : 'bg-emerald-500/20'}`}>
                          <MessageSquare className={item.read ? 'text-gray-400' : 'text-emerald-500'} size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{item.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Mail size={14} />
                            {item.email}
                          </div>
                        </div>
                        {!item.read && (
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            New
                          </span>
                        )}
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-lg p-4 mb-3">
                        <p className="text-gray-300 leading-relaxed">{item.message}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Received: {new Date(item.created_at).toLocaleString()}
                        </div>
                        {item.read && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <CheckCircle size={14} /> Read
                          </span>
                        )}
                      </div>
                    </div>

                    {!item.read && (
                      <div className="ml-4">
                        <button
                          onClick={() => markFeedbackRead(item.id)}
                          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all text-sm"
                        >
                          Mark Read
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
