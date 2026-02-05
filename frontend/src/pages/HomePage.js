import { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import LiveTicker from '@/components/LiveTicker';
import PremiumBanner from '@/components/PremiumBanner';
import MarketIndicators from '@/components/MarketIndicators';
import LoadingSkeleton from '@/components/LoadingSkeleton';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function HomePage() {
  const [marketStats, setMarketStats] = useState(null);
  const [fearGreed, setFearGreed] = useState(null);
  const [articles, setArticles] = useState([]);
  const [airdrops, setAirdrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, fgRes, articlesRes, airdropsRes] = await Promise.all([
          axios.get(`${API}/crypto/market-stats`),
          axios.get(`${API}/crypto/fear-greed`),
          axios.get(`${API}/articles`),
          axios.get(`${API}/airdrops`),
        ]);

        setMarketStats(statsRes.data);
        setFearGreed(fgRes.data);
        setArticles(articlesRes.data.slice(0, 3));
        setAirdrops(airdropsRes.data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4" />
          <div className="text-emerald-500 text-xl font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Loading Alpha Crypto...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Live Ticker */}
      <LiveTicker />

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 grid-background" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent" />
        
        {/* Owl mascot - cropped to show only the owl part */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none hidden md:block overflow-hidden" 
             style={{ width: '350px', height: '300px' }}>
          <img 
            src="https://customer-assets.emergentagent.com/job_aa332bb7-9735-40f0-a436-aa4f8697591d/artifacts/wqm01lrp_Gemini_Generated_Image_xn8vxaxn8vxaxn8v.png" 
            alt="Alpha Owl" 
            className="w-[600px] h-auto opacity-50 md:opacity-70 animate-float drop-shadow-[0_0_40px_rgba(16,185,129,0.4)]"
            style={{ 
              marginTop: '-190px',
              marginLeft: '-130px'
            }}
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 backdrop-blur-sm animate-pulse-glow">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-medium">Professional Crypto Intelligence</span>
          </div>
          <h1
            className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 fade-in leading-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}
            data-testid="hero-heading"
          >
            Tu fuente de <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent animate-gradient">alpha</span> en crypto
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-8 fade-in" data-testid="hero-description" style={{ fontFamily: 'Inter, sans-serif' }}>
            Indicadores on-chain, artículos educativos, airdrops verificados, señales de inversión y portfolio tracking. Todo en un solo lugar.
          </p>
        </div>
      </section>

      {/* Market Indicators Section */}
      <MarketIndicators fearGreed={fearGreed} />

      {/* Latest Articles Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }} data-testid="articles-section-heading">
              Latest Articles
            </h2>
            <p className="text-gray-500">Crypto insights and analysis</p>
          </div>
          <Link
            to="/articles"
            data-testid="view-all-articles-link"
            className="group flex items-center gap-2 px-5 py-2.5 bg-gray-800/50 hover:bg-emerald-500/10 border border-gray-700 hover:border-emerald-500/50 rounded-xl text-emerald-400 font-semibold transition-all duration-300 hover:scale-105"
          >
            View All 
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        {articles.length === 0 ? (
          <LoadingSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <Link
                key={article.id}
                to={`/articles/${article.id}`}
                data-testid={`article-preview-${article.id}`}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/20 hover:border-emerald-500/50"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards',
                }}
              >
                <div className="h-48 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                  <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
                      {article.category}
                    </span>
                    {article.premium && (
                      <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg tracking-wide uppercase">
                        Premium
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{article.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2">{article.excerpt}</p>
                </div>
                
                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Active Airdrops Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }} data-testid="airdrops-section-heading">
              Active Airdrops
            </h2>
            <p className="text-gray-500">Verified opportunities to earn crypto</p>
          </div>
          <Link
            to="/airdrops"
            data-testid="view-all-airdrops-link"
            className="group flex items-center gap-2 px-5 py-2.5 bg-gray-800/50 hover:bg-emerald-500/10 border border-gray-700 hover:border-emerald-500/50 rounded-xl text-emerald-400 font-semibold transition-all duration-300 hover:scale-105"
          >
            View All 
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="space-y-4">
          {airdrops.map((airdrop, index) => (
            <div 
              key={airdrop.id} 
              data-testid={`airdrop-preview-${airdrop.id}`} 
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-emerald-500/20 hover:border-emerald-500/50"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards',
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 flex-shrink-0 ring-2 ring-gray-700/50 group-hover:ring-emerald-500/50 transition-all">
                    <img src={airdrop.logo_url} alt={airdrop.project_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {airdrop.project_name}
                      </h3>
                      {airdrop.premium && (
                        <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg tracking-wide uppercase">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{airdrop.description}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span
                        className={`px-3 py-1.5 rounded-full font-bold border ${
                          airdrop.difficulty === 'Easy'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : airdrop.difficulty === 'Medium'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}
                      >
                        {airdrop.difficulty}
                      </span>
                      <span className="text-gray-500 flex items-center gap-1.5">
                        <Clock size={14} /> {new Date(airdrop.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Reward</div>
                  <div className="text-2xl md:text-3xl font-bold text-emerald-500" style={{ fontFamily: 'Space Grotesk, monospace' }}>
                    {airdrop.estimated_reward}
                  </div>
                </div>
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Premium Banner */}
      <PremiumBanner />
    </div>
  );
}