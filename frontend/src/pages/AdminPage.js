import { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, X, Clock, Users, DollarSign, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminPage() {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, verified, users

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const { data } = await axios.get(`${API}/admin/users`);
        setUsers(data);
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
    <div className=\"min-h-screen py-12\">\n      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">\n        {/* Header */}
        <div className=\"mb-8\">\n          <Link
            to=\"/\"
            className=\"inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-4 transition-colors\"
          >\n            <ChevronRight size={16} className=\"rotate-180\" />
            Back to Home
          </Link>
          <h1
            className=\"text-4xl md:text-5xl font-bold text-white mb-3\"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            data-testid=\"admin-page-heading\"
          >\n            Admin Dashboard
          </h1>
          <p className=\"text-gray-400 text-lg\">Manage payments and premium memberships</p>
        </div>

        {/* Tabs */}
        <div className=\"flex gap-2 mb-8 border-b border-gray-800\">\n          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'pending'
                ? 'text-emerald-400 border-b-2 border-emerald-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >\n            <Clock className=\"inline-block mr-2\" size={18} />
            Pending Payments
          </button>
          <button
            onClick={() => setActiveTab('verified')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'verified'
                ? 'text-emerald-400 border-b-2 border-emerald-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >\n            <Check className=\"inline-block mr-2\" size={18} />
            Verified
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'users'
                ? 'text-emerald-400 border-b-2 border-emerald-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >\n            <Users className=\"inline-block mr-2\" size={18} />
            Premium Users
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className=\"text-center py-20\">\n            <div className=\"inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4\" />
            <div className=\"text-emerald-500 text-xl font-semibold\">Loading...</div>
          </div>
        )}

        {/* Payments List */}
        {!loading && (activeTab === 'pending' || activeTab === 'verified') && (
          <div className=\"space-y-4\">\n            {payments.length === 0 ? (
              <div className=\"text-center py-20\">\n                <p className=\"text-gray-500 text-lg\">No {activeTab} payments</p>
              </div>
            ) : (
              payments.map((payment) => (
                <div
                  key={payment.id}
                  className=\"group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-6 transition-all duration-300 hover:border-emerald-500/50\"
                >\n                  <div className=\"flex items-start justify-between\">\n                    <div className=\"flex-1\">\n                      <div className=\"flex items-center gap-3 mb-3\">\n                        <DollarSign className=\"text-emerald-500\" size={24} />
                        <div>\n                          <h3 className=\"text-lg font-bold text-white\">{payment.user_email}</h3>
                          <p className=\"text-sm text-gray-400\">{payment.wallet_address?.substring(0, 20)}...</p>
                        </div>
                      </div>
                      
                      <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4 text-sm\">\n                        <div>\n                          <div className=\"text-gray-500 mb-1\">Amount</div>
                          <div className=\"text-white font-bold\">${payment.amount} USDC</div>
                        </div>
                        <div>\n                          <div className=\"text-gray-500 mb-1\">Chain</div>
                          <div className=\"text-white font-medium\">{payment.chain}</div>
                        </div>
                        <div>\n                          <div className=\"text-gray-500 mb-1\">Date</div>
                          <div className=\"text-white font-medium\">\n                            {new Date(payment.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div>\n                          <div className=\"text-gray-500 mb-1\">Status</div>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(payment.status)}`}>\n                            {payment.status}
                          </span>
                        </div>
                      </div>

                      {payment.tx_hash && (
                        <div className=\"mt-3\">\n                          <div className=\"text-xs text-gray-500 mb-1\">Transaction Hash:</div>
                          <code className=\"text-xs text-emerald-400 break-all\">{payment.tx_hash}</code>
                        </div>
                      )}
                    </div>

                    {payment.status === 'pending' && (
                      <div className=\"flex gap-2 ml-4\">\n                        <button
                          onClick={() => verifyPayment(payment.id)}
                          data-testid={`verify-${payment.id}`}
                          className=\"bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-lg transition-all hover:scale-105\"
                        >\n                          <Check size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Users List */}
        {!loading && activeTab === 'users' && (
          <div className=\"space-y-4\">\n            {users.length === 0 ? (
              <div className=\"text-center py-20\">\n                <p className=\"text-gray-500 text-lg\">No premium users yet</p>
              </div>
            ) : (
              users.map((user, index) => (
                <div
                  key={index}
                  className=\"group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-6 transition-all duration-300\"
                >\n                  <div className=\"flex items-start justify-between\">\n                    <div className=\"flex-1\">\n                      <div className=\"flex items-center gap-3 mb-3\">\n                        <Users className=\"text-emerald-500\" size={24} />
                        <div>\n                          <h3 className=\"text-lg font-bold text-white\">{user.email}</h3>
                          <p className=\"text-sm text-gray-400\">{user.wallet_address?.substring(0, 30)}...</p>
                        </div>
                      </div>
                      
                      <div className=\"grid grid-cols-2 md:grid-cols-3 gap-4 text-sm\">\n                        <div>\n                          <div className=\"text-gray-500 mb-1\">Status</div>
                          <span className=\"inline-block px-3 py-1 rounded-full text-xs font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/30\">\n                            Active Premium
                          </span>
                        </div>
                        <div>\n                          <div className=\"text-gray-500 mb-1\">Premium Until</div>
                          <div className=\"text-white font-medium\">\n                            {user.premium_until ? new Date(user.premium_until).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <div>\n                          <div className=\"text-gray-500 mb-1\">Joined</div>
                          <div className=\"text-white font-medium\">\n                            {new Date(user.created_at).toLocaleDateString()}
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
      </div>
    </div>
  );
}
