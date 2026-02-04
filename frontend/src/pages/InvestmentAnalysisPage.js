import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, TrendingDown, AlertTriangle, Shield, Target, BarChart3, Globe, Zap, Calendar } from 'lucide-react';

export default function InvestmentAnalysisPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const reportDate = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  const marketMetrics = {
    btcPrice: '$72,975',
    btcChange: '-3.86%',
    ethPrice: '$2,140',
    ethChange: '-5.27%',
    totalMcap: '$2.15T',
    btcDominance: '52.3%',
    fearGreed: 14,
    fearGreedLabel: 'Extreme Fear'
  };

  const keyInsights = [
    { type: 'bullish', title: 'Institutional Accumulation', description: 'ETFs de Bitcoin registran entradas netas de $500M esta semana. BlackRock lidera con $250M.' },
    { type: 'bearish', title: 'Presión Macroeconómica', description: 'Fed mantiene tasas altas. Datos de inflación superiores a expectativas generan incertidumbre.' },
    { type: 'neutral', title: 'Halving Effect', description: 'A 60 días del halving, históricamente período de consolidación antes de rally.' },
    { type: 'bullish', title: 'Stablecoin Inflows', description: 'USDT y USDC muestran entradas récord a exchanges. Dry powder listo para desplegar.' }
  ];

  const sectorAnalysis = [
    { sector: 'Layer 1s', trend: 'neutral', outlook: 'Consolidación. ETH y SOL compiten por developers.', picks: ['ETH', 'SOL'] },
    { sector: 'Layer 2s', trend: 'bullish', outlook: 'Arbitrum y Base lideran en TVL. Crecimiento sostenido.', picks: ['ARB', 'OP'] },
    { sector: 'DeFi', trend: 'bullish', outlook: 'Real yield protocols ganando tracción. TVL en recuperación.', picks: ['AAVE', 'GMX'] },
    { sector: 'AI Tokens', trend: 'neutral', outlook: 'Sector volátil. Especulación alta, fundamentales mixtos.', picks: ['FET', 'RNDR'] },
    { sector: 'Memecoins', trend: 'bearish', outlook: 'Ciclo de rotación agotándose. Cautela recomendada.', picks: [] }
  ];

  const portfolioRecommendation = {
    conservative: { btc: 60, eth: 25, stables: 15, risk: 'Low' },
    balanced: { btc: 40, eth: 30, alts: 20, stables: 10, risk: 'Medium' },
    aggressive: { btc: 30, eth: 25, alts: 40, stables: 5, risk: 'High' }
  };

  const getTrendColor = (trend) => {
    if (trend === 'bullish') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (trend === 'bearish') return 'text-red-400 bg-red-500/10 border-red-500/30';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'bullish') return <TrendingUp size={18} />;
    if (trend === 'bearish') return <TrendingDown size={18} />;
    return <BarChart3 size={18} />;
  };

  return (
    <div className="min-h-screen py-12" data-testid="analysis-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-4 transition-colors">
            <ChevronRight size={16} className="rotate-180" /> Back to Home
          </Link>
          
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" data-testid="analysis-heading">
                Investment Analysis
              </h1>
              <p className="text-gray-400">Alpha Crypto Market Report</p>
            </div>
            <div className="glass-card rounded-xl px-4 py-2 text-right">
              <div className="text-xs text-gray-500">Report Date</div>
              <div className="text-emerald-400 font-bold flex items-center gap-2">
                <Calendar size={14} />
                {reportDate}
              </div>
            </div>
          </div>
        </div>

        {/* Market Overview Card */}
        <div className="glass-card rounded-2xl p-6 mb-8" data-testid="market-overview">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Globe className="text-emerald-500" /> Market Overview
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Bitcoin</div>
              <div className="text-xl font-bold text-white">{marketMetrics.btcPrice}</div>
              <div className={`text-sm ${marketMetrics.btcChange.startsWith('-') ? 'text-red-400' : 'text-emerald-400'}`}>
                {marketMetrics.btcChange}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Ethereum</div>
              <div className="text-xl font-bold text-white">{marketMetrics.ethPrice}</div>
              <div className={`text-sm ${marketMetrics.ethChange.startsWith('-') ? 'text-red-400' : 'text-emerald-400'}`}>
                {marketMetrics.ethChange}
              </div>
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
                <h3 className="font-bold text-amber-400 mb-1">Alpha Crypto Assessment</h3>
                <p className="text-gray-300 text-sm">
                  El mercado muestra señales mixtas. Fear & Greed en "Extreme Fear" históricamente indica oportunidad de acumulación, 
                  pero factores macro sugieren cautela. Recomendamos DCA (Dollar Cost Averaging) en lugar de entradas agresivas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="glass-card rounded-2xl p-6 mb-8" data-testid="key-insights">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="text-emerald-500" /> Key Insights
          </h2>
          
          <div className="space-y-4">
            {keyInsights.map((insight, index) => (
              <div 
                key={index}
                className={`flex items-start gap-4 p-4 rounded-xl border ${getTrendColor(insight.type)}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getTrendIcon(insight.type)}
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{insight.title}</h3>
                  <p className="text-gray-400 text-sm">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Analysis */}
        <div className="glass-card rounded-2xl p-6 mb-8" data-testid="sector-analysis">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="text-emerald-500" /> Sector Analysis
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Sector</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Trend</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Outlook</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Top Picks</th>
                </tr>
              </thead>
              <tbody>
                {sectorAnalysis.map((sector, index) => (
                  <tr key={index} className="border-b border-gray-800/50">
                    <td className="py-4 px-4 font-medium text-white">{sector.sector}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border ${getTrendColor(sector.trend)}`}>
                        {getTrendIcon(sector.trend)}
                        {sector.trend}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400 text-sm max-w-xs">{sector.outlook}</td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        {sector.picks.map(pick => (
                          <span key={pick} className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-bold">
                            {pick}
                          </span>
                        ))}
                        {sector.picks.length === 0 && <span className="text-gray-500 text-sm">-</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Portfolio Allocation */}
        <div className="glass-card rounded-2xl p-6 mb-8" data-testid="portfolio-recommendation">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="text-emerald-500" /> Recommended Allocations
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(portfolioRecommendation).map(([type, allocation]) => (
              <div key={type} className="bg-gray-800/50 rounded-xl p-5">
                <h3 className="font-bold text-white capitalize mb-3">{type}</h3>
                <div className="space-y-2 mb-4">
                  {Object.entries(allocation).filter(([k]) => k !== 'risk').map(([asset, pct]) => (
                    <div key={asset} className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm uppercase">{asset}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-white text-sm font-bold w-10 text-right">{pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-gray-700">
                  <span className="text-xs text-gray-500">Risk Level: </span>
                  <span className={`text-xs font-bold ${
                    allocation.risk === 'Low' ? 'text-emerald-400' : 
                    allocation.risk === 'High' ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {allocation.risk}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
          <div className="flex items-start gap-3">
            <Shield className="text-gray-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-bold text-gray-400 mb-1">Disclaimer</h3>
              <p className="text-sm text-gray-500">
                Este reporte es únicamente para fines informativos y no constituye asesoramiento financiero. 
                Las inversiones en criptomonedas conllevan riesgos significativos. Siempre haga su propia investigación (DYOR) 
                antes de tomar decisiones de inversión. Alpha Crypto no se hace responsable de pérdidas derivadas del uso de esta información.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
