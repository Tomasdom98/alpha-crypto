import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, TrendingDown, Wallet, BarChart3, RefreshCw, ExternalLink } from 'lucide-react';
import OwlSeal from '@/components/OwlSeal';

export default function PortfolioPage() {
  const portfolioData = {
    totalValue: 50000,
    monthlyReturn: 12,
    monthlyReturnValue: 5500,
    lastUpdated: new Date().toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })
  };

  const holdings = [
    { name: 'Bitcoin', symbol: 'BTC', allocation: 35, value: 17500, change24h: -3.86, color: '#F7931A' },
    { name: 'Ethereum', symbol: 'ETH', allocation: 25, value: 12500, change24h: -5.27, color: '#627EEA' },
    { name: 'Solana', symbol: 'SOL', allocation: 20, value: 10000, change24h: -7.27, color: '#14F195' },
    { name: 'USDC', symbol: 'USDC', allocation: 15, value: 7500, change24h: 0.01, color: '#2775CA' },
    { name: 'Altcoins', symbol: 'ALTS', allocation: 5, value: 2500, change24h: -2.15, color: '#8B5CF6' }
  ];

  const performanceHistory = [
    { month: 'Sep', value: 8.2 },
    { month: 'Oct', value: -4.5 },
    { month: 'Nov', value: 15.3 },
    { month: 'Dec', value: 22.1 },
    { month: 'Jan', value: 5.8 },
    { month: 'Feb', value: 12.0 }
  ];

  const recentTrades = [
    { type: 'buy', asset: 'BTC', amount: '$2,500', date: 'Feb 1', reason: 'DCA' },
    { type: 'sell', asset: 'DOGE', amount: '$500', date: 'Jan 28', reason: 'Take profit' },
    { type: 'buy', asset: 'ETH', amount: '$1,000', date: 'Jan 25', reason: 'Dip buy' },
    { type: 'buy', asset: 'SOL', amount: '$750', date: 'Jan 20', reason: 'Rebalance' }
  ];

  return (
    <div className="min-h-screen py-12 relative" data-testid="portfolio-page">
      {/* Owl Seal */}
      <OwlSeal position="bottom-right" size="md" opacity={0.1} className="fixed z-10 hidden lg:block" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-4 transition-colors">
            <ChevronRight size={16} className="rotate-180" /> Volver al Inicio
          </Link>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" data-testid="portfolio-heading">
                Portfolio Alpha Crypto
              </h1>
              <p className="text-gray-400">Seguimiento transparente del portfolio - Copy-trade friendly</p>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <RefreshCw size={14} />
              Actualizado: {portfolioData.lastUpdated}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6 col-span-1 md:col-span-2">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-gray-400 text-sm mb-1">Valor Total del Portfolio</div>
                <div className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }} data-testid="portfolio-value">
                  ${portfolioData.totalValue.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-400 text-sm mb-1">Monthly Return</div>
                <div className="text-2xl font-bold flex items-center gap-1 text-emerald-400" data-testid="monthly-return">
                  <TrendingUp size={24} />
                  +{portfolioData.monthlyReturn}%
                </div>
                <div className="text-gray-500 text-sm">+${portfolioData.monthlyReturnValue.toLocaleString()}</div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-400 mb-3">6-Month Performance</h3>
              <div className="flex items-end gap-2 h-24">
                {performanceHistory.map(function(month) {
                  return (
                    <div key={month.month} className="flex-1 flex flex-col items-center">
                      <div 
                        className={'w-full rounded-t transition-all ' + (month.value >= 0 ? 'bg-emerald-500' : 'bg-red-500')}
                        style={{ height: Math.abs(month.value) * 3 + 'px', minHeight: '4px' }}
                      />
                      <div className="text-xs text-gray-500 mt-2">{month.month}</div>
                      <div className={'text-xs font-bold ' + (month.value >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {month.value > 0 ? '+' : ''}{month.value}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-bold text-gray-400 mb-4">Allocation</h3>
            <div className="space-y-3">
              {holdings.map(function(h) {
                return (
                  <div key={h.symbol} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: h.color }} />
                    <span className="text-gray-300 flex-1">{h.symbol}</span>
                    <span className="text-white font-bold">{h.allocation}%</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex h-4 rounded-full overflow-hidden">
                {holdings.map(function(h) {
                  return (
                    <div 
                      key={h.symbol}
                      style={{ width: h.allocation + '%', backgroundColor: h.color }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-8" data-testid="holdings-table">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Wallet className="text-emerald-500" /> Holdings
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Asset</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Allocation</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Value</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">24h Change</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map(function(holding) {
                  return (
                    <tr key={holding.symbol} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                            style={{ backgroundColor: holding.color + '30' }}
                          >
                            {holding.symbol.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-white">{holding.name}</div>
                            <div className="text-gray-500 text-sm">{holding.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full"
                              style={{ width: holding.allocation + '%', backgroundColor: holding.color }}
                            />
                          </div>
                          <span className="text-white font-bold w-10">{holding.allocation}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-white font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          ${holding.value.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={'font-bold ' + (holding.change24h >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                          {holding.change24h >= 0 ? '+' : ''}{holding.change24h}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="text-emerald-500" /> Recent Trades
            </h2>
            
            <div className="space-y-3">
              {recentTrades.map(function(trade, index) {
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={'w-8 h-8 rounded-full flex items-center justify-center ' + (trade.type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400')}>
                        {trade.type === 'buy' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      </div>
                      <div>
                        <div className="text-white font-medium">{trade.type.toUpperCase()} {trade.asset}</div>
                        <div className="text-gray-500 text-xs">{trade.reason}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{trade.amount}</div>
                      <div className="text-gray-500 text-xs">{trade.date}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Strategy Notes</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <h3 className="font-bold text-emerald-400 mb-1">Current Strategy</h3>
                <p className="text-gray-300 text-sm">
                  DCA semanal en BTC y ETH. Manteniendo posicion defensiva con 15% en stables. 
                  Buscando oportunidades en L2s para proxima rotacion.
                </p>
              </div>
              
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <h3 className="font-bold text-amber-400 mb-1">Next Moves</h3>
                <p className="text-gray-300 text-sm">
                  Monitorear niveles de soporte en $65K BTC. Si se rompe, aumentar stables a 25%. 
                  Oportunidad de entrada en SOL si cae a $80.
                </p>
              </div>
              
              <div className="text-center pt-4">
                <p className="text-gray-500 text-sm">
                  Want to copy this portfolio?
                </p>
                <button className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-6 rounded-lg transition-all inline-flex items-center gap-2">
                  Get Premium Access
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-900/50 border border-gray-800 rounded-xl text-center">
          <p className="text-xs text-gray-500">
            This portfolio is for educational purposes only. Past performance does not guarantee future results. 
            Always DYOR before making investment decisions. Data updated manually.
          </p>
        </div>
      </div>
    </div>
  );
}
