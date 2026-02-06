import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, TrendingDown, AlertTriangle, Shield, Target, BarChart3, Globe, Zap, Calendar } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

function InvestmentAnalysisPage() {
  const { language } = useLanguage();
  const isEs = language === 'es';
  
  var reportDate = new Date().toLocaleDateString(isEs ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const tx = {
    backHome: isEs ? 'Volver al Inicio' : 'Back to Home',
    title: isEs ? 'Análisis de Inversión' : 'Investment Analysis',
    subtitle: isEs ? 'Reporte de Mercado Alpha Crypto' : 'Alpha Crypto Market Report',
    reportDate: isEs ? 'Fecha del Reporte' : 'Report Date',
    marketOverview: isEs ? 'Resumen del Mercado' : 'Market Overview',
    keyInsights: isEs ? 'Insights Clave' : 'Key Insights',
    sectorAnalysis: isEs ? 'Análisis por Sector' : 'Sector Analysis',
    recommendedAlloc: isEs ? 'Asignaciones Recomendadas' : 'Recommended Allocations',
    sector: 'Sector',
    trend: isEs ? 'Tendencia' : 'Trend',
    outlook: isEs ? 'Perspectiva' : 'Outlook',
    topPicks: 'Top Picks',
    riskLevel: isEs ? 'Nivel de Riesgo' : 'Risk Level',
    low: isEs ? 'Bajo' : 'Low',
    medium: isEs ? 'Medio' : 'Medium',
    high: isEs ? 'Alto' : 'High',
    conservative: isEs ? 'Conservador' : 'Conservative',
    balanced: isEs ? 'Balanceado' : 'Balanced',
    aggressive: isEs ? 'Agresivo' : 'Aggressive',
    disclaimer: 'Disclaimer',
    disclaimerText: isEs 
      ? 'Este reporte es únicamente para fines informativos y no constituye asesoramiento financiero. Las inversiones en criptomonedas conllevan riesgos significativos. Siempre haga su propia investigación (DYOR) antes de tomar decisiones de inversión.'
      : 'This report is for informational purposes only and does not constitute financial advice. Cryptocurrency investments carry significant risks. Always do your own research (DYOR) before making investment decisions.',
    assessment: isEs ? 'Evaluación Alpha Crypto' : 'Alpha Crypto Assessment',
    assessmentText: isEs
      ? 'El mercado muestra señales mixtas. Fear and Greed en Extreme Fear históricamente indica oportunidad de acumulación, pero factores macro sugieren cautela. Recomendamos DCA en lugar de entradas agresivas.'
      : 'The market shows mixed signals. Fear and Greed in Extreme Fear historically indicates accumulation opportunity, but macro factors suggest caution. We recommend DCA instead of aggressive entries.',
  };

  var marketMetrics = {
    btcPrice: '$72,975',
    btcChange: '-3.86%',
    ethPrice: '$2,140',
    ethChange: '-5.27%',
    totalMcap: '$2.15T',
    btcDominance: '52.3%',
    fearGreed: 14,
    fearGreedLabel: isEs ? 'Miedo Extremo' : 'Extreme Fear'
  };

  var keyInsights = [
    { type: 'bullish', title: isEs ? 'Acumulación Institucional' : 'Institutional Accumulation', description: isEs ? 'ETFs de Bitcoin registran entradas netas de $500M esta semana.' : 'Bitcoin ETFs record net inflows of $500M this week.' },
    { type: 'bearish', title: isEs ? 'Presión Macroeconómica' : 'Macroeconomic Pressure', description: isEs ? 'Fed mantiene tasas altas. Datos de inflación superiores a expectativas.' : 'Fed maintains high rates. Inflation data above expectations.' },
    { type: 'neutral', title: isEs ? 'Efecto Halving' : 'Halving Effect', description: isEs ? 'A 60 días del halving, históricamente período de consolidación.' : '60 days from halving, historically a consolidation period.' },
    { type: 'bullish', title: isEs ? 'Entradas de Stablecoins' : 'Stablecoin Inflows', description: isEs ? 'USDT y USDC muestran entradas récord a exchanges.' : 'USDT and USDC show record inflows to exchanges.' }
  ];

  var sectorAnalysis = [
    { sector: 'Layer 1s', trend: 'neutral', outlook: isEs ? 'Consolidación. ETH y SOL compiten por developers.' : 'Consolidation. ETH and SOL compete for developers.', picks: 'ETH, SOL' },
    { sector: 'Layer 2s', trend: 'bullish', outlook: isEs ? 'Arbitrum y Base lideran en TVL.' : 'Arbitrum and Base lead in TVL.', picks: 'ARB, OP' },
    { sector: 'DeFi', trend: 'bullish', outlook: isEs ? 'Real yield protocols ganando tracción.' : 'Real yield protocols gaining traction.', picks: 'AAVE, GMX' },
    { sector: 'AI Tokens', trend: 'neutral', outlook: isEs ? 'Sector volátil. Especulación alta.' : 'Volatile sector. High speculation.', picks: 'FET, RNDR' },
    { sector: 'Memecoins', trend: 'bearish', outlook: isEs ? 'Ciclo agotándose. Cautela recomendada.' : 'Cycle exhausting. Caution recommended.', picks: '-' }
  ];

  function getTrendColor(trend) {
    if (trend === 'bullish') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (trend === 'bearish') return 'text-red-400 bg-red-500/10 border-red-500/30';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  }

  function getTrendIcon(trend) {
    if (trend === 'bullish') return <TrendingUp size={18} />;
    if (trend === 'bearish') return <TrendingDown size={18} />;
    return <BarChart3 size={18} />;
  }

  return (
    <div className="min-h-screen py-12" data-testid="analysis-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-4 transition-colors">
            <ChevronRight size={16} className="rotate-180" /> {tx.backHome}
          </Link>
          
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" data-testid="analysis-heading">{tx.title}</h1>
              <p className="text-gray-400">{tx.subtitle}</p>
            </div>
            <div className="glass-card rounded-xl px-4 py-2 text-right">
              <div className="text-xs text-gray-500">{tx.reportDate}</div>
              <div className="text-emerald-400 font-bold flex items-center gap-2"><Calendar size={14} />{reportDate}</div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-8" data-testid="market-overview">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Globe className="text-emerald-500" /> {tx.marketOverview}</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Bitcoin</div>
              <div className="text-xl font-bold text-white">{marketMetrics.btcPrice}</div>
              <div className="text-sm text-red-400">{marketMetrics.btcChange}</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Ethereum</div>
              <div className="text-xl font-bold text-white">{marketMetrics.ethPrice}</div>
              <div className="text-sm text-red-400">{marketMetrics.ethChange}</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Total Market Cap</div>
              <div className="text-xl font-bold text-white">{marketMetrics.totalMcap}</div>
              <div className="text-sm text-gray-400">BTC Dom: {marketMetrics.btcDominance}</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Fear & Greed</div>
              <div className="text-xl font-bold text-red-400">{marketMetrics.fearGreed}</div>
              <div className="text-sm text-red-400">{marketMetrics.fearGreedLabel}</div>
            </div>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-bold text-amber-400 mb-1">{tx.assessment}</h3>
                <p className="text-gray-300 text-sm">{tx.assessmentText}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-8" data-testid="key-insights">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Zap className="text-emerald-500" /> {tx.keyInsights}</h2>
          
          <div className="space-y-4">
            {keyInsights.map(function(insight, index) {
              return (
                <div key={index} className={'flex items-start gap-4 p-4 rounded-xl border ' + getTrendColor(insight.type)}>
                  <div className="flex-shrink-0 mt-0.5">{getTrendIcon(insight.type)}</div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{insight.title}</h3>
                    <p className="text-gray-400 text-sm">{insight.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-8" data-testid="sector-analysis">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><BarChart3 className="text-emerald-500" /> {tx.sectorAnalysis}</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">{tx.sector}</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">{tx.trend}</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">{tx.outlook}</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">{tx.topPicks}</th>
                </tr>
              </thead>
              <tbody>
                {sectorAnalysis.map(function(sector, index) {
                  return (
                    <tr key={index} className="border-b border-gray-800/50">
                      <td className="py-4 px-4 font-medium text-white">{sector.sector}</td>
                      <td className="py-4 px-4">
                        <span className={'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border ' + getTrendColor(sector.trend)}>
                          {getTrendIcon(sector.trend)}
                          {sector.trend}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-sm max-w-xs">{sector.outlook}</td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-bold">{sector.picks}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-8" data-testid="portfolio-recommendation">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Target className="text-emerald-500" /> {tx.recommendedAlloc}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-5">
              <h3 className="font-bold text-white mb-3">{tx.conservative}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between"><span className="text-gray-400 text-sm">BTC</span><span className="text-white font-bold">60%</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-400 text-sm">ETH</span><span className="text-white font-bold">25%</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-400 text-sm">STABLES</span><span className="text-white font-bold">15%</span></div>
              </div>
              <div className="pt-3 border-t border-gray-700"><span className="text-xs text-gray-500">{tx.riskLevel}: </span><span className="text-xs font-bold text-emerald-400">{tx.low}</span></div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-5">
              <h3 className="font-bold text-white mb-3">{tx.balanced}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between"><span className="text-gray-400 text-sm">BTC</span><span className="text-white font-bold">40%</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-400 text-sm">ETH</span><span className="text-white font-bold">30%</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-400 text-sm">ALTS</span><span className="text-white font-bold">20%</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-400 text-sm">STABLES</span><span className="text-white font-bold">10%</span></div>
              </div>
              <div className="pt-3 border-t border-gray-700"><span className="text-xs text-gray-500">{tx.riskLevel}: </span><span className="text-xs font-bold text-amber-400">{tx.medium}</span></div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-5">
              <h3 className="font-bold text-white mb-3">{tx.aggressive}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between"><span className="text-gray-400 text-sm">BTC</span><span className="text-white font-bold">30%</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-400 text-sm">ETH</span><span className="text-white font-bold">25%</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-400 text-sm">ALTS</span><span className="text-white font-bold">40%</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-400 text-sm">STABLES</span><span className="text-white font-bold">5%</span></div>
              </div>
              <div className="pt-3 border-t border-gray-700"><span className="text-xs text-gray-500">{tx.riskLevel}: </span><span className="text-xs font-bold text-red-400">{tx.high}</span></div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
          <div className="flex items-start gap-3">
            <Shield className="text-gray-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-bold text-gray-400 mb-1">{tx.disclaimer}</h3>
              <p className="text-sm text-gray-500">{tx.disclaimerText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvestmentAnalysisPage;
