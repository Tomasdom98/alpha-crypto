import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Lock } from 'lucide-react';
import PremiumModal from '@/components/PremiumModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false); // Mock - would come from auth

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data } = await axios.get(`${API}/articles/${id}`);
        setArticle(data);
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-emerald-500 text-xl font-mono">Loading article...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-white mb-4">Article not found</h2>
          <Link to="/articles" className="text-emerald-500 hover:text-emerald-400">
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  const isLocked = article.premium && !isPremiumUser;

  return (
    <>
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            to="/articles"
            data-testid="back-to-articles-link"
            className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Articles
          </Link>

          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded text-sm font-medium">
                {article.category}
              </span>
              {article.premium && (
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg tracking-wide uppercase">
                  Premium
                </span>
              )}
            </div>
            <h1
              className="text-4xl md:text-5xl font-black text-white mb-4"
              style={{ fontFamily: 'Chivo, sans-serif' }}
              data-testid="article-title"
            >
              {article.title}
            </h1>
            <p className="text-xl text-gray-400 mb-4">{article.excerpt}</p>
            <div className="text-sm text-gray-500">
              Published on{' '}
              {new Date(article.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          {/* Article Image */}
          <div className="mb-8 rounded-xl overflow-hidden">
            <img src={article.image_url} alt={article.title} className="w-full h-96 object-cover" />
          </div>

          {/* Article Content */}
          <div className="glass-card rounded-xl p-8 relative">
            {isLocked && (
              <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-md rounded-xl z-10 flex flex-col items-center justify-center p-8" data-testid="premium-lock-overlay">
                <Lock className="text-emerald-500 mb-4" size={48} />
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Chivo, sans-serif' }}>
                  Premium Content
                </h3>
                <p className="text-gray-400 text-center mb-6 max-w-md">
                  Subscribe to Alpha Crypto Premium to unlock this article and get access to exclusive content, airdrops, and analysis.
                </p>
                <button
                  data-testid="unlock-article-btn"
                  onClick={() => setShowPremiumModal(true)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-6 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Unlock for $9/month
                </button>
              </div>
            )}
            <div className={`prose prose-invert max-w-none ${isLocked ? 'blur-sm' : ''}`} data-testid="article-content">
              <p className="text-gray-300 leading-relaxed text-lg">
                {article.content}
              </p>
              {/* More content would go here */}
              <p className="text-gray-300 leading-relaxed text-lg mt-6">
                This is a detailed analysis covering market trends, technical indicators, and investment strategies.
                Premium members get access to comprehensive reports with actionable insights.
              </p>
            </div>
          </div>
        </div>
      </div>

      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
    </>
  );
}