import { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import FearGreedGauge from '@/components/FearGreedGauge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MarketIndicesPage() {
  const [indices, setIndices] = useState(null);
  const [gainersLosers, setGainersLosers] = useState(null);
  const [fearGreed, setFearGreed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [indicesRes, glRes, fgRes] = await Promise.all([
          axios.get(`${API}/market-indices`),
          axios.get(`${API}/market-indices/gainers-losers`),
          axios.get(`${API}/crypto/fear-greed`),
        ]);

        setIndices(indicesRes.data);
        setGainersLosers(glRes.data);
        setFearGreed(fgRes.data);
      } catch (error) {
        console.error('Error fetching market indices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-emerald-500 text-xl font-mono">Loading market data...</div>
      </div>
    );
  }

  // Mock chart data
  const defiTvlData = [
    { date: 'Jan', tvl: 42 },
    { date: 'Feb', tvl: 45 },
    { date: 'Mar', tvl: 44 },
    { date: 'Apr', tvl: 47 },
    { date: 'May', tvl: 48.5 },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl md:text-5xl font-black text-white mb-4"
            style={{ fontFamily: 'Chivo, sans-serif' }}
            data-testid="indices-page-heading"
          >
            Market Indices
          </h1>
          <p className="text-gray-400 text-lg">Real-time market indicators and trends</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Fear & Greed Index */}
          <div className="lg:col-span-5">
            <FearGreedGauge value={fearGreed?.value} classification={fearGreed?.classification} />
          </div>

          {/* Bitcoin Rainbow Chart */}
          <div className="lg:col-span-7 glass-card rounded-xl p-6" data-testid="bitcoin-rainbow-card">
            <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Chivo, sans-serif' }}>
              Bitcoin Rainbow Chart
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Current Position</div>
                  <div className="text-2xl font-bold text-white">{indices?.bitcoin_rainbow.current_position}</div>
                </div>
                <Activity className="text-emerald-500" size={32} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Price Band</div>
                  <div className="text-lg font-bold text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {indices?.bitcoin_rainbow.price_band}
                  </div>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Signal</div>
                  <div className="text-lg font-bold text-emerald-500">{indices?.bitcoin_rainbow.recommendation}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Indices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Altcoin Season Index */}
          <div className="glass-card rounded-xl p-6" data-testid="altcoin-season-card">
            <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Chivo, sans-serif' }}>
              Altcoin Season Index
            </h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-4xl font-black text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {indices?.altcoin_season_index.value}
                </div>
                <div className="text-emerald-500 font-medium mt-1">{indices?.altcoin_season_index.status}</div>
              </div>
              <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center">
                <Activity className="text-emerald-500" size={32} />
              </div>
            </div>
            <p className="text-sm text-gray-400">{indices?.altcoin_season_index.description}</p>
          </div>

          {/* Stablecoin Dominance */}
          <div className="glass-card rounded-xl p-6" data-testid="stablecoin-dominance-card">
            <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Chivo, sans-serif' }}>
              Stablecoin Dominance
            </h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-4xl font-black text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {indices?.stablecoin_dominance.percentage}%
                </div>
                <div className="text-gray-400 text-sm mt-1">of total market cap</div>
              </div>
              <DollarSign className="text-emerald-500" size={48} />
            </div>
            <div className="text-sm text-gray-400">
              Total Supply: ${(indices?.stablecoin_dominance.total_supply / 1e9).toFixed(1)}B
            </div>
          </div>
        </div>

        {/* DeFi TVL */}
        <div className="glass-card rounded-xl p-6 mb-8" data-testid="defi-tvl-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Chivo, sans-serif' }}>
              DeFi Total Value Locked
            </h3>
            <div className="text-right">
              <div className="text-2xl font-bold text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                ${(indices?.defi_tvl.total / 1e9).toFixed(1)}B
              </div>
              <div className="text-sm text-emerald-500 flex items-center gap-1 justify-end">
                <TrendingUp size={14} />
                +{indices?.defi_tvl.change_24h}%
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={defiTvlData}>
              <defs>
                <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="tvl" stroke="#10b981" strokeWidth={2} fill="url(#tvlGradient)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {indices?.defi_tvl.top_protocols.map((protocol, index) => (
              <div key={index} className="p-3 bg-gray-800/30 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">{protocol.name}</div>
                <div className="text-sm font-bold text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  ${(protocol.tvl / 1e9).toFixed(1)}B
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gainers & Losers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Gainers */}
          <div className="glass-card rounded-xl p-6" data-testid="top-gainers-card">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Chivo, sans-serif' }}>
              <TrendingUp className="text-emerald-500" size={20} />
              Top Gainers (24h)
            </h3>
            <div className="space-y-3">
              {gainersLosers?.gainers.map((coin, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                  <div>
                    <div className="font-bold text-white">{coin.symbol}</div>
                    <div className="text-xs text-gray-400">{coin.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      ${coin.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-emerald-500 font-medium">+{coin.change_24h}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="glass-card rounded-xl p-6" data-testid="top-losers-card">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Chivo, sans-serif' }}>
              <TrendingDown className="text-red-500" size={20} />
              Top Losers (24h)
            </h3>
            <div className="space-y-3">
              {gainersLosers?.losers.map((coin, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                  <div>
                    <div className="font-bold text-white">{coin.symbol}</div>
                    <div className="text-xs text-gray-400">{coin.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      ${coin.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-red-500 font-medium">{coin.change_24h}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}