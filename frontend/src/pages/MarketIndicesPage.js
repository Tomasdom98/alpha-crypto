import { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, ChevronRight, Target, ShieldCheck, AlertTriangle, Zap, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import OwlSeal from '@/components/OwlSeal';
import { useLanguage } from '@/context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Generate mock historical data for sparklines
const generateSparklineData = (trend, volatility = 0.1) => {
  const points = 30;
  let value = 50;
  const data = [];
  
  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.5) * volatility * 20;
    const trendAdjust = trend === 'up' ? 0.3 : trend === 'down' ? -0.3 : 0;
    value = Math.max(10, Math.min(90, value + change + trendAdjust));
    data.push({ value: Math.round(value) });
  }
  return data;
};

// Generate larger chart data for market cap charts
const generateLargeChartData = (trend, days = 90) => {
  const data = [];
  let value = trend === 'stable' ? 50 : 30;
  
  for (let i = 0; i < days; i++) {
    const volatility = trend === 'stable' ? 0.02 : 0.08;
    const change = (Math.random() - 0.5) * volatility * 20;
    const trendAdjust = trend === 'up' ? 0.2 : trend === 'stable' ? 0.02 : 0;
    value = Math.max(20, Math.min(80, value + change + trendAdjust));
    data.push({ 
      day: i + 1,
      value: Math.round(value * 10) / 10 
    });
  }
  return data;
};

// Mini Sparkline Component
function Sparkline({ data, color, height = 40 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={1.5}
          fill={`url(#gradient-${color})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function MarketIndicesPage() {
  const [fearGreed, setFearGreed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalData, setGlobalData] = useState(null);
  const [stablecoinData, setStablecoinData] = useState(null);
  const [defiTvl, setDefiTvl] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const { language } = useLanguage();

  // Translations
  const tx = {
    es: {
      backToHome: 'Volver al Inicio',
      dashboardTitle: 'Dashboard de Índices',
      dashboardSubtitle: 'Vista completa de indicadores de mercado con señales accionables',
      macroCalendar: 'Calendario Macro',
      recommendation: 'Recomendación Alpha Crypto',
      buyZone: 'ZONA DE COMPRA',
      sellZone: 'ZONA DE VENTA',
      holdZone: 'ZONA DE HOLD',
      buyDesc: 'Múltiples indicadores sugieren oportunidad de acumulación. Considera DCA en tus posiciones.',
      sellDesc: 'Se aconseja precaución. Considera tomar ganancias parciales y reducir exposición.',
      holdDesc: 'Señales mixtas. Mantén posiciones actuales y espera dirección más clara.',
      marketOverview: 'Market Overview',
      updated: 'Actualizado',
      totalMarketCap: 'Total Market Cap',
      totalMarketCapDesc: 'Capitalización total crypto',
      stablecoinMarketCap: 'Stablecoin Market Cap',
      defiTvl: 'DeFi TVL',
      totalValueLocked: 'Total Value Locked',
      capitalInDefi: 'Capital en protocolos DeFi',
      btcDominance: 'BTC Dominance',
      onChainMetrics: 'Métricas On-Chain',
      sentimentIndicators: 'Indicadores de Sentimiento',
      liquidityMetrics: 'Métricas de Liquidez',
      marketStructure: 'Estructura de Mercado',
      source: 'Fuente',
      loading: 'Cargando datos de mercado...',
      disclaimer: 'Estas señales son solo para propósitos informativos y no constituyen asesoramiento financiero. Siempre haz tu propia investigación (DYOR) antes de tomar decisiones de inversión.',
      // Metrics
      mvrvName: 'MVRV Z-Score',
      mvrvNeutral: 'Mercado valorado de forma justa. Ni sobrecomprado ni sobrevendido.',
      nuplName: 'NUPL',
      nuplOptimism: 'Optimismo',
      nuplDesc: 'Zona de toma de ganancias. Considera profits parciales en grandes ganancias.',
      realizedPrice: 'Realized Price',
      realizedPriceDesc: 'Precio actual sobre realizado = mercado en profit, tendencia saludable.',
      puellMultiple: 'Puell Multiple',
      puellDesc: 'Ingresos de mineros estables. En observación para señales extremas.',
      fearGreedIndex: 'Fear & Greed Index',
      fearGreedLow: 'Miedo extremo = históricamente mejor momento para acumular.',
      fearGreedHigh: 'Codicia extrema = precaución, considera tomar ganancias.',
      fearGreedNeutral: 'Sentimiento de mercado equilibrado.',
      rainbowChart: 'Bitcoin Rainbow Chart',
      rainbowDesc: 'Zona azul/verde sugiere buena oportunidad de acumulación.',
      ssrName: 'Stablecoin Supply Ratio',
      ssrDesc: 'Bajo SSR = mucho poder de compra al margen listo para desplegar.',
      exchangeReserves: 'Exchange Reserves',
      exchangeReservesDesc: 'Monedas saliendo de exchanges = acumulación, menos presión vendedora.',
      defiTvlDesc: 'TVL creciente indica confianza y actividad en el ecosistema DeFi.',
      btcDomDesc: 'Dominancia estable. Espera tendencia clara antes de rotar a alts.',
      altSeasonIndex: 'Altcoin Season Index',
      altSeasonDesc: 'Aún no es altseason. En observación hasta índice > 75 para rotar a alts.',
      totalMcapDesc: 'Mercado creciendo de forma constante. Tendencia alcista saludable.',
      // Labels
      accumulate: 'Acumular',
      buyZoneLabel: 'Zona de Compra',
      neutral: 'Neutral',
      bullish: 'Alcista',
      decreasing: 'Decreciendo',
      bitcoinSeason: 'Bitcoin Season',
      hold: 'Hold',
      buy: 'Buy',
      sell: 'Sell',
      watchlist: 'Watchlist',
    },
    en: {
      backToHome: 'Back to Home',
      dashboardTitle: 'Indices Dashboard',
      dashboardSubtitle: 'Complete view of market indicators with actionable signals',
      macroCalendar: 'Macro Calendar',
      recommendation: 'Alpha Crypto Recommendation',
      buyZone: 'BUY ZONE',
      sellZone: 'SELL ZONE',
      holdZone: 'HOLD ZONE',
      buyDesc: 'Multiple indicators suggest accumulation opportunity. Consider DCA into your positions.',
      sellDesc: 'Caution advised. Consider taking partial profits and reducing exposure.',
      holdDesc: 'Mixed signals. Maintain current positions and wait for clearer direction.',
      marketOverview: 'Market Overview',
      updated: 'Updated',
      totalMarketCap: 'Total Market Cap',
      totalMarketCapDesc: 'Total crypto capitalization',
      stablecoinMarketCap: 'Stablecoin Market Cap',
      defiTvl: 'DeFi TVL',
      totalValueLocked: 'Total Value Locked',
      capitalInDefi: 'Capital in DeFi protocols',
      btcDominance: 'BTC Dominance',
      onChainMetrics: 'On-Chain Metrics',
      sentimentIndicators: 'Sentiment Indicators',
      liquidityMetrics: 'Liquidity Metrics',
      marketStructure: 'Market Structure',
      source: 'Source',
      loading: 'Loading market data...',
      disclaimer: 'These signals are for informational purposes only and do not constitute financial advice. Always do your own research (DYOR) before making investment decisions.',
      // Metrics
      mvrvName: 'MVRV Z-Score',
      mvrvNeutral: 'Market fairly valued. Neither overbought nor oversold.',
      nuplName: 'NUPL',
      nuplOptimism: 'Optimism',
      nuplDesc: 'Profit-taking zone. Consider partial profits on large gains.',
      realizedPrice: 'Realized Price',
      realizedPriceDesc: 'Current price above realized = market in profit, healthy trend.',
      puellMultiple: 'Puell Multiple',
      puellDesc: 'Miner income stable. Watching for extreme signals.',
      fearGreedIndex: 'Fear & Greed Index',
      fearGreedLow: 'Extreme fear = historically best time to accumulate.',
      fearGreedHigh: 'Extreme greed = caution, consider taking profits.',
      fearGreedNeutral: 'Balanced market sentiment.',
      rainbowChart: 'Bitcoin Rainbow Chart',
      rainbowDesc: 'Blue/green zone suggests good accumulation opportunity.',
      ssrName: 'Stablecoin Supply Ratio',
      ssrDesc: 'Low SSR = lots of buying power on the sidelines ready to deploy.',
      exchangeReserves: 'Exchange Reserves',
      exchangeReservesDesc: 'Coins leaving exchanges = accumulation, less selling pressure.',
      defiTvlDesc: 'Rising TVL indicates confidence and activity in the DeFi ecosystem.',
      btcDomDesc: 'Stable dominance. Wait for clear trend before rotating to alts.',
      altSeasonIndex: 'Altcoin Season Index',
      altSeasonDesc: 'Not altseason yet. Watching until index > 75 to rotate to alts.',
      totalMcapDesc: 'Market growing steadily. Healthy bullish trend.',
      // Labels
      accumulate: 'Accumulate',
      buyZoneLabel: 'Buy Zone',
      neutral: 'Neutral',
      bullish: 'Bullish',
      decreasing: 'Decreasing',
      bitcoinSeason: 'Bitcoin Season',
      hold: 'Hold',
      buy: 'Buy',
      sell: 'Sell',
      watchlist: 'Watchlist',
    }
  }[language];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fgRes, globalRes, stableRes, tvlRes] = await Promise.all([
          axios.get(`${API}/crypto/fear-greed`),
          axios.get(`${API}/crypto/global`),
          axios.get(`${API}/crypto/stablecoins`),
          axios.get(`${API}/crypto/defi-tvl`)
        ]);
        setFearGreed(fgRes.data);
        setGlobalData(globalRes.data);
        setStablecoinData(stableRes.data);
        setDefiTvl(tvlRes.data);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // Refresh every 2 minutes
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, []);

  // Format large numbers
  const formatNumber = (num, decimals = 2) => {
    if (!num) return '--';
    if (num >= 1e12) return `$${(num / 1e12).toFixed(decimals)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`;
    return `$${num.toFixed(decimals)}`;
  };

  // Time ago helper
  const getTimeAgo = (date) => {
    if (!date) return '';
    const mins = Math.floor((new Date() - date) / 60000);
    if (mins < 1) return language === 'es' ? 'Actualizado ahora' : 'Updated now';
    if (mins < 60) return language === 'es' ? `Actualizado hace ${mins} min` : `Updated ${mins} min ago`;
    return language === 'es' ? `Actualizado hace ${Math.floor(mins / 60)}h` : `Updated ${Math.floor(mins / 60)}h ago`;
  };

  const onChainMetrics = [
    {
      id: 'mvrv',
      name: tx.mvrvName,
      value: '2.3',
      status: 'neutral',
      signal: tx.hold,
      explanation: tx.mvrvNeutral,
      icon: Activity,
      sparklineData: generateSparklineData('neutral', 0.15),
      sparklineColor: '#eab308'
    },
    {
      id: 'nupl',
      name: tx.nuplName,
      value: '62%',
      status: 'bullish',
      signal: tx.hold,
      label: tx.nuplOptimism,
      explanation: tx.nuplDesc,
      icon: TrendingUp,
      sparklineData: generateSparklineData('up', 0.1),
      sparklineColor: '#10b981'
    },
    {
      id: 'realized-price',
      name: tx.realizedPrice,
      value: '$28,450',
      status: 'bullish',
      signal: tx.buy,
      explanation: tx.realizedPriceDesc,
      icon: BarChart3,
      sparklineData: generateSparklineData('up', 0.08),
      sparklineColor: '#10b981'
    },
    {
      id: 'puell',
      name: tx.puellMultiple,
      value: '1.2',
      status: 'neutral',
      signal: tx.watchlist,
      explanation: tx.puellDesc,
      icon: Zap,
      sparklineData: generateSparklineData('neutral', 0.12),
      sparklineColor: '#06b6d4'
    }
  ];

  const sentimentMetrics = [
    {
      id: 'fear-greed',
      name: tx.fearGreedIndex,
      value: fearGreed?.value || 14,
      label: fearGreed?.classification || 'Extreme Fear',
      status: (fearGreed?.value || 14) < 25 ? 'bullish' : (fearGreed?.value || 14) > 75 ? 'bearish' : 'neutral',
      signal: (fearGreed?.value || 14) < 25 ? tx.buy : (fearGreed?.value || 14) > 75 ? tx.sell : tx.hold,
      explanation: (fearGreed?.value || 14) < 25 
        ? tx.fearGreedLow 
        : (fearGreed?.value || 14) > 75 
        ? tx.fearGreedHigh 
        : tx.fearGreedNeutral,
      icon: Activity,
      sparklineData: generateSparklineData('down', 0.2),
      sparklineColor: '#ef4444'
    },
    {
      id: 'rainbow',
      name: tx.rainbowChart,
      value: tx.accumulate,
      status: 'bullish',
      signal: tx.buy,
      explanation: tx.rainbowDesc,
      icon: TrendingUp,
      sparklineData: generateSparklineData('up', 0.1),
      sparklineColor: '#10b981'
    }
  ];

  const liquidityMetrics = [
    {
      id: 'ssr',
      name: tx.ssrName,
      value: '8.2%',
      status: 'bullish',
      signal: tx.buy,
      explanation: tx.ssrDesc,
      icon: DollarSign,
      sparklineData: generateSparklineData('down', 0.1),
      sparklineColor: '#10b981'
    },
    {
      id: 'reserves',
      name: tx.exchangeReserves,
      value: '2.1M BTC',
      status: 'bullish',
      label: tx.decreasing,
      signal: tx.hold,
      explanation: tx.exchangeReservesDesc,
      icon: BarChart3,
      sparklineData: generateSparklineData('down', 0.08),
      sparklineColor: '#10b981'
    },
    {
      id: 'defi-tvl',
      name: tx.defiTvl,
      value: '$85.2B',
      status: 'bullish',
      label: '+5.2%',
      signal: tx.hold,
      explanation: tx.defiTvlDesc,
      icon: TrendingUp,
      sparklineData: generateSparklineData('up', 0.12),
      sparklineColor: '#10b981'
    }
  ];

  const marketStructure = [
    {
      id: 'btc-dom',
      name: tx.btcDominance,
      value: '52.3%',
      status: 'neutral',
      signal: tx.hold,
      explanation: tx.btcDomDesc,
      icon: Activity,
      sparklineData: generateSparklineData('neutral', 0.05),
      sparklineColor: '#eab308'
    },
    {
      id: 'alt-season',
      name: tx.altSeasonIndex,
      value: '45',
      status: 'neutral',
      label: tx.bitcoinSeason,
      signal: tx.watchlist,
      explanation: tx.altSeasonDesc,
      icon: TrendingDown,
      sparklineData: generateSparklineData('neutral', 0.15),
      sparklineColor: '#06b6d4'
    },
    {
      id: 'total-mcap',
      name: tx.totalMarketCap,
      value: '$2.15T',
      status: 'bullish',
      label: '+2.3%',
      signal: tx.hold,
      explanation: tx.totalMcapDesc,
      icon: BarChart3,
      sparklineData: generateSparklineData('up', 0.1),
      sparklineColor: '#10b981'
    }
  ];

  const calculateRecommendation = () => {
    const allMetrics = [...onChainMetrics, ...sentimentMetrics, ...liquidityMetrics, ...marketStructure];
    const buyCount = allMetrics.filter(m => m.signal === tx.buy).length;
    const sellCount = allMetrics.filter(m => m.signal === tx.sell).length;
    const holdCount = allMetrics.filter(m => m.signal === tx.hold).length;
    
    if (buyCount > sellCount && buyCount >= holdCount) {
      return { zone: tx.buyZone, color: 'emerald', icon: Target, description: tx.buyDesc };
    }
    if (sellCount > buyCount && sellCount >= holdCount) {
      return { zone: tx.sellZone, color: 'red', icon: AlertTriangle, description: tx.sellDesc };
    }
    return { zone: tx.holdZone, color: 'amber', icon: ShieldCheck, description: tx.holdDesc };
  };

  const recommendation = calculateRecommendation();

  const getStatusColor = (status) => {
    if (status === 'bullish') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (status === 'bearish') return 'text-red-400 bg-red-500/10 border-red-500/30';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  };

  const getSignalColor = (signal) => {
    if (signal === 'Buy') return 'text-emerald-400 bg-emerald-500/20';
    if (signal === 'Sell') return 'text-red-400 bg-red-500/20';
    if (signal === 'Watchlist') return 'text-cyan-400 bg-cyan-500/20';
    return 'text-amber-400 bg-amber-500/20';
  };

  const getFearGreedColor = () => {
    const value = fearGreed?.value || 50;
    if (value < 25) return '#ef4444';
    if (value < 45) return '#f97316';
    if (value < 55) return '#eab308';
    if (value < 75) return '#22c55e';
    return '#10b981';
  };

  const gaugeData = [
    { name: 'Value', value: fearGreed?.value || 50 },
    { name: 'Remaining', value: 100 - (fearGreed?.value || 50) },
  ];

  const renderMetricCard = (metric, index) => {
    const Icon = metric.icon;
    return (
      <div
        key={metric.id}
        data-testid={`metric-${metric.id}`}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/30"
      >
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <Icon className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />
              </div>
              <h3 className="text-sm font-bold text-white">{metric.name}</h3>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-bold ${getSignalColor(metric.signal)}`}>
              {metric.signal}
            </span>
          </div>

          {/* Value and Sparkline Row */}
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="text-2xl font-bold text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {metric.value}
              </div>
              {metric.label && (
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border mt-1 ${getStatusColor(metric.status)}`}>
                  {metric.label}
                </span>
              )}
            </div>
            {/* Mini Sparkline */}
            <div className="w-24 h-10">
              <Sparkline data={metric.sparklineData} color={metric.sparklineColor} height={40} />
            </div>
          </div>

          {/* Explanation */}
          <p className="text-xs text-gray-400 leading-relaxed border-t border-gray-700/50 pt-3">
            {metric.explanation}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4" />
          <div className="text-emerald-500 text-xl font-semibold">Cargando datos de mercado...</div>
        </div>
      </div>
    );
  }

  const RecommendationIcon = recommendation.icon;

  return (
    <div className="min-h-screen py-12 relative">
      {/* Owl Seal */}
      <OwlSeal position="bottom-right" size="lg" opacity={0.6} className="fixed" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-4 transition-colors">
            <ChevronRight size={16} className="rotate-180" /> Volver al Inicio
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" data-testid="indices-page-heading" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Dashboard de Índices
              </h1>
              <p className="text-gray-400 text-lg">Vista completa de indicadores de mercado con señales accionables</p>
            </div>
            <Link 
              to="/calendar"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 hover:text-purple-300 transition-all"
            >
              <Clock size={18} />
              <span className="font-medium">Calendario Macro</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {/* Main Recommendation Card */}
        <div className={`mb-10 relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-${recommendation.color}-500/50 p-8`} data-testid="recommendation-card">
          <div className={`absolute inset-0 bg-gradient-to-br from-${recommendation.color}-500/10 to-transparent`} />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-xl bg-${recommendation.color}-500/20 border border-${recommendation.color}-500/30`}>
                    <RecommendationIcon className={`w-8 h-8 text-${recommendation.color}-400`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Recomendación Alpha Crypto</p>
                    <h2 className={`text-3xl md:text-4xl font-black text-${recommendation.color}-400`}>
                      {recommendation.zone}
                    </h2>
                  </div>
                </div>
                <p className="text-gray-300 max-w-2xl">{recommendation.description}</p>
              </div>
              
              {/* Mini Fear & Greed Gauge */}
              <div className="glass-card rounded-xl p-4 min-w-[180px]">
                <p className="text-xs text-gray-400 text-center mb-2">Fear & Greed</p>
                <div className="relative">
                  <ResponsiveContainer width="100%" height={100}>
                    <PieChart>
                      <Pie data={gaugeData} cx="50%" cy="50%" startAngle={180} endAngle={0} innerRadius={35} outerRadius={48} dataKey="value" stroke="none">
                        <Cell fill={getFearGreedColor()} />
                        <Cell fill="#1f2937" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: '25%' }}>
                    <div className="text-2xl font-black text-white">{fearGreed?.value || 50}</div>
                    <div className="text-xs text-gray-400">{fearGreed?.classification || 'Neutral'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Signal Summary */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          <div className="glass-card rounded-xl p-4 text-center border border-emerald-500/30">
            <div className="text-3xl font-black text-emerald-400">
              {[...onChainMetrics, ...sentimentMetrics, ...liquidityMetrics, ...marketStructure].filter(m => m.signal === 'Buy').length}
            </div>
            <div className="text-sm text-gray-400">Buy</div>
          </div>
          <div className="glass-card rounded-xl p-4 text-center border border-amber-500/30">
            <div className="text-3xl font-black text-amber-400">
              {[...onChainMetrics, ...sentimentMetrics, ...liquidityMetrics, ...marketStructure].filter(m => m.signal === 'Hold').length}
            </div>
            <div className="text-sm text-gray-400">Hold</div>
          </div>
          <div className="glass-card rounded-xl p-4 text-center border border-red-500/30">
            <div className="text-3xl font-black text-red-400">
              {[...onChainMetrics, ...sentimentMetrics, ...liquidityMetrics, ...marketStructure].filter(m => m.signal === 'Sell').length}
            </div>
            <div className="text-sm text-gray-400">Sell</div>
          </div>
          <div className="glass-card rounded-xl p-4 text-center border border-cyan-500/30">
            <div className="text-3xl font-black text-cyan-400">
              {[...onChainMetrics, ...sentimentMetrics, ...liquidityMetrics, ...marketStructure].filter(m => m.signal === 'Watchlist').length}
            </div>
            <div className="text-sm text-gray-400">Watchlist</div>
          </div>
        </div>

        {/* Large Market Charts Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="text-emerald-500" size={24} />
              Market Overview
            </h2>
            {lastUpdate && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={12} />
                {getTimeAgo(lastUpdate)}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Total Market Cap Chart */}
            <div className="glass-card rounded-2xl p-6 border border-gray-700/50 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Total Market Cap</h3>
                  <p className="text-sm text-gray-400">Capitalización total crypto</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {globalData ? formatNumber(globalData.total_market_cap_usd) : '$--'}
                  </div>
                  {globalData && (
                    <span className={`text-xs ${globalData.market_cap_change_24h >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'} px-2 py-0.5 rounded-full`}>
                      {globalData.market_cap_change_24h >= 0 ? '+' : ''}{globalData.market_cap_change_24h}%
                    </span>
                  )}
                </div>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={generateLargeChartData('up', 90)}>
                    <defs>
                      <linearGradient id="totalMcapGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fill="url(#totalMcapGradient)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-3 border-t border-gray-700/50 pt-3">
                <span>BTC Dominance: {globalData?.btc_dominance || '--'}%</span>
                <span>ETH: {globalData?.eth_dominance || '--'}%</span>
              </div>
            </div>

            {/* Stablecoin Market Cap with Distribution */}
            <div className="glass-card rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Stablecoin Market Cap</h3>
                  <p className="text-sm text-gray-400">USDT, USDC, DAI, etc.</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-blue-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {stablecoinData ? formatNumber(stablecoinData.total_market_cap) : '$--'}
                  </div>
                </div>
              </div>
              {/* Stablecoin Distribution Bar Chart */}
              <div className="h-40">
                {stablecoinData?.top_stablecoins ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stablecoinData.top_stablecoins.slice(0, 5)} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="symbol" tick={{ fill: '#9ca3af', fontSize: 11 }} width={50} />
                      <Tooltip 
                        content={({ payload }) => {
                          if (payload && payload[0]) {
                            return (
                              <div className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs">
                                <span className="text-white">{payload[0].payload.name}: </span>
                                <span className="text-blue-400">{payload[0].payload.percentage}%</span>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="percentage" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">Cargando...</div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-3 border-t border-gray-700/50 pt-3">
                Fuente: DefiLlama • {stablecoinData?.source || 'API'}
              </p>
            </div>

            {/* DeFi TVL Chart */}
            <div className="glass-card rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">DeFi TVL</h3>
                  <p className="text-sm text-gray-400">Total Value Locked</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-purple-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {defiTvl ? formatNumber(defiTvl.total_tvl) : '$--'}
                  </div>
                  {defiTvl && (
                    <span className={`text-xs ${defiTvl.change_24h >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'} px-2 py-0.5 rounded-full`}>
                      {defiTvl.change_24h >= 0 ? '+' : ''}{defiTvl.change_24h}%
                    </span>
                  )}
                </div>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={generateLargeChartData('up', 90)}>
                    <defs>
                      <linearGradient id="defiTvlGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#a855f7" 
                      strokeWidth={2}
                      fill="url(#defiTvlGradient)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-500 mt-3 border-t border-gray-700/50 pt-3">
                Capital en protocolos DeFi • {defiTvl?.source || 'DefiLlama'}
              </p>
            </div>
          </div>
        </section>

        {/* On-Chain Metrics */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="text-emerald-500" size={24} />
            Métricas On-Chain
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {onChainMetrics.map((m, i) => renderMetricCard(m, i))}
          </div>
        </section>

        {/* Sentiment */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="text-emerald-500" size={24} />
            Indicadores de Sentimiento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sentimentMetrics.map((m, i) => renderMetricCard(m, i))}
          </div>
        </section>

        {/* Liquidity */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign className="text-emerald-500" size={24} />
            Métricas de Liquidez
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liquidityMetrics.map((m, i) => renderMetricCard(m, i))}
          </div>
        </section>

        {/* Market Structure */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="text-emerald-500" size={24} />
            Estructura de Mercado
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketStructure.map((m, i) => renderMetricCard(m, i))}
          </div>
        </section>

        {/* Disclaimer */}
        <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
          <p className="text-sm text-gray-500">
            <strong className="text-gray-400">Disclaimer:</strong> Estas señales son solo para propósitos informativos y no constituyen asesoramiento financiero. Siempre haz tu propia investigación (DYOR) antes de tomar decisiones de inversión.
          </p>
        </div>
      </div>
    </div>
  );
}
