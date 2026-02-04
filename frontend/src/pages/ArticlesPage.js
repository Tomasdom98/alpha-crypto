import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'Stablecoins', 'DeFi', 'AI', 'Analysis', 'News'];

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data } = await axios.get(`${API}/articles`);
        setArticles(data);
        setFilteredArticles(data);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  useEffect(() => {
    let filtered = articles;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) => a.title.toLowerCase().includes(query) || a.excerpt.toLowerCase().includes(query)
      );
    }

    setFilteredArticles(filtered);
  }, [selectedCategory, searchQuery, articles]);

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
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              data-testid="articles-search-input"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-950/50 border border-gray-800 rounded-lg pl-12 pr-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-gray-600"
            />
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="text-gray-500" size={20} />
            {categories.map((category) => (
              <button
                key={category}
                data-testid={`category-filter-${category.toLowerCase()}`}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-400" data-testid="articles-count">
          Showing {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No articles found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <Link
                key={article.id}
                to={`/articles/${article.id}`}
                data-testid={`article-card-${article.id}`}
                className="glass-card rounded-xl overflow-hidden card-hover"
              >
                <div className="h-48 overflow-hidden">
                  <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}