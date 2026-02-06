import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, TrendingDown, Wallet, BarChart3, RefreshCw, ExternalLink, Coins, PiggyBank, Crown, Loader2 } from 'lucide-react';
import axios from 'axios';
import OwlSeal from '@/components/OwlSeal';
import { useLanguage } from '@/context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL + '/api';

// Protocol logos for Yield section (fallback if not in DB)
const YIELD_LOGOS = {
  'Based.one': 'https://pbs.twimg.com/profile_images/1803810548512124928/qUvn6XJd_400x400.jpg',
  'Felix Protocol': 'https://pbs.twimg.com/profile_images/1804553428792766464/WPdS8j0u_400x400.jpg',
  'Lighter.xyz': 'https://pbs.twimg.com/profile_images/1628031920227876800/LdHiS0Qe_400x400.jpg',
  'Extended': 'https://pbs.twimg.com/profile_images/1818688001923534848/DzJJMW8j_400x400.jpg',
  'Orderly': 'https://pbs.twimg.com/profile_images/1645768594118098946/7G5kvvKk_400x400.jpg',
  'Avantis Finance': 'https://pbs.twimg.com/profile_images/1717170688523182080/G0P5aYV5_400x400.jpg',
  'Resolv': 'https://pbs.twimg.com/profile_images/1754134096637546496/GpNe2HCQ_400x400.jpg',
  'Kamino': 'https://pbs.twimg.com/profile_images/1610737072497053712/o1eNprPR_400x400.jpg',
  'Drift': 'https://pbs.twimg.com/profile_images/1504509987076579333/RGpeYhMh_400x400.jpg',
  'StandX': 'https://pbs.twimg.com/profile_images/1787150869618192384/hbEORU6Q_400x400.jpg'
};

// Staking logos (fallback if not in DB)
const STAKING_LOGOS = {
  'SOL': 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
  'ETH': 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  'BTC': 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
  'SUI': 'https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg'
};

// Default data as fallback
const DEFAULT_YIELD_PROTOCOLS = [
  { name: 'Based.one HLP', chain: 'Hyperliquid L1', apy: '139%', description: 'Market making en perpetuos + liquidaciones', link: 'https://app.based.one/vaults' },
  { name: 'Felix Protocol', chain: 'Hyperliquid L1', apy: '85%', description: 'Stability pool: intereses de borrowers', link: 'https://www.usefelix.xyz/earn' },
  { name: 'Lighter.xyz', chain: 'Arbitrum / Base', apy: '47%', description: 'LP para DEX de perpetuos', link: 'https://app.lighter.xyz/public-pools' },
  { name: 'Extended', chain: 'Base / Arbitrum', apy: '37%', description: 'Market making perpetuos crypto + TradFi', link: 'https://app.extended.exchange/vault' },
  { name: 'Orderly', chain: 'Arbitrum', apy: '34%', description: 'LP para orderbook de perpetuos', link: 'https://app.orderly.network/vaults' },
  { name: 'Avantis Finance', chain: 'Base', apy: '31%', description: 'Vault perpetuos crypto + RWAs', link: 'https://www.avantisfi.com/earn/avantis-vault' },
  { name: 'Resolv', chain: 'Multi-chain', apy: '23%', description: 'Delta-neutral vault con stablecoins', link: 'https://app.resolv.xyz/vaults' },
  { name: 'Kamino', chain: 'Solana', apy: '19%', description: 'Lending: intereses + rewards', link: 'https://kamino.com' },
  { name: 'Drift', chain: 'Solana', apy: '9%', description: 'Insurance fund: fees + liquidaciones', link: 'https://app.drift.trade/vaults/insurance-fund-vaults' },
  { name: 'StandX', chain: 'Multi-chain', apy: '25%', description: 'Vault para perpetuos cross-chain', link: 'https://standx.com' }
];

const DEFAULT_STAKING_TOKENS = [
  { token: 'Solana', symbol: 'SOL', apy: '7-8%', platform: 'Jupiter', link: 'https://www.jup.ag', logo_url: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
  { token: 'Ethereum', symbol: 'ETH', apy: '3-4%', platform: 'Lido', link: 'https://stake.lido.fi', logo_url: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
  { token: 'Bitcoin', symbol: 'BTC', apy: '5-8%', platform: 'Bybit Earn', link: 'https://www.bybit.com/earn', logo_url: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
  { token: 'Sui', symbol: 'SUI', apy: '2-3%', platform: 'Sui Staking', link: 'https://sui.io/stake', logo_url: 'https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg' }
];

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [yieldProtocols, setYieldProtocols] = useState([]);
  const [stakingTokens, setStakingTokens] = useState([]);
  const [loadingYields, setLoadingYields] = useState(true);
  const [loadingStaking, setLoadingStaking] = useState(true);
  const { language } = useLanguage();

  // Fetch yields from backend
  useEffect(() => {
    async function fetchYields() {
      try {
        const response = await axios.get(API + '/yields');
        if (response.data && response.data.length > 0) {
          setYieldProtocols(response.data);
        } else {
          setYieldProtocols(DEFAULT_YIELD_PROTOCOLS);
        }
      } catch (error) {
        console.error('Error fetching yields:', error);
        setYieldProtocols(DEFAULT_YIELD_PROTOCOLS);
      } finally {
        setLoadingYields(false);
      }
    }
    fetchYields();
  }, []);

  // Fetch staking from backend
  useEffect(() => {
    async function fetchStaking() {
      try {
        const response = await axios.get(API + '/staking');
        if (response.data && response.data.length > 0) {
          setStakingTokens(response.data);
        } else {
          setStakingTokens(DEFAULT_STAKING_TOKENS);
        }
      } catch (error) {
        console.error('Error fetching staking:', error);
        setStakingTokens(DEFAULT_STAKING_TOKENS);
      } finally {
        setLoadingStaking(false);
      }
    }
    fetchStaking();
  }, []);

  // Translations
  const tx = {
    es: {
      title: 'Portfolio Alpha Crypto',
      subtitle: 'Seguimiento del portfolio, yields en stablecoins y staking.',
      totalValue: 'Valor Total del Portfolio',
      monthlyReturn: 'Monthly Return',
      performance: 'Rendimiento 6 Meses',
      allocation: 'Allocation',
      holdings: 'Holdings',
      recentTrades: 'Trades Recientes',
      strategyNotes: 'Notas de Estrategia',
      currentStrategy: 'Estrategia Actual',
      currentStrategyText: 'DCA semanal en BTC y ETH. Manteniendo posición defensiva con 15% en stables.',
      nextMoves: 'Próximos Movimientos',
      nextMovesText: 'Monitorear soporte en $65K BTC. Si se rompe, aumentar stables a 25%.',
      yieldTitle: 'Stablecoin Yields',
      yieldSubtitle: 'Las mejores oportunidades para rentabilizar tus stablecoins',
      yieldNote: 'Los APYs son aproximados y pueden variar según condiciones del mercado.',
      stakingTitle: 'Staking',
      stakingSubtitle: 'Genera rendimiento pasivo con tus tokens',
      stakingNote: 'Los APYs son aproximados y pueden variar según condiciones del mercado y la red.',
      asset: 'Asset',
      apyApprox: 'APY Aprox.',
      platform: 'Plataforma',
      action: 'Acción',
      disclaimer: 'Este portfolio es solo para fines educativos. Rendimientos pasados no garantizan resultados futuros.',
      backToHome: 'Volver al Inicio',
      updated: 'Actualizado',
      goToVault: 'Ir al Vault',
    },
    en: {
      title: 'Alpha Crypto Portfolio',
      subtitle: 'Portfolio tracking, stablecoin yields and staking.',
      totalValue: 'Total Portfolio Value',
      monthlyReturn: 'Monthly Return',
      performance: '6-Month Performance',
      allocation: 'Allocation',
      holdings: 'Holdings',
      recentTrades: 'Recent Trades',
      strategyNotes: 'Strategy Notes',
      currentStrategy: 'Current Strategy',
      currentStrategyText: 'Weekly DCA in BTC and ETH. Maintaining defensive position with 15% in stables.',
      nextMoves: 'Next Moves',
      nextMovesText: 'Monitor support at $65K BTC. If broken, increase stables to 25%.',
      yieldTitle: 'Stablecoin Yields',
      yieldSubtitle: 'Best opportunities to earn yield on your stablecoins',
      yieldNote: 'APYs are approximate and may vary according to market conditions.',
      stakingTitle: 'Staking',
      stakingSubtitle: 'Generate passive income with your tokens',
      stakingNote: 'APYs are approximate and may vary according to market and network conditions.',
      asset: 'Asset',
      apyApprox: 'APY Approx.',
      platform: 'Platform',
      action: 'Action',
      disclaimer: 'This portfolio is for educational purposes only. Past performance does not guarantee future results.',
      backToHome: 'Back to Home',
      updated: 'Updated',
      goToVault: 'Go to Vault',
    }
  }[language];

  const tabLabels = {
    es: { portfolio: 'Portfolio', yield: 'Yield Stablecoins', staking: 'Staking' },
    en: { portfolio: 'Portfolio', yield: 'Stablecoin Yields', staking: 'Staking' }
  }[language];

  const portfolioData = {
    totalValue: 50000,
    monthlyReturn: 12,
    monthlyReturnValue: 5500,
    lastUpdated: new Date().toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })
  };

  const holdings = [
    { name: 'Bitcoin', symbol: 'BTC', allocation: 35, value: 17500, change24h: -3.86, color: '#F7931A' },
    { name: 'Ethereum', symbol: 'ETH', allocation: 25, value: 12500, change24h: -5.27, color: '#627EEA' },
    { name: 'Solana', symbol: 'SOL', allocation: 20, value: 10000, change24h: -7.27, color: '#14F195' },
    { name: 'USDC', symbol: 'USDC', allocation: 15, value: 7500, change24h: 0.01, color: '#2775CA' },
    { name: 'Altcoins', symbol: 'ALTS', allocation: 5, value: 2500, change24h: -2.15, color: '#8B5CF6' }
  ];

  const performanceHistory = [
    { month: 'Sep', value: 8.2 },
    { month: 'Oct', value: -4.5 },
    { month: 'Nov', value: 15.3 },
    { month: 'Dec', value: 22.1 },
    { month: 'Jan', value: 5.8 },
    { month: 'Feb', value: 12.0 }
  ];

  const recentTrades = [
    { type: 'buy', asset: 'BTC', amount: '$2,500', date: 'Feb 1', reason: 'DCA' },
    { type: 'sell', asset: 'DOGE', amount: '$500', date: 'Jan 28', reason: 'Take profit' },
    { type: 'buy', asset: 'ETH', amount: '$1,000', date: 'Jan 25', reason: 'Dip buy' },
    { type: 'buy', asset: 'SOL', amount: '$750', date: 'Jan 20', reason: 'Rebalance' }
  ];

  const tabs = [
    { id: 'portfolio', label: tabLabels.portfolio, icon: Wallet },
    { id: 'yield', label: tabLabels.yield, icon: Coins },
    { id: 'staking', label: tabLabels.staking, icon: PiggyBank }
  ];

  return (
    <div className="min-h-screen py-12 relative" data-testid="portfolio-page">
      <OwlSeal position="bottom-right" size="lg" opacity={0.6} className="fixed" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-4 transition-colors">
            <ChevronRight size={16} className="rotate-180" /> {tx.backToHome}
          </Link>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-bold text-white" data-testid="portfolio-heading">
                  {tx.title}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 text-sm font-bold">
                  <Crown size={14} />
                  Premium
                </span>
              </div>
              <p className="text-gray-400">{tx.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <RefreshCw size={14} />
              {tx.updated}: {portfolioData.lastUpdated}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-1 bg-gray-800/50 rounded-xl border border-gray-700/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`tab-${tab.id}`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Section */}
        {activeTab === 'portfolio' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass-card rounded-2xl p-6 col-span-1 md:col-span-2">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">{tx.totalValue}</div>
                    <div className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }} data-testid="portfolio-value">
                      ${portfolioData.totalValue.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-sm mb-1">{tx.monthlyReturn}</div>
                    <div className="text-2xl font-bold flex items-center gap-1 text-emerald-400" data-testid="monthly-return">
                      <TrendingUp size={24} />
                      +{portfolioData.monthlyReturn}%
                    </div>
                    <div className="text-gray-500 text-sm">+${portfolioData.monthlyReturnValue.toLocaleString()}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-bold text-gray-400 mb-3">{tx.performance}</h3>
                  <div className="flex items-end gap-2 h-24">
                    {performanceHistory.map((month) => (
                      <div key={month.month} className="flex-1 flex flex-col items-center">
                        <div 
                          className={`w-full rounded-t transition-all ${month.value >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                          style={{ height: `${Math.abs(month.value) * 3}px`, minHeight: '4px' }}
                        />
                        <div className="text-xs text-gray-500 mt-2">{month.month}</div>
                        <div className={`text-xs font-bold ${month.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {month.value > 0 ? '+' : ''}{month.value}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-sm font-bold text-gray-400 mb-4">{tx.allocation}</h3>
                <div className="space-y-3">
                  {holdings.map((h) => (
                    <div key={h.symbol} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: h.color }} />
                      <span className="text-gray-300 flex-1">{h.symbol}</span>
                      <span className="text-white font-bold">{h.allocation}%</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="flex h-4 rounded-full overflow-hidden">
                    {holdings.map((h) => (
                      <div key={h.symbol} style={{ width: `${h.allocation}%`, backgroundColor: h.color }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 mb-8" data-testid="holdings-table">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Wallet className="text-emerald-500" /> {tx.holdings}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Asset</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Allocation</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Value</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">24h Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding) => (
                      <tr key={holding.symbol} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: `${holding.color}30` }}>
                              {holding.symbol.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-white">{holding.name}</div>
                              <div className="text-gray-500 text-sm">{holding.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${holding.allocation}%`, backgroundColor: holding.color }} />
                            </div>
                            <span className="text-white font-bold w-10">{holding.allocation}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-white font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            ${holding.value.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={`font-bold ${holding.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {holding.change24h >= 0 ? '+' : ''}{holding.change24h}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="text-emerald-500" /> {tx.recentTrades}
                </h2>
                <div className="space-y-3">
                  {recentTrades.map((trade, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${trade.type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {trade.type === 'buy' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        </div>
                        <div>
                          <div className="text-white font-medium">{trade.type.toUpperCase()} {trade.asset}</div>
                          <div className="text-gray-500 text-xs">{trade.reason}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{trade.amount}</div>
                        <div className="text-gray-500 text-xs">{trade.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">{tx.strategyNotes}</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <h3 className="font-bold text-emerald-400 mb-1">{tx.currentStrategy}</h3>
                    <p className="text-gray-300 text-sm">{tx.currentStrategyText}</p>
                  </div>
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <h3 className="font-bold text-amber-400 mb-1">{tx.nextMoves}</h3>
                    <p className="text-gray-300 text-sm">{tx.nextMovesText}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Yield Stablecoins Section */}
        {activeTab === 'yield' && (
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Coins className="text-emerald-500" /> {tx.yieldTitle}
                </h2>
                <p className="text-gray-400 text-sm mt-1">{tx.yieldSubtitle}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {yieldProtocols.map((protocol) => (
                <div key={protocol.name} className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:border-emerald-500/50 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    {YIELD_LOGOS[protocol.name.replace(' HLP', '')] ? (
                      <img 
                        src={YIELD_LOGOS[protocol.name.replace(' HLP', '')]} 
                        alt={protocol.name}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-600"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center text-white font-bold">
                        {protocol.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-sm">{protocol.name}</h3>
                      <span className="text-cyan-400 text-xs">{protocol.chain}</span>
                    </div>
                    <span className="text-2xl font-black text-emerald-400">{protocol.apy}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-4 leading-relaxed">{protocol.desc}</p>
                  <a href={protocol.link} target="_blank" rel="noopener noreferrer" className="block w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium text-center transition-colors">
                    {tx.goToVault} →
                  </a>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-amber-400 text-sm">
                <strong>Nota:</strong> {tx.yieldNote}
              </p>
            </div>
          </div>
        )}

        {/* Staking Section */}
        {activeTab === 'staking' && (
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <PiggyBank className="text-emerald-500" /> {tx.stakingTitle}
                </h2>
                <p className="text-gray-400 text-sm mt-1">{tx.stakingSubtitle}</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">{tx.asset}</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">{tx.apyApprox}</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">{tx.platform}</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">{tx.action}</th>
                  </tr>
                </thead>
                <tbody>
                  {stakingTokens.map((token) => (
                    <tr key={token.symbol} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {STAKING_LOGOS[token.symbol] ? (
                            <img src={STAKING_LOGOS[token.symbol]} alt={token.symbol} className="w-10 h-10 rounded-full" />
                          ) : (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: token.chainColor }}>
                              {token.symbol.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-white">{token.name}</div>
                            <div className="text-gray-500 text-sm">{token.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-emerald-400 font-bold text-lg">{token.apy}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-gray-300">{token.platform}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <a 
                          href={token.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Stake <ExternalLink size={14} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 text-sm">
                <strong>Nota:</strong> {tx.stakingNote}
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-900/50 border border-gray-800 rounded-xl text-center">
          <p className="text-xs text-gray-500">{tx.disclaimer}</p>
        </div>
      </div>
    </div>
  );
}
