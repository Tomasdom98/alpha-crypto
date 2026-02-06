import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, BookOpen, Share2 } from 'lucide-react';
import OwlSeal from '@/components/OwlSeal';
import AlphaiChat from '@/components/AlphaiChat';
import PremiumModal from '@/components/PremiumModal';
import { useLanguage } from '@/context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAlphai, setShowAlphai] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    axios.get(BACKEND_URL + '/api/articles/' + id)
      .then(function(response) {
        setArticle(response.data);
        setLoading(false);
      })
      .catch(function(err) {
        console.error('Error:', err);
        setError('No se pudo cargar el artículo');
        setLoading(false);
      });
  }, [id]);

  function handleShare() {
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
  }

  function formatContent(content) {
    if (!content) return '';
    var lines = content.split('\n');
    var result = '';
    var tableBuffer = [];
    var inTable = false;
    
    function renderTable(rows) {
      if (rows.length < 2) return '';
      
      var html = '<div class="overflow-x-auto my-6"><table class="w-full border-collapse bg-gray-800/30 rounded-lg overflow-hidden">';
      
      // Parse header
      var headerCells = rows[0].split('|').filter(function(c) { return c.trim(); });
      html += '<thead><tr class="bg-gray-800">';
      for (var i = 0; i < headerCells.length; i++) {
        html += '<th class="text-left py-3 px-4 text-emerald-400 font-semibold text-sm border-b border-gray-700">' + headerCells[i].trim() + '</th>';
      }
      html += '</tr></thead><tbody>';
      
      // Parse body (skip separator row)
      for (var j = 1; j < rows.length; j++) {
        if (rows[j].includes('---')) continue;
        var cells = rows[j].split('|').filter(function(c) { return c.trim(); });
        var bgClass = j % 2 === 0 ? 'bg-gray-800/20' : '';
        html += '<tr class="' + bgClass + ' border-b border-gray-800/50">';
        for (var k = 0; k < cells.length; k++) {
          html += '<td class="py-2.5 px-4 text-gray-300 text-sm">' + cells[k].trim() + '</td>';
        }
        html += '</tr>';
      }
      
      html += '</tbody></table></div>';
      return html;
    }
    
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      
      // Table detection
      if (line.includes('|') && line.trim().startsWith('|')) {
        inTable = true;
        tableBuffer.push(line);
        continue;
      } else if (inTable) {
        result += renderTable(tableBuffer);
        tableBuffer = [];
        inTable = false;
      }
      
      if (!line.trim()) continue;
      
      if (line.trim() === '---') {
        result += '<hr class="border-gray-700 my-6" />';
      } else if (line.startsWith('## ')) {
        result += '<h2 class="text-2xl font-bold text-white mt-8 mb-4">' + line.slice(3) + '</h2>';
      } else if (line.startsWith('### ')) {
        result += '<h3 class="text-xl font-bold text-emerald-400 mt-6 mb-3">' + line.slice(4) + '</h3>';
      } else if (line.startsWith('> ')) {
        result += '<blockquote class="border-l-4 border-emerald-500 pl-4 my-4 text-gray-300 italic">' + line.slice(2) + '</blockquote>';
      } else if (line.startsWith('- ')) {
        var txt = line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
        result += '<div class="flex gap-2 my-1"><span class="text-emerald-500">•</span><span class="text-gray-300">' + txt + '</span></div>';
      } else {
        var formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
        result += '<p class="mb-3 text-gray-300 leading-relaxed">' + formatted + '</p>';
      }
    }
    
    // Handle remaining table
    if (tableBuffer.length > 0) {
      result += renderTable(tableBuffer);
    }
    
    return result;
  }

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

  var tagElements = [];
  if (article.tags) {
    for (var i = 0; i < article.tags.length; i++) {
      tagElements.push(
        <span key={i} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
          {article.tags[i]}
        </span>
      );
    }
  }

  return (
    <div className="min-h-screen py-8 relative">
      <OwlSeal position="bottom-right" size="lg" opacity={0.6} className="fixed" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          to="/articles" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-500 mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver a artículos</span>
        </Link>

        <article className="glass-card rounded-2xl overflow-hidden">
          <div className="h-64 md:h-96 overflow-hidden relative">
            {article.image_url && (
              <img 
                src={article.image_url} 
                alt={article.title} 
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
            
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

          <div className="p-6 md:p-10">
            <h1 
              className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {article.title}
            </h1>

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
                <span className="text-sm">{article.read_time || '5 min lectura'}</span>
              </div>
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 text-gray-400 hover:text-emerald-500 transition-colors ml-auto"
              >
                <Share2 size={16} />
                <span className="text-sm">Compartir</span>
              </button>
            </div>

            <div className="text-xl text-gray-300 mb-8 leading-relaxed border-l-4 border-emerald-500 pl-6 italic">
              {article.excerpt}
            </div>

            <div 
              className="prose prose-invert prose-emerald max-w-none text-gray-300"
              dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
            />

            <div className="mt-12 pt-8 border-t border-gray-800">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-500 mr-2">Temas:</span>
                <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm border border-emerald-500/30">
                  {article.category}
                </span>
                {tagElements}
              </div>
            </div>
          </div>
        </article>

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

export default ArticleDetailPage;
