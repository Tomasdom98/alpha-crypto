import { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, AlertCircle, ChevronRight, Target, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
      explanation: 'Market is fairly valued. Neither overbought nor oversold.',
      icon: Activity
    },
    {
      id: 'nupl',
      name: 'NUPL',
      value: '62%',
      status: 'bullish',
      signal: 'Hold',
      explanation: 'Profit-taking zone. Consider partial profits on large gains.',
      icon: TrendingUp
    },
    {
      id: 'realized-price',
      name: 'Realized Price',
      value: '$28,450',
      status: 'bullish',
      signal: 'Buy',
      explanation: 'Current price above realized = market in profit, healthy trend.',
      icon: BarChart3
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
        ? 'Extreme fear = historically best time to accumulate.' 
        : (fearGreed?.value || 14) > 75 
        ? 'Extreme greed = caution, consider taking profits.' 
        : 'Market sentiment is balanced.',
      icon: Activity
    },
    {
      id: 'rainbow',
      name: 'Bitcoin Rainbow Chart',
      value: 'Accumulate',
      status: 'bullish',
      signal: 'Buy',
      explanation: 'Blue/green zone suggests good accumulation opportunity.',
      icon: TrendingUp
    }
  ];

  const liquidityMetrics = [
    {
      id: 'ssr',
      name: 'Stablecoin Supply Ratio',
      value: '8.2%',
      status: 'bullish',
      signal: 'Buy',
      explanation: 'Low SSR = lots of buying power on sidelines ready to deploy.',
      icon: DollarSign
    },
    {
      id: 'reserves',
      name: 'Exchange Reserves',
      value: '2.1M BTC',
      status: 'bullish',
      label: 'Decreasing',
      signal: 'Hold',
      explanation: 'Coins leaving exchanges = accumulation, less selling pressure.',
      icon: BarChart3
    }
  ];

  const marketStructure = [
    {
      id: 'btc-dom',
      name: 'Bitcoin Dominance',
      value: '52.3%',
      status: 'neutral',
      signal: 'Hold',
      explanation: 'Stable dominance. Wait for clear trend before rotating to alts.',
      icon: Activity
    },
    {
      id: 'alt-season',
      name: 'Altcoin Season Index',
      value: '45',
      status: 'neutral',
      label: 'Bitcoin Season',
      signal: 'Hold',
      explanation: 'Not altseason yet. Focus on BTC/ETH until index > 75.',
      icon: TrendingDown
    },
    {
      id: 'total-mcap',
      name: 'Total Market Cap',
      value: '$2.15T',
      status: 'bullish',
      label: '+2.3%',
      signal: 'Hold',
      explanation: 'Market growing steadily. Healthy uptrend in progress.',
      icon: BarChart3
    }
  ];

  const calculateRecommendation = () => {
    const allMetrics = [...onChainMetrics, ...sentimentMetrics, ...liquidityMetrics, ...marketStructure];
    const buyCount = allMetrics.filter(m => m.signal === 'Buy').length;
    const sellCount = allMetrics.filter(m => m.signal === 'Sell').length;
    const holdCount = allMetrics.filter(m => m.signal === 'Hold').length;
    
    if (buyCount > sellCount && buyCount >= holdCount) {
      return { zone: 'BUY ZONE', color: 'emerald', icon: Target, description: 'Multiple indicators suggest accumulation opportunity. Consider DCA into positions.' };
    }
    if (sellCount > buyCount && sellCount >= holdCount) {
      return { zone: 'SELL ZONE', color: 'red', icon: AlertTriangle, description: 'Caution advised. Consider taking partial profits and reducing exposure.' };
    }
    return { zone: 'HOLD ZONE', color: 'amber', icon: ShieldCheck, description: 'Mixed signals. Maintain current positions and wait for clearer direction.' };
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
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/20 hover:border-emerald-500/50"
      >
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
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

          <div className="mb-3">
            <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {metric.value}
            </div>
            {metric.label && (
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(metric.status)}`}>
                {metric.label}
              </span>
            )}
          </div>

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
          <div className="text-emerald-500 text-xl font-semibold">Loading market data...</div>
        </div>
      </div>
    );
  }

  const RecommendationIcon = recommendation.icon;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-4 transition-colors">
            <ChevronRight size={16} className="rotate-180" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" data-testid="indices-page-heading">
            Market Indices Dashboard
          </h1>
          <p className="text-gray-400 text-lg">Comprehensive view of all market indicators and actionable signals</p>
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
                    <p className="text-sm text-gray-400 mb-1">Alpha Crypto Recommendation</p>
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
        <div className="grid grid-cols-3 gap-4 mb-10">
          {['Buy', 'Hold', 'Sell'].map(signal => {
            const allMetrics = [...onChainMetrics, ...sentimentMetrics, ...liquidityMetrics, ...marketStructure];
            const count = allMetrics.filter(m => m.signal === signal).length;
            const color = signal === 'Buy' ? 'emerald' : signal === 'Sell' ? 'red' : 'amber';
            return (
              <div key={signal} className={`glass-card rounded-xl p-4 text-center border border-${color}-500/30`}>
                <div className={`text-3xl font-black text-${color}-400`}>{count}</div>
                <div className="text-sm text-gray-400">{signal} Signals</div>
              </div>
            );
          })}
        </div>

        {/* On-Chain Metrics */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">On-Chain Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {onChainMetrics.map((m, i) => renderMetricCard(m, i))}
          </div>
        </section>

        {/* Sentiment */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">Sentiment Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sentimentMetrics.map((m, i) => renderMetricCard(m, i))}
          </div>
        </section>

        {/* Liquidity */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">Liquidity Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liquidityMetrics.map((m, i) => renderMetricCard(m, i))}
          </div>
        </section>

        {/* Market Structure */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">Market Structure</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketStructure.map((m, i) => renderMetricCard(m, i))}
          </div>
        </section>

        <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
          <p className="text-sm text-gray-500">
            <strong className="text-gray-400">Disclaimer:</strong> These signals are for informational purposes only and do not constitute financial advice. Always do your own research (DYOR) before making investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
