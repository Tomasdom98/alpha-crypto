import { TrendingUp, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/context/LanguageContext';

export default function MarketIndicators({ fearGreed }) {
  const { language } = useLanguage();

  // Translations
  const tx = {
    es: {
      title: 'Indicadores de Mercado',
      subtitle: 'Métricas on-chain y sentimiento del mercado',
      fearGreed: 'Índice de Miedo y Codicia',
      fearGreedDesc: 'Indicador del sentimiento del mercado',
      extremeFear: 'Miedo Extremo',
      fear: 'Miedo',
      neutral: 'Neutral',
      greed: 'Codicia',
      extremeGreed: 'Codicia Extrema',
      fearGreedExplanation: 'Mide el sentimiento del mercado de 0 (miedo extremo) a 100 (codicia extrema). Úsalo para evaluar la psicología del mercado.',
      accumulate: 'Acumular',
      buyZone: 'Zona de Compra',
      longTermIndicator: 'Indicador de precio a largo plazo',
      marketValue: 'Valor de mercado vs valor realizado',
      optimism: 'Optimismo',
      unrealizedPL: 'Ganancia/Pérdida No Realizada',
      stablecoinRatio: 'Ratio de Stablecoins',
      bullish: 'Alcista',
      buyingPower: 'Indicador de poder de compra',
    },
    en: {
      title: 'Market Indicators',
      subtitle: 'On-chain metrics and market sentiment',
      fearGreed: 'Fear & Greed Index',
      fearGreedDesc: 'Market sentiment indicator',
      extremeFear: 'Extreme Fear',
      fear: 'Fear',
      neutral: 'Neutral',
      greed: 'Greed',
      extremeGreed: 'Extreme Greed',
      fearGreedExplanation: 'Measures market sentiment from 0 (extreme fear) to 100 (extreme greed). Use it to assess market psychology.',
      accumulate: 'Accumulate',
      buyZone: 'Buy Zone',
      longTermIndicator: 'Long-term price indicator',
      marketValue: 'Market value vs realized value',
      optimism: 'Optimism',
      unrealizedPL: 'Unrealized Profit/Loss',
      stablecoinRatio: 'Stablecoin Ratio',
      bullish: 'Bullish',
      buyingPower: 'Buying power indicator',
    }
  }[language];

  const indicators = [
    {
      id: 'rainbow',
      name: 'Bitcoin Rainbow Chart',
      value: tx.accumulate,
      label: tx.buyZone,
      interpretation: 'bullish',
      icon: TrendingUp,
      description: tx.longTermIndicator,
    },
    {
      id: 'mvrv',
      name: 'MVRV Z-Score',
      value: '2.3',
      label: tx.neutral,
      interpretation: 'neutral',
      icon: Activity,
      description: tx.marketValue,
    },
    {
      id: 'nupl',
      name: 'NUPL',
      value: '62%',
      label: tx.optimism,
      interpretation: 'bullish',
      icon: TrendingUp,
      description: tx.unrealizedPL
    },
    {
      id: 'ssr',
      name: tx.stablecoinRatio,
      value: '8.2%',
      label: tx.bullish,
      interpretation: 'bullish',
      icon: TrendingUp,
      description: tx.buyingPower
    }
  ];

  const getInterpretationColor = (interpretation) => {
    switch (interpretation) {
      case 'bullish': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'bearish': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    }
  };

  const translateClassification = (classification) => {
    const translations = {
      'Extreme Fear': tx.extremeFear,
      'Fear': tx.fear,
      'Neutral': tx.neutral,
      'Greed': tx.greed,
      'Extreme Greed': tx.extremeGreed
    };
    return translations[classification] || classification || tx.neutral;
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

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="market-indicators">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}>
          {tx.title}
        </h2>
        <p className="text-gray-400">{tx.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fear & Greed Index */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20" data-testid="fear-greed-gauge">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-900/20" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50">
                <Activity className="w-5 h-5 text-emerald-400" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {tx.fearGreed}
                </h3>
                <p className="text-xs text-gray-500">{tx.fearGreedDesc}</p>
              </div>
            </div>

            <div className="relative">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={gaugeData} cx="50%" cy="50%" startAngle={180} endAngle={0} innerRadius={55} outerRadius={75} dataKey="value" stroke="none">
                    <Cell fill={getFearGreedColor()} />
                    <Cell fill="#1f2937" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: '30%' }}>
                <div className="text-4xl font-black text-white mb-1" style={{ fontFamily: 'Space Grotesk, monospace' }}>
                  {fearGreed?.value || 50}
                </div>
                <div className="text-sm font-semibold text-gray-400">{translateClassification(fearGreed?.classification)}</div>
              </div>
            </div>

            <div className="flex justify-between text-xs text-gray-500 px-2">
              <span>{tx.extremeFear}</span>
              <span>{tx.neutral}</span>
              <span>{tx.extremeGreed}</span>
            </div>

            <div className="mt-4 p-3 bg-gray-800/30 rounded-xl border border-gray-700/30">
              <p className="text-xs text-gray-400 leading-relaxed">{tx.fearGreedExplanation}</p>
            </div>
          </div>
        </div>

        {/* Other Indicators Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {indicators.map((indicator, index) => {
            const Icon = indicator.icon;
            return (
              <div
                key={indicator.id}
                data-testid={`indicator-${indicator.id}`}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-5 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-emerald-500/20 hover:border-emerald-500/50"
                style={{ animationDelay: `${index * 100}ms`, animation: 'fadeInUp 0.6s ease-out forwards' }}
              >
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
