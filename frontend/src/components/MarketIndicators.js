import { TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';

export default function MarketIndicators({ fearGreed }) {
  // Mock data for indicators - can be replaced with real data later
  const indicators = [
    {
      id: 'fear-greed',
      name: 'Fear & Greed Index',
      value: fearGreed?.value || 62,
      label: fearGreed?.classification || 'Greed',
      interpretation: fearGreed?.value > 55 ? 'bullish' : fearGreed?.value > 45 ? 'neutral' : 'bearish',
      icon: Activity,
      description: 'Market sentiment indicator'
    },
    {
      id: 'rainbow',
      name: 'Bitcoin Rainbow Chart',
      value: 'Accumulate',
      label: 'Buy Zone',
      interpretation: 'bullish',
      icon: TrendingUp,
      description: 'Long-term price indicator',
      color: '#10b981'
    },
    {
      id: 'mvrv',
      name: 'MVRV Z-Score',
      value: '2.3',
      label: 'Neutral Zone',
      interpretation: 'neutral',
      icon: Activity,
      description: 'Market value vs realized value',
      subtext: '<7 Top, >0 Bottom'
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

  const getGlowColor = (interpretation) => {
    switch (interpretation) {
      case 'bullish':
        return 'shadow-emerald-500/20';
      case 'bearish':
        return 'shadow-red-500/20';
      default:
        return 'shadow-amber-500/20';
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="market-indicators">
      <div className="mb-8">
        <h2 
          className="text-3xl md:text-4xl font-bold text-white mb-2"
          style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}
        >
          Market Indicators
        </h2>
        <p className="text-gray-400">Key on-chain metrics and market sentiment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {indicators.map((indicator, index) => {
          const Icon = indicator.icon;
          return (
            <div
              key={indicator.id}
              data-testid={`indicator-${indicator.id}`}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${getGlowColor(indicator.interpretation)} hover:border-${indicator.interpretation === 'bullish' ? 'emerald' : indicator.interpretation === 'bearish' ? 'red' : 'amber'}-500/50`}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards',
              }}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 group-hover:border-emerald-500/30 transition-colors">
                      <Icon className="w-5 h-5 text-emerald-400" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-0.5">{indicator.name}</h3>
                      <p className="text-xs text-gray-600">{indicator.description}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, monospace' }}>
                    {indicator.value}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getInterpretationColor(indicator.interpretation)}`}>
                      {indicator.label}
                    </span>
                  </div>
                  {indicator.subtext && (
                    <p className="text-xs text-gray-600 mt-2">{indicator.subtext}</p>
                  )}
                </div>
              </div>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}