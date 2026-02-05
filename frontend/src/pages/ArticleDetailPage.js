import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, BookOpen, Share2 } from 'lucide-react';
import OwlSeal from '@/components/OwlSeal';

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
    
    // Process line by line for better control
    const lines = content.split('\n');
    let result = [];
    let inTable = false;
    let tableRows = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Table detection
      if (line.includes('|') && line.trim().startsWith('|')) {
        inTable = true;
        if (!line.includes('---')) tableRows.push(line);
        continue;
      } else if (inTable && tableRows.length > 0) {
        // Render table
        const parseRow = (row) => row.split('|').filter(c => c.trim()).map(c => c.trim());
        const header = parseRow(tableRows[0]);
        const body = tableRows.slice(1).map(parseRow);
        let tableHtml = '<div class="overflow-x-auto my-6"><table class="w-full"><thead><tr class="border-b border-gray-700">';
        header.forEach(h => { tableHtml += '<th class="text-left py-2 px-3 text-emerald-400 text-sm">' + h + '</th>'; });
        tableHtml += '</tr></thead><tbody>';
        body.forEach((row, idx) => {
          tableHtml += '<tr class="' + (idx % 2 === 0 ? 'bg-gray-800/30' : '') + ' border-b border-gray-800">';
          row.forEach(cell => { tableHtml += '<td class="py-2 px-3 text-gray-300 text-sm">' + cell + '</td>'; });
          tableHtml += '</tr>';
        });
        tableHtml += '</tbody></table></div>';
        result.push(tableHtml);
        tableRows = [];
        inTable = false;
      }
      
      // Skip empty lines
      if (!line.trim()) continue;
      
      // Horizontal rules
      if (line.trim() === '---') {
        result.push('<hr class="border-gray-700 my-6" />');
        continue;
      }
      
      // H2 headers
      if (line.startsWith('## ')) {
        result.push('<h2 class="text-2xl font-bold text-white mt-8 mb-4">' + line.slice(3) + '</h2>');
        continue;
      }
      
      // H3 headers
      if (line.startsWith('### ')) {
        result.push('<h3 class="text-xl font-bold text-emerald-400 mt-6 mb-3">' + line.slice(4) + '</h3>');
        continue;
      }
      
      // Blockquotes
      if (line.startsWith('> ')) {
        result.push('<blockquote class="border-l-4 border-emerald-500 pl-4 my-4 text-gray-300 italic">' + line.slice(2) + '</blockquote>');
        continue;
      }
      
      // Bullet lists
      if (line.startsWith('- ')) {
        const text = line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
        result.push('<div class="flex gap-2 my-1"><span class="text-emerald-500">•</span><span class="text-gray-300">' + text + '</span></div>');
        continue;
      }
      
      // Regular paragraphs with bold formatting
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
      result.push('<p class="mb-3 text-gray-300 leading-relaxed">' + formatted + '</p>');
    }
    
    // Handle remaining table
    if (tableRows.length > 0) {
      const parseRow = (row) => row.split('|').filter(c => c.trim()).map(c => c.trim());
      const header = parseRow(tableRows[0]);
      const body = tableRows.slice(1).map(parseRow);
      let tableHtml = '<div class="overflow-x-auto my-6"><table class="w-full"><thead><tr class="border-b border-gray-700">';
      header.forEach(h => { tableHtml += '<th class="text-left py-2 px-3 text-emerald-400 text-sm">' + h + '</th>'; });
      tableHtml += '</tr></thead><tbody>';
      body.forEach((row, idx) => {
        tableHtml += '<tr class="' + (idx % 2 === 0 ? 'bg-gray-800/30' : '') + ' border-b border-gray-800">';
        row.forEach(cell => { tableHtml += '<td class="py-2 px-3 text-gray-300 text-sm">' + cell + '</td>'; });
        tableHtml += '</tr>';
      });
      tableHtml += '</tbody></table></div>';
      result.push(tableHtml);
    }
    
    return result.join('');
  };

  return (
    <div className="min-h-screen py-8 relative">
      {/* Owl Seal */}
      <OwlSeal position="bottom-right" size="lg" opacity={0.6} className="fixed" />
      
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
              {article.read_time && (
                <span className="bg-gray-900/80 text-gray-300 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5">
                  <Clock size={14} />
                  {article.read_time}
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
