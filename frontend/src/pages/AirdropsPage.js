import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight, Gift, Target, TrendingUp, ChevronDown, ChevronUp, Search, X, Filter } from 'lucide-react';
import OwlSeal from '@/components/OwlSeal';
import { useLanguage, airdropTranslations } from '@/context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PROTOCOL_LOGOS = {
  'GRVT': 'https://assets.coingecko.com/coins/images/36654/small/grvt.png',
  'Backpack': 'https://assets.coingecko.com/coins/images/35809/small/backpack.jpg',
  'Paradex': 'https://pbs.twimg.com/profile_images/1661674397886795776/G2YcSRXv_400x400.jpg',
  'Reya Network': 'https://pbs.twimg.com/profile_images/1742206766913351680/Q1pKpH_Y_400x400.jpg',
  'Avantis': 'https://pbs.twimg.com/profile_images/1717170688523182080/G0P5aYV5_400x400.jpg',
  'Ostium': 'https://pbs.twimg.com/profile_images/1781680920452296704/pBKGT5Kk_400x400.jpg',
  'Lighter': 'https://pbs.twimg.com/profile_images/1628031920227876800/LdHiS0Qe_400x400.jpg',
  'Pacifica': 'https://pbs.twimg.com/profile_images/1801651557270855680/7y_VkNnN_400x400.jpg'
};

function EducationalSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="mb-8 glass-card rounded-2xl overflow-hidden border border-emerald-500/20">
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full p-6 flex items-center justify-between hover:bg-gray-800/30 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/20">
            <Gift className="text-emerald-500" size={28} />
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {t('airdrops.whatIsAirdrop')}
            </h2>
            <p className="text-gray-400 text-sm mt-1">{t('airdrops.learnHow')}</p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="text-emerald-500" size={24} /> : <ChevronDown className="text-emerald-500" size={24} />}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-6 border-t border-gray-800">
          <div className="pt-6">
            <p className="text-gray-300 leading-relaxed">{t('airdrops.airdropExplanation')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <Target className="text-blue-400" size={20} />
                <h3 className="font-bold text-white">{t('airdrops.howTheyWork')}</h3>
              </div>
              <ul className="text-sm text-gray-400 space-y-2">
                {t('airdrops.howTheyWorkList').map((item, i) => <li key={i}>• {item}</li>)}
              </ul>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="text-emerald-400" size={20} />
                <h3 className="font-bold text-white">{t('airdrops.howToQualify')}</h3>
              </div>
              <ul className="text-sm text-gray-400 space-y-2">
                {t('airdrops.howToQualifyList').map((item, i) => <li key={i}>• {item}</li>)}
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/5 rounded-xl p-5 border border-emerald-500/20">
            <h3 className="font-bold text-emerald-400 mb-3">{t('airdrops.tips')}</h3>
            <div className="text-sm text-gray-300 space-y-2">
              {t('airdrops.tipsList').map((item, i) => <p key={i}>• <strong>{item.split(':')[0]}:</strong>{item.split(':')[1]}</p>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AirdropsPage() {
  const [airdrops, setAirdrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChain, setSelectedChain] = useState('all');
  const { language, t } = useLanguage();

  useEffect(() => {
    const fetchAirdrops = async () => {
      try {
        const { data } = await axios.get(`${API}/airdrops`);
        setAirdrops(data);
      } catch (error) {
        console.error('Error fetching airdrops:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAirdrops();
  }, []);

  const chains = useMemo(() => {
    const uniqueChains = [...new Set(airdrops.map(a => a.chain).filter(Boolean))];
    return ['all', ...uniqueChains];
  }, [airdrops]);

  const filteredAirdrops = useMemo(() => {
    return airdrops.filter(airdrop => {
      const desc = airdropTranslations[language]?.[airdrop.id]?.description || airdrop.description;
      const matchesSearch = searchQuery === '' ||
        airdrop.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (airdrop.chain && airdrop.chain.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesChain = selectedChain === 'all' || airdrop.chain === selectedChain;
      return matchesSearch && matchesChain;
    });
  }, [airdrops, searchQuery, selectedChain, language]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedChain('all');
  };

  const hasActiveFilters = searchQuery !== '' || selectedChain !== 'all';

  const getProtocolLogo = (projectName) => PROTOCOL_LOGOS[projectName] || null;

  const getTranslatedDescription = (airdrop) => {
    return airdropTranslations[language]?.[airdrop.id]?.description || airdrop.description;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-emerald-500 text-xl font-mono">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 relative">
      <OwlSeal position="bottom-right" size="lg" opacity={0.6} className="fixed" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <Gift className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-medium">{t('airdrops.badge')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }} data-testid="airdrops-page-heading">
            {t('airdrops.title')}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t('airdrops.subtitle')}</p>
        </div>

        <EducationalSection />

        <div className="mb-8 space-y-4">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder={t('airdrops.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="airdrops-search-input"
              className="w-full pl-12 pr-10 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider">{t('airdrops.chain')}:</span>
              <div className="flex flex-wrap gap-1">
                {chains.map((chain) => (
                  <button
                    key={chain}
                    onClick={() => setSelectedChain(chain)}
                    data-testid={`chain-filter-${chain}`}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedChain === chain ? 'bg-purple-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700/50'
                    }`}
                  >
                    {chain === 'all' ? t('common.all') : chain}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="text-gray-500" data-testid="airdrops-count">
              {filteredAirdrops.length} {filteredAirdrops.length !== 1 ? t('airdrops.airdropsFound') : t('airdrops.airdropFound')}
            </span>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300">
                <X className="w-3 h-3" />
                {t('common.clearFilters')}
              </button>
            )}
          </div>
        </div>

        {filteredAirdrops.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">{t('airdrops.noAirdrops')}</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">{t('common.clearFilters')}</button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAirdrops.map((airdrop, index) => (
              <Link
                to={`/airdrops/${airdrop.id}`}
                key={airdrop.id}
                data-testid={`airdrop-card-${airdrop.id}`}
                className="block glass-card rounded-xl p-6 card-hover transition-all hover:border-emerald-500/30 hover:shadow-lg animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4 flex-1">
                    {getProtocolLogo(airdrop.project_name) ? (
                      <img src={getProtocolLogo(airdrop.project_name)} alt={airdrop.project_name} className="w-16 h-16 rounded-xl object-cover border border-gray-700" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                    ) : null}
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center text-white font-bold text-xl border border-gray-700" style={{ display: getProtocolLogo(airdrop.project_name) ? 'none' : 'flex' }}>
                      {airdrop.project_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {airdrop.project_name}
                      </h3>
                      <p className="text-gray-400 mb-3 line-clamp-2">{getTranslatedDescription(airdrop)}</p>
                      <div className="flex items-center gap-4 flex-wrap">
                        {airdrop.chain && (
                          <span className="px-3 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-sm">{airdrop.chain}</span>
                        )}
                        <span className="text-gray-500 flex items-center gap-1 text-sm">
                          <Clock size={14} /> {new Date(airdrop.deadline).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}
                        </span>
                        <span className="text-gray-500 text-sm">{airdrop.tasks?.length || 0} {t('common.tasks')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm text-gray-400 mb-1">{t('common.estimatedReward')}*</div>
                    <div className="text-2xl font-bold text-emerald-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{airdrop.estimated_reward}</div>
                    {airdrop.timeline && <div className="text-xs text-gray-500 mt-1">{airdrop.timeline}</div>}
                    <div className="text-xs text-amber-400/70 mt-1 max-w-[150px]">*{t('common.accordingToVolume')}</div>
                  </div>
                </div>

                {airdrop.tasks && airdrop.tasks.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-gray-400 mb-2">{t('airdrops.tasks')}:</h4>
                    <div className="space-y-2">
                      {airdrop.tasks.slice(0, 2).map((task) => (
                        <div key={task.id} className="text-sm text-gray-300 pl-4 border-l-2 border-gray-700">{task.description}</div>
                      ))}
                      {airdrop.tasks.length > 2 && <div className="text-xs text-gray-500 pl-4">+ {airdrop.tasks.length - 2} {t('airdrops.moreTasks')}</div>}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div className="text-sm text-gray-500">
                    {t('common.status')}: <span className="text-emerald-500 capitalize">{airdrop.status === 'active' ? t('common.active') : airdrop.status}</span>
                  </div>
                  <span className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                    {t('common.viewDetails')} <ChevronRight size={18} />
                  </span>
                </div>
              </Link>
            ))}
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
