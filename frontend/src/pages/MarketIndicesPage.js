import { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, AlertCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  // Mock comprehensive market data
  const onChainMetrics = [
    {
      id: 'mvrv',
      name: 'MVRV Z-Score',
      value: '2.3',
      status: 'neutral',
      description: 'Compares market cap vs realized value. >7 = cycle top, <0 = cycle bottom',
      icon: Activity
    },
    {
      id: 'nupl',
      name: 'NUPL',
      value: '62%',
      status: 'bullish',
      description: 'Net Unrealized Profit/Loss. >75% = euphoria, <0 = capitulation',
      icon: TrendingUp
    },
    {
      id: 'realized-price',
      name: 'Realized Price',
      value: '$28,450',
      status: 'neutral',
      description: 'Average price based on last on-chain movement',
      icon: BarChart3
    }
  ];

  const sentimentMetrics = [
    {
      id: 'fear-greed',
      name: 'Fear & Greed Index',
      value: fearGreed?.value || 14,
      label: fearGreed?.classification || 'Extreme Fear',
      status: 'bullish',
      description: '<25 = extreme fear (buy signal), >75 = extreme greed (caution)',
      icon: Activity
    },
    {
      id: 'rainbow',
      name: 'Bitcoin Rainbow Chart',
      value: 'Accumulate',
      status: 'bullish',
      description: 'Blue/green = accumulation, Orange/red = bubble zone',
      icon: TrendingUp
    }
  ];

  const liquidityMetrics = [
    {
      id: 'ssr',
      name: 'Stablecoin Supply Ratio',
      value: '8.2%',
      status: 'bullish',
      description: 'Low SSR = buying power waiting (bullish)',
      icon: DollarSign
    },
    {
      id: 'reserves',
      name: 'Exchange Reserves',
      value: '2.1M BTC',
      status: 'bullish',
      label: 'Decreasing',
      description: 'Decreasing = accumulation, Increasing = selling pressure',
      icon: BarChart3
    }
  ];

  const marketStructure = [
    {
      id: 'btc-dom',
      name: 'Bitcoin Dominance',
      value: '52.3%',
      status: 'neutral',
      description: 'Rising = risk-off, Falling = altcoin season',
      icon: Activity
    },
    {
      id: 'alt-season',
      name: 'Altcoin Season Index',
      value: '45',
      status: 'neutral',
      label: 'Bitcoin Season',
      description: '>75 = altseason confirmed',
      icon: TrendingDown
    },
    {
      id: 'total-mcap',
      name: 'Total Market Cap',
      value: '$2.15T',
      status: 'bullish',
      label: '+2.3%',
      description: 'Combined value of all cryptocurrencies',
      icon: BarChart3
    }
  ];

  // Calculate overall outlook
  const calculateOutlook = () => {
    const allMetrics = [...onChainMetrics, ...sentimentMetrics, ...liquidityMetrics, ...marketStructure];
    const bullishCount = allMetrics.filter(m => m.status === 'bullish').length;
    const bearishCount = allMetrics.filter(m => m.status === 'bearish').length;
    const neutralCount = allMetrics.filter(m => m.status === 'neutral').length;
    
    if (bullishCount > bearishCount + neutralCount) return { sentiment: 'bullish', label: 'Bullish', color: 'emerald' };
    if (bearishCount > bullishCount + neutralCount) return { sentiment: 'bearish', label: 'Bearish', color: 'red' };
    return { sentiment: 'neutral', label: 'Neutral', color: 'amber' };
  };

  const outlook = calculateOutlook();

  const getStatusColor = (status) => {
    switch (status) {
      case 'bullish':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'bearish':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    }
  };

  const renderMetricCard = (metric, index) => {
    const Icon = metric.icon;
    return (
      <div
        key={metric.id}
        data-testid={`metric-${metric.id}`}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/20 hover:border-emerald-500/50"
        style={{
          animationDelay: `${index * 50}ms`,
          animation: 'fadeInUp 0.6s ease-out forwards',
        }}
      >
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 group-hover:border-emerald-500/30 transition-colors">
                <Icon className="w-5 h-5 text-emerald-400" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {metric.name}
                </h3>
              </div>
            </div>
          </div>

          {/* Value */}
          <div className="mb-4">
            <div className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, monospace' }}>
              {metric.value}
            </div>
            {metric.label && (
              <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(metric.status)}`}>
                {metric.label}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-400 leading-relaxed">
            {metric.description}
          </p>
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4" />
          <div className="text-emerald-500 text-xl font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Loading market data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-4 transition-colors"
          >
            <ChevronRight size={16} className="rotate-180" />
            Back to Home
          </Link>
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-3"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            data-testid="indices-page-heading"
          >
            Market Indices Dashboard
          </h1>
          <p className="text-gray-400 text-lg">Comprehensive view of all market indicators and signals</p>
        </div>

        {/* Overall Market Outlook */}
        <div className="mb-12 relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Overall Market Outlook
                  </h2>
                </div>
                <p className="text-gray-400 mb-6 max-w-2xl">
                  Based on combined signals from {onChainMetrics.length + sentimentMetrics.length + liquidityMetrics.length + marketStructure.length} indicators across on-chain metrics, sentiment, liquidity, and market structure.
                </p>
                <div className="flex items-center gap-4">
                  <span className={`px-6 py-3 rounded-xl text-xl font-bold border ${getStatusColor(outlook.sentiment)}`}>
                    {outlook.label}
                  </span>
                  <div className="text-sm text-gray-500">
                    {calculateOutlook().sentiment === 'bullish' ? '🟢' : calculateOutlook().sentiment === 'bearish' ? '🔴' : '🟡'} Majority of indicators signal {outlook.label.toLowerCase()} conditions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* On-Chain Metrics */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            On-Chain Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {onChainMetrics.map((metric, index) => renderMetricCard(metric, index))}
          </div>
        </section>

        {/* Sentiment */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Sentiment Indicators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sentimentMetrics.map((metric, index) => renderMetricCard(metric, index))}
          </div>
        </section>

        {/* Liquidity */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Liquidity Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {liquidityMetrics.map((metric, index) => renderMetricCard(metric, index))}
          </div>
        </section>

        {/* Market Structure */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Market Structure
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketStructure.map((metric, index) => renderMetricCard(metric, index))}
          </div>
        </section>

        {/* Info Note */}
        <div className="mt-12 p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
          <p className="text-sm text-gray-500 leading-relaxed">
            <strong className="text-gray-400">Note:</strong> These indicators use mock data for demonstration. 
            In production, connect to real data sources like Glassnode, CoinMetrics, or blockchain APIs. 
            You can update values via Sanity CMS or integrate live data feeds.
          </p>
        </div>
      </div>
    </div>
  );
}
