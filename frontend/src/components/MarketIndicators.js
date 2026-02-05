import { TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function MarketIndicators({ fearGreed }) {
  // Mock data for indicators - can be replaced with real data later
  const indicators = [
    {
      id: 'rainbow',
      name: 'Bitcoin Rainbow Chart',
      value: 'Accumulate',
      label: 'Buy Zone',
      interpretation: 'bullish',
      icon: TrendingUp,
      description: 'Long-term price indicator',
    },
    {
      id: 'mvrv',
      name: 'MVRV Z-Score',
      value: '2.3',
      label: 'Neutral',
      interpretation: 'neutral',
      icon: Activity,
      description: 'Market value vs realized value',
    },
    {
      id: 'nupl',
      name: 'NUPL',
      value: '62%',
      label: 'Optimism',
      interpretation: 'bullish',
      icon: TrendingUp,
      description: 'Net Unrealized Profit/Loss'
    },
    {
      id: 'ssr',
      name: 'Stablecoin Supply Ratio',
      value: '8.2%',
      label: 'Bullish',
      interpretation: 'bullish',
      icon: TrendingUp,
      description: 'Buying power indicator'
    }
  ];

  const getInterpretationColor = (interpretation) => {
    switch (interpretation) {
      case 'bullish':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'bearish':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    }
  };

  // Fear & Greed gauge color
  const getFearGreedColor = () => {
    const value = fearGreed?.value || 50;
    if (value < 25) return '#ef4444'; // Red - Extreme Fear
    if (value < 45) return '#f97316'; // Orange - Fear
    if (value < 55) return '#eab308'; // Yellow - Neutral
    if (value < 75) return '#22c55e'; // Green - Greed
    return '#10b981'; // Emerald - Extreme Greed
  };

  const gaugeData = [
    { name: 'Value', value: fearGreed?.value || 50 },
    { name: 'Remaining', value: 100 - (fearGreed?.value || 50) },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="market-indicators">
      <div className="mb-8">
        <h2 
          className="text-3xl md:text-4xl font-bold text-white mb-2"
          style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}
        >
          Indicadores de Mercado
        </h2>
        <p className="text-gray-400">Métricas on-chain y sentimiento del mercado</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Fear & Greed Index - Compact Card */}
        <div 
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20"
          data-testid="fear-greed-gauge"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-900/20" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50">
                <Activity className="w-5 h-5 text-emerald-400" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Índice de Miedo y Codicia
                </h3>
                <p className="text-xs text-gray-500">Indicador del sentimiento del mercado</p>
              </div>
            </div>

            {/* Compact Gauge Visualization */}
            <div className="relative">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={gaugeData}
                    cx="50%"
                    cy="50%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={55}
                    outerRadius={75}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill={getFearGreedColor()} />
                    <Cell fill="#1f2937" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center Value */}
              <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: '30%' }}>
                <div className="text-4xl font-black text-white mb-1" style={{ fontFamily: 'Space Grotesk, monospace' }}>
                  {fearGreed?.value || 50}
                </div>
                <div className="text-sm font-semibold text-gray-400">{fearGreed?.classification || 'Neutral'}</div>
              </div>
            </div>

            {/* Scale Labels */}
            <div className="flex justify-between text-xs text-gray-500 px-2">
              <span>Extreme Fear</span>
              <span>Neutral</span>
              <span>Extreme Greed</span>
            </div>

            <div className="mt-4 p-3 bg-gray-800/30 rounded-xl border border-gray-700/30">
              <p className="text-xs text-gray-400 leading-relaxed">
                Measures market sentiment from 0 (extreme fear) to 100 (extreme greed). 
                Use it to gauge market psychology and spot opportunities.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: 2x2 Grid of Other Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {indicators.map((indicator, index) => {
            const Icon = indicator.icon;
            return (
              <div
                key={indicator.id}
                data-testid={`indicator-${indicator.id}`}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-5 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-emerald-500/20 hover:border-emerald-500/50"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards',
                }}
              >
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/50 group-hover:border-emerald-500/30 transition-colors">
                      <Icon className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xs font-semibold text-gray-400">{indicator.name}</h3>
                  </div>

                  <div className="mt-3">
                    <div className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, monospace' }}>
                      {indicator.value}
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getInterpretationColor(indicator.interpretation)}`}>
                      {indicator.label}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 mt-3">{indicator.description}</p>
                </div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}