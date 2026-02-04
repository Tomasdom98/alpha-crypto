import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Footer() {
  const [feedbackForm, setFeedbackForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackForm.name || !feedbackForm.email || !feedbackForm.message) {
      setError('Please fill in all fields');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      await axios.post(`${API}/feedback`, feedbackForm);
      setSubmitted(true);
      setFeedbackForm({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-gray-900/50 border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">
                Ʉ
              </div>
              <span className="font-bold text-xl text-white" style={{ fontFamily: 'Chivo, sans-serif' }}>
                Alpha Crypto
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Tu fuente de alpha en crypto. Análisis profundo, airdrops verificados, e insights de mercado.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Platform</h4>
            <div className="space-y-2">
              <Link to="/articles" className="block text-gray-400 hover:text-emerald-500 text-sm transition-colors">
                Articles
              </Link>
              <Link to="/airdrops" className="block text-gray-400 hover:text-emerald-500 text-sm transition-colors">
                Airdrops
              </Link>
              <Link to="/indices" className="block text-gray-400 hover:text-emerald-500 text-sm transition-colors">
                Market Indices
              </Link>
              <Link to="/analysis" className="block text-gray-400 hover:text-emerald-500 text-sm transition-colors">
                Analysis
              </Link>
            </div>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-bold text-white mb-4">Community</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-400 hover:text-emerald-500 text-sm transition-colors">
                Twitter
              </a>
              <a href="#" className="block text-gray-400 hover:text-emerald-500 text-sm transition-colors">
                Discord
              </a>
              <a href="#" className="block text-gray-400 hover:text-emerald-500 text-sm transition-colors">
                Telegram
              </a>
            </div>
          </div>

          {/* Feedback Form */}
          <div>
            <h4 className="font-bold text-white mb-4">Share Your Feedback</h4>
            <p className="text-gray-500 text-xs mb-3">What would you like to see on Alpha Crypto?</p>
            
            {submitted ? (
              <div className="flex items-center gap-2 text-emerald-500 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                <CheckCircle size={18} />
                <span className="text-sm">Thanks for your feedback!</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-3" data-testid="feedback-form">
                <input
                  type="text"
                  placeholder="Your name"
                  value={feedbackForm.name}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  data-testid="feedback-name"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={feedbackForm.email}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  data-testid="feedback-email"
                />
                <textarea
                  placeholder="Your message..."
                  rows={2}
                  value={feedbackForm.message}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                  data-testid="feedback-message"
                />
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all"
                  data-testid="feedback-submit"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={14} />
                      Send Feedback
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2024 Alpha Crypto. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
