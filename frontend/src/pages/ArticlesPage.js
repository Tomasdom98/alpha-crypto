import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Search, X, Filter } from 'lucide-react';
import OwlSeal from '@/components/OwlSeal';
import NewsletterPopup from '@/components/NewsletterPopup';
import AlphaiChat from '@/components/AlphaiChat';
import PremiumModal from '@/components/PremiumModal';
import { useLanguage, articleTranslations } from '@/context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAlphai, setShowAlphai] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const { language, t } = useLanguage();

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

  const categories = useMemo(() => {
    const cats = [...new Set(articles.map(a => a.category))];
    return ['all', ...cats];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const title = articleTranslations[language]?.[article.id]?.title || article.title;
      const excerpt = articleTranslations[language]?.[article.id]?.excerpt || article.excerpt;
      
      const matchesSearch = searchQuery === '' || 
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchQuery, selectedCategory, language]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all';

  const getTranslatedArticle = (article) => {
    const trans = articleTranslations[language]?.[article.id];
    return {
      ...article,
      title: trans?.title || article.title,
      excerpt: trans?.excerpt || article.excerpt,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="text-emerald-500 text-xl font-mono animate-pulse">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 relative hero-gradient">
      <div className="absolute inset-0 grid-background opacity-30" />
      <NewsletterPopup delay={5000} />
      <OwlSeal position="bottom-right" size="lg" opacity={0.6} className="fixed" onClick={() => setShowAlphai(true)} />
      <AlphaiChat isOpen={showAlphai} onClose={() => setShowAlphai(false)} onUpgrade={() => { setShowAlphai(false); setShowPremium(true); }} />
      <PremiumModal isOpen={showPremium} onClose={() => setShowPremium(false)} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8 backdrop-blur-xl">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-semibold">{t('research.badge')}</span>
          </div>
          <h1
            className="text-4xl md:text-6xl font-black text-white mb-5"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            data-testid="articles-page-heading"
          >
            {t('research.title')}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {t('research.subtitle')}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-10 space-y-5">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder={t('research.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="articles-search-input"
              className="w-full pl-12 pr-10 py-4 input-glass"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                data-testid={`category-filter-${category}`}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'glass-card text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                {category === 'all' ? t('common.all') : category}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="text-gray-500" data-testid="articles-count">
              {filteredArticles.length} {filteredArticles.length !== 1 ? t('research.articlesFound') : t('research.articleFound')}
            </span>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors">
                <X className="w-3 h-3" />
                {t('common.clearFilters')}
              </button>
            )}
          </div>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">{t('research.noArticles')}</p>
            <p className="text-gray-600 text-sm mb-4">{t('research.tryOtherTerms')}</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
                {t('common.clearFilters')}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, index) => {
              const translatedArticle = getTranslatedArticle(article);
              return (
                <Link
                  key={article.id}
                  to={`/articles/${article.id}`}
                  data-testid={`article-card-${article.id}`}
                  className="group glass-card rounded-xl overflow-hidden card-hover transition-all duration-300 hover:scale-[1.02] animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="h-48 overflow-hidden bg-gray-800 relative">
                    {article.image_url && (
                      <img src={article.image_url} alt={translatedArticle.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <span className="bg-emerald-500/90 text-white px-2.5 py-1 rounded text-xs font-medium">{article.category}</span>
                      {article.read_time && (
                        <span className="bg-gray-800/90 text-gray-300 px-2 py-1 rounded text-xs flex items-center gap-1">
                          <Clock size={10} />
                          {article.read_time}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                      {translatedArticle.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-3 mb-4">{translatedArticle.excerpt}</p>
                    
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {article.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="bg-gray-800/80 text-gray-400 px-2 py-0.5 rounded text-xs border border-gray-700/50">{tag}</span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {new Date(article.published_at).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <span className="text-emerald-500 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        {t('common.readMore')} <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link to="/" className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
            {t('common.backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
