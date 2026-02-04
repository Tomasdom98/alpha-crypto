import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data } = await axios.get(`${API}/articles`);
        setArticles(data);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-emerald-500 text-xl font-mono">Loading articles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl md:text-5xl font-black text-white mb-4"
            style={{ fontFamily: 'Chivo, sans-serif' }}
            data-testid="articles-page-heading"
          >
            Articles & Analysis
          </h1>
          <p className="text-gray-400 text-lg">Deep insights and alpha for crypto investors</p>
          <p className="text-emerald-500 mt-2">✅ Connected to Sanity CMS (Project: 15c5x8s5)</p>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-400" data-testid="articles-count">
          Showing {articles.length} article{articles.length !== 1 ? 's' : ''} from Sanity
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">No articles found in Sanity</p>
            <p className="text-gray-600 text-sm">Create articles at: https://15c5x8s5.sanity.studio</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <div
                key={article.id}
                data-testid={`article-card-${article.id}`}
                className="glass-card rounded-xl overflow-hidden card-hover"
              >
                <div className="h-48 overflow-hidden bg-gray-800">
                  {article.image_url && (
                    <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-xs font-medium">
                      {article.category}
                    </span>
                    {article.premium && (
                      <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg tracking-wide uppercase">
                        Premium
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{article.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-3 mb-4">{article.excerpt}</p>
                  <div className="text-xs text-gray-500">
                    {new Date(article.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="mt-3 text-xs text-gray-600">
                    ID: {article.id.substring(0, 8)}...
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}