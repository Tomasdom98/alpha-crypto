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

  // Enhanced content parser for rich Milk Road style articles
  const formatContent = (content) => {
    if (!content) return '';
    
    const lines = content.split('\n');
    let html = '';
    let inTable = false;
    let tableRows = [];
    let inCodeBlock = false;
    let codeContent = '';
    
    const processLine = (line) => {
      // Skip empty lines
      if (!line.trim()) return '';
      
      // Code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          inCodeBlock = false;
          const result = `<pre class="bg-gray-900/80 border border-gray-700 rounded-lg p-4 my-4 overflow-x-auto"><code class="text-emerald-400 text-sm font-mono">${codeContent}</code></pre>`;
          codeContent = '';
          return result;
        } else {
          inCodeBlock = true;
          return '';
        }
      }
      
      if (inCodeBlock) {
        codeContent += line + '\n';
        return '';
      }
      
      // Horizontal rule
      if (line.trim() === '---') {
        return '<hr class="border-gray-700 my-8" />';
      }
      
      // Table detection
      if (line.includes('|') && line.trim().startsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        // Skip separator rows
        if (!line.includes('---')) {
          tableRows.push(line);
        }
        return '';
      } else if (inTable) {
        // End of table
        inTable = false;
        const tableHtml = renderTable(tableRows);
        tableRows = [];
        return tableHtml + processLine(line);
      }
      
      // H2 headers
      if (line.startsWith('## ')) {
        const text = line.slice(3);
        return `<h2 class="text-2xl font-black text-white mt-10 mb-6 flex items-center gap-3">${text}</h2>`;
      }
      
      // H3 headers
      if (line.startsWith('### ')) {
        const text = line.slice(4);
        return `<h3 class="text-xl font-bold text-emerald-400 mt-8 mb-4">${text}</h3>`;
      }
      
      // Blockquotes
      if (line.startsWith('> ')) {
        const text = formatInline(line.slice(2));
        return `<blockquote class="border-l-4 border-emerald-500 pl-6 my-6 py-2 bg-emerald-500/5 rounded-r-lg"><p class="text-lg text-gray-300 italic">${text}</p></blockquote>`;
      }
      
      // Numbered lists with emoji
      const numberedMatch = line.match(/^(\d+️⃣|\d+\.) (.+)$/);
      if (numberedMatch) {
        return `<div class="flex items-start gap-3 my-2"><span class="text-emerald-400 font-bold min-w-[24px]">${numberedMatch[1]}</span><span class="text-gray-300">${formatInline(numberedMatch[2])}</span></div>`;
      }
      
      // Medal/ranking emojis
      const medalMatch = line.match(/^(🥇|🥈|🥉|4️⃣|5️⃣) (.+)$/);
      if (medalMatch) {
        return `<div class="flex items-center gap-3 my-2 py-1"><span class="text-2xl">${medalMatch[1]}</span><span class="text-gray-300 font-medium">${formatInline(medalMatch[2])}</span></div>`;
      }
      
      // Bullet lists
      if (line.startsWith('- ')) {
        const text = formatInline(line.slice(2));
        return `<div class="flex items-start gap-3 my-2"><span class="text-emerald-500 mt-1.5">•</span><span class="text-gray-300">${text}</span></div>`;
      }
      
      // Check/cross items
      if (line.startsWith('✅ ') || line.startsWith('❌ ') || line.startsWith('🔴 ') || line.startsWith('🟢 ') || line.startsWith('🟡 ')) {
        const emoji = line.slice(0, 2);
        const text = formatInline(line.slice(3));
        return `<div class="flex items-start gap-3 my-2"><span class="text-lg">${emoji}</span><span class="text-gray-300">${text}</span></div>`;
      }
      
      // Regular paragraphs
      const formatted = formatInline(line);
      if (formatted.trim()) {
        return `<p class="mb-4 leading-relaxed text-gray-300">${formatted}</p>`;
      }
      
      return '';
    };
    
    // Format inline elements (bold, links, etc)
    const formatInline = (text) => {
      return text
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
        .replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-2 py-0.5 rounded text-emerald-400 text-sm">$1</code>');
    };
    
    // Render markdown table to HTML
    const renderTable = (rows) => {
      if (rows.length === 0) return '';
      
      const parseRow = (row) => {
        return row.split('|').filter(cell => cell.trim()).map(cell => cell.trim());
      };
      
      const headerCells = parseRow(rows[0]);
      const bodyRows = rows.slice(1).map(parseRow);
      
      let tableHtml = '<div class="overflow-x-auto my-6"><table class="w-full border-collapse">';
      
      // Header
      tableHtml += '<thead><tr class="border-b border-gray-700">';
      headerCells.forEach(cell => {
        tableHtml += `<th class="text-left py-3 px-4 text-emerald-400 font-semibold text-sm">${formatInline(cell)}</th>`;
      });
      tableHtml += '</tr></thead>';
      
      // Body
      tableHtml += '<tbody>';
      bodyRows.forEach((row, idx) => {
        const bgClass = idx % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/10';
        tableHtml += `<tr class="${bgClass} border-b border-gray-800">`;
        row.forEach(cell => {
          tableHtml += `<td class="py-3 px-4 text-gray-300 text-sm">${formatInline(cell)}</td>`;
        });
        tableHtml += '</tr>';
      });
      tableHtml += '</tbody></table></div>';
      
      return tableHtml;
    };
    
    // Process all lines
    for (const line of lines) {
      html += processLine(line);
    }
    
    // Close any remaining table
    if (inTable && tableRows.length > 0) {
      html += renderTable(tableRows);
    }
    
    return html;
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
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-500 mr-2">Temas:</span>
                <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm border border-emerald-500/30">
                  {article.category}
                </span>
                {article.tags && article.tags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-gray-700 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
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
