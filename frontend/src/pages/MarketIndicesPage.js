import { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, ChevronRight, Target, ShieldCheck, AlertTriangle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import OwlSeal from '@/components/OwlSeal';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fgRes = await axios.get(`${API}/crypto/fear-greed`);
        setFearGreed(fgRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const onChainMetrics = [
    {
      id: 'mvrv',
      name: 'MVRV Z-Score',
      value: '2.3',
      status: 'neutral',
      signal: 'Hold',
      explanation: 'Mercado valorado de forma justa. Ni sobrecomprado ni sobrevendido.',
      icon: Activity,
      sparklineData: generateSparklineData('neutral', 0.15),
      sparklineColor: '#eab308'
    },
    {
      id: 'nupl',
      name: 'NUPL',
      value: '62%',
      status: 'bullish',
      signal: 'Hold',
      explanation: 'Zona de toma de ganancias. Considera profits parciales en grandes ganancias.',
      icon: TrendingUp,
      sparklineData: generateSparklineData('up', 0.1),
      sparklineColor: '#10b981'
    },
    {
      id: 'realized-price',
      name: 'Realized Price',
      value: '$28,450',
      status: 'bullish',
      signal: 'Buy',
      explanation: 'Precio actual sobre realizado = mercado en profit, tendencia saludable.',
      icon: BarChart3,
      sparklineData: generateSparklineData('up', 0.08),
      sparklineColor: '#10b981'
    },
    {
      id: 'puell',
      name: 'Puell Multiple',
      value: '1.2',
      status: 'neutral',
      signal: 'Hold',
      explanation: 'Ingresos de mineros estables. Sin señales extremas de compra o venta.',
      icon: Zap,
      sparklineData: generateSparklineData('neutral', 0.12),
      sparklineColor: '#eab308'
    }
  ];

  const sentimentMetrics = [
    {
      id: 'fear-greed',
      name: 'Fear & Greed Index',
      value: fearGreed?.value || 14,
      label: fearGreed?.classification || 'Extreme Fear',
      status: (fearGreed?.value || 14) < 25 ? 'bullish' : (fearGreed?.value || 14) > 75 ? 'bearish' : 'neutral',
      signal: (fearGreed?.value || 14) < 25 ? 'Buy' : (fearGreed?.value || 14) > 75 ? 'Sell' : 'Hold',
      explanation: (fearGreed?.value || 14) < 25 
        ? 'Miedo extremo = históricamente mejor momento para acumular.' 
        : (fearGreed?.value || 14) > 75 
        ? 'Codicia extrema = precaución, considera tomar ganancias.' 
        : 'Sentimiento de mercado equilibrado.',
      icon: Activity,
      sparklineData: generateSparklineData('down', 0.2),
      sparklineColor: '#ef4444'
    },
    {
      id: 'rainbow',
      name: 'Bitcoin Rainbow Chart',
      value: 'Acumular',
      status: 'bullish',
      signal: 'Buy',
      explanation: 'Zona azul/verde sugiere buena oportunidad de acumulación.',
      icon: TrendingUp,
      sparklineData: generateSparklineData('up', 0.1),
      sparklineColor: '#10b981'
    }
  ];

  const liquidityMetrics = [
    {
      id: 'ssr',
      name: 'Stablecoin Supply Ratio',
      value: '8.2%',
      status: 'bullish',
      signal: 'Buy',
      explanation: 'Bajo SSR = mucho poder de compra al margen listo para desplegar.',
      icon: DollarSign,
      sparklineData: generateSparklineData('down', 0.1),
      sparklineColor: '#10b981'
    },
    {
      id: 'reserves',
      name: 'Exchange Reserves',
      value: '2.1M BTC',
      status: 'bullish',
      label: 'Decreciendo',
      signal: 'Hold',
      explanation: 'Monedas saliendo de exchanges = acumulación, menos presión vendedora.',
      icon: BarChart3,
      sparklineData: generateSparklineData('down', 0.08),
      sparklineColor: '#10b981'
    },
    {
      id: 'defi-tvl',
      name: 'DeFi TVL',
      value: '$85.2B',
      status: 'bullish',
      label: '+5.2%',
      signal: 'Hold',
      explanation: 'TVL creciente indica confianza y actividad en el ecosistema DeFi.',
      icon: TrendingUp,
      sparklineData: generateSparklineData('up', 0.12),
      sparklineColor: '#10b981'
    }
  ];

  const marketStructure = [
    {
      id: 'btc-dom',
      name: 'Bitcoin Dominance',
      value: '52.3%',
      status: 'neutral',
      signal: 'Hold',
      explanation: 'Dominancia estable. Espera tendencia clara antes de rotar a alts.',
      icon: Activity,
      sparklineData: generateSparklineData('neutral', 0.05),
      sparklineColor: '#eab308'
    },
    {
      id: 'alt-season',
      name: 'Altcoin Season Index',
      value: '45',
      status: 'neutral',
      label: 'Bitcoin Season',
      signal: 'Hold',
      explanation: 'Aún no es altseason. Enfócate en BTC/ETH hasta índice > 75.',
      icon: TrendingDown,
      sparklineData: generateSparklineData('neutral', 0.15),
      sparklineColor: '#eab308'
    },
    {
      id: 'total-mcap',
      name: 'Total Market Cap',
      value: '$2.15T',
      status: 'bullish',
      label: '+2.3%',
      signal: 'Hold',
      explanation: 'Mercado creciendo de forma constante. Tendencia alcista saludable.',
      icon: BarChart3,
      sparklineData: generateSparklineData('up', 0.1),
      sparklineColor: '#10b981'
    }
  ];

  const calculateRecommendation = () => {
    const allMetrics = [...onChainMetrics, ...sentimentMetrics, ...liquidityMetrics, ...marketStructure];
    const buyCount = allMetrics.filter(m => m.signal === 'Buy').length;
    const sellCount = allMetrics.filter(m => m.signal === 'Sell').length;
    const holdCount = allMetrics.filter(m => m.signal === 'Hold').length;
    
    if (buyCount > sellCount && buyCount >= holdCount) {
      return { zone: 'ZONA DE COMPRA', color: 'emerald', icon: Target, description: 'Múltiples indicadores sugieren oportunidad de acumulación. Considera DCA en tus posiciones.' };
    }
    if (sellCount > buyCount && sellCount >= holdCount) {
      return { zone: 'ZONA DE VENTA', color: 'red', icon: AlertTriangle, description: 'Se aconseja precaución. Considera tomar ganancias parciales y reducir exposición.' };
    }
    return { zone: 'ZONA DE HOLD', color: 'amber', icon: ShieldCheck, description: 'Señales mixtas. Mantén posiciones actuales y espera dirección más clara.' };
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" data-testid="indices-page-heading" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Dashboard de Índices
          </h1>
          <p className="text-gray-400 text-lg">Vista completa de indicadores de mercado con señales accionables</p>
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
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="text-emerald-500" size={24} />
            Gráficos de Capitalización
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Total Market Cap Chart */}
            <div className="glass-card rounded-2xl p-6 border border-gray-700/50 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Total Market Cap</h3>
                  <p className="text-sm text-gray-400">Capitalización total crypto</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>$2.15T</div>
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">+2.3%</span>
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
              <p className="text-xs text-gray-500 mt-3 border-t border-gray-700/50 pt-3">
                Datos históricos de los últimos 90 días. Fuente: CoinGecko
              </p>
            </div>

            {/* Stablecoin Market Cap Chart */}
            <div className="glass-card rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Stablecoin Market Cap</h3>
                  <p className="text-sm text-gray-400">USDT, USDC, DAI, etc.</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-blue-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>$162B</div>
                  <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">+0.8%</span>
                </div>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={generateLargeChartData('stable', 90)}>
                    <defs>
                      <linearGradient id="stableMcapGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fill="url(#stableMcapGradient)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-500 mt-3 border-t border-gray-700/50 pt-3">
                Liquidez disponible para entrar al mercado. Fuente: DefiLlama
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
                  <div className="text-2xl font-black text-purple-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>$85.2B</div>
                  <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">+5.2%</span>
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
                Capital bloqueado en protocolos DeFi. Fuente: DefiLlama
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
