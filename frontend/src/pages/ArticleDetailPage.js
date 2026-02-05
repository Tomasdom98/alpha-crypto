import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, BookOpen, Share2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data } = await axios.get(`${API}/articles/${id}`);
        setArticle(data);
      } catch (error) {
        console.error('Error fetching article:', error);
        setError('No se pudo cargar el artículo');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado al portapapeles');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-emerald-500 text-xl font-mono">Cargando artículo...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 text-xl mb-4">{error || 'Artículo no encontrado'}</p>
        <Link to="/articles" className="text-emerald-500 hover:text-emerald-400">
          ← Volver a artículos
        </Link>
      </div>
    );
  }

  // Parse content - convert markdown-like syntax to HTML
  const formatContent = (content) => {
    if (!content) return '';
    
    return content
      .split('\n\n')
      .map((paragraph, idx) => {
        // Headers
        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
          return `<h3 class="text-xl font-bold text-white mt-8 mb-4">${paragraph.slice(2, -2)}</h3>`;
        }
        // Bold text and lists
        let formatted = paragraph
          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
          .replace(/^- /gm, '• ');
        
        // Check if it's a list
        if (formatted.includes('• ')) {
          const items = formatted.split('• ').filter(Boolean);
          return `<ul class="space-y-2 my-4">${items.map(item => `<li class="flex items-start gap-2"><span class="text-emerald-500 mt-1">•</span><span>${item.trim()}</span></li>`).join('')}</ul>`;
        }
        
        return `<p class="mb-4 leading-relaxed">${formatted}</p>`;
      })
      .join('');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link 
          to="/articles" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-500 mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver a artículos</span>
        </Link>

        {/* Article Header */}
        <article className="glass-card rounded-2xl overflow-hidden">
          {/* Hero Image */}
          <div className="h-64 md:h-96 overflow-hidden relative">
            {article.image_url && (
              <img 
                src={article.image_url} 
                alt={article.title} 
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
            
            {/* Category Badge */}
            <div className="absolute bottom-6 left-6 flex items-center gap-3">
              <span className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                {article.category}
              </span>
              {article.premium && (
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
                  PREMIUM
                </span>
              )}
            </div>
          </div>

          {/* Article Content */}
          <div className="p-6 md:p-10">
            {/* Title */}
            <h1 
              className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {article.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-gray-800">
              <div className="flex items-center gap-2 text-gray-400">
                <Clock size={16} />
                <span className="text-sm">
                  {new Date(article.published_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <BookOpen size={16} />
                <span className="text-sm">5 min lectura</span>
              </div>
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 text-gray-400 hover:text-emerald-500 transition-colors ml-auto"
              >
                <Share2 size={16} />
                <span className="text-sm">Compartir</span>
              </button>
            </div>

            {/* Excerpt */}
            <div className="text-xl text-gray-300 mb-8 leading-relaxed border-l-4 border-emerald-500 pl-6 italic">
              {article.excerpt}
            </div>

            {/* Main Content */}
            <div 
              className="prose prose-invert prose-emerald max-w-none text-gray-300"
              dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
            />

            {/* Tags / Related */}
            <div className="mt-12 pt-8 border-t border-gray-800">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-500">Temas:</span>
                <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                  {article.category}
                </span>
                <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                  Crypto
                </span>
                <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                  Inversión
                </span>
              </div>
            </div>
          </div>
        </article>

        {/* CTA */}
        <div className="mt-8 p-6 glass-card rounded-xl text-center">
          <h3 className="text-lg font-bold text-white mb-2">¿Te gustó este contenido?</h3>
          <p className="text-gray-400 text-sm mb-4">
            Accede a más análisis exclusivos y contenido premium
          </p>
          <Link 
            to="/articles"
            className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Ver más artículos
          </Link>
        </div>
      </div>
    </div>
  );
}
