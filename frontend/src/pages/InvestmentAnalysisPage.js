import { useState } from 'react';
import { Lock, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import PremiumModal from '@/components/PremiumModal';

export default function InvestmentAnalysisPage() {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false); // Mock

  const analyses = [
    {
      id: 1,
      project: 'Ethereum Layer 2 Ecosystem',
      rating: 8.5,
      riskScore: 4,
      premium: false,
      excerpt: 'Deep dive into Arbitrum, Optimism, and Base performance metrics',
      image: 'https://images.unsplash.com/photo-1644925295849-f057b6ee1c66?crop=entropy&cs=srgb&fm=jpg&q=85',
    },
    {
      id: 2,
      project: 'Real World Assets (RWA) Protocols',
      rating: 9.2,
      riskScore: 3,
      premium: true,
      excerpt: 'Comprehensive analysis of Ondo, Centrifuge, and MapleFinance tokenomics',
      image: 'https://images.unsplash.com/photo-1643000296927-f4f1c8722b7d?crop=entropy&cs=srgb&fm=jpg&q=85',
    },
    {
      id: 3,
      project: 'AI x Crypto Infrastructure',
      rating: 7.8,
      riskScore: 6,
      premium: true,
      excerpt: 'Evaluating Render, Akash, and Bittensor for long-term potential',
      image: 'https://images.unsplash.com/photo-1666624833516-6d0e320c610d?crop=entropy&cs=srgb&fm=jpg&q=85',
    },
  ];

  const getRatingColor = (rating) => {
    if (rating >= 8) return 'text-emerald-500';
    if (rating >= 6) return 'text-amber-500';
    return 'text-red-500';
  };

  const getRiskColor = (risk) => {
    if (risk <= 3) return 'text-emerald-500';
    if (risk <= 6) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <>
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-4xl md:text-5xl font-black text-white mb-4"
              style={{ fontFamily: 'Chivo, sans-serif' }}
              data-testid="analysis-page-heading"
            >
              Investment Analysis
            </h1>
            <p className="text-gray-400 text-lg">Expert research and ratings for crypto projects</p>
          </div>

          {/* Analysis Cards */}
          <div className="space-y-6">
            {analyses.map((analysis) => {
              const isLocked = analysis.premium && !isPremiumUser;

              return (
                <div
                  key={analysis.id}
                  data-testid={`analysis-card-${analysis.id}`}
                  className={`glass-card rounded-xl overflow-hidden card-hover ${analysis.premium ? 'premium-glow' : ''}`}
                >
                  <div className="grid md:grid-cols-3 gap-6 p-6">
                    {/* Image */}
                    <div className="relative">
                      <img src={analysis.image} alt={analysis.project} className="w-full h-48 md:h-full object-cover rounded-lg" />
                      {analysis.premium && (
                        <span className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg tracking-wide uppercase">
                          Premium
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="md:col-span-2">
                      <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Chivo, sans-serif' }}>
                        {analysis.project}
                      </h3>
                      <p className="text-gray-400 mb-4">{analysis.excerpt}</p>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-4 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <TrendingUp size={16} />
                            Rating
                          </div>
                          <div className={`text-3xl font-black ${getRatingColor(analysis.rating)}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            {analysis.rating}/10
                          </div>
                        </div>
                        <div className="p-4 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <AlertTriangle size={16} />
                            Risk Score
                          </div>
                          <div className={`text-3xl font-black ${getRiskColor(analysis.riskScore)}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            {analysis.riskScore}/10
                          </div>
                        </div>
                      </div>

                      {/* CTA */}
                      {isLocked ? (
                        <button
                          data-testid={`unlock-analysis-${analysis.id}-btn`}
                          onClick={() => setShowPremiumModal(true)}
                          className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-6 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 hover:scale-102 active:scale-98 flex items-center justify-center gap-2"
                        >
                          <Lock size={18} />
                          Unlock Full Analysis
                        </button>
                      ) : (
                        <button
                          data-testid={`read-analysis-${analysis.id}-btn`}
                          className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg border border-gray-700 transition-all duration-300 hover:border-emerald-500/30 flex items-center justify-center gap-2"
                        >
                          <Target size={18} />
                          Read Full Analysis
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Additional Content (blurred if locked) */}
                  {isLocked && (
                    <div className="relative p-6 border-t border-gray-800">
                      <div className="absolute inset-0 backdrop-blur-md bg-gray-900/80 z-10 flex items-center justify-center">
                        <div className="text-center">
                          <Lock className="text-emerald-500 mx-auto mb-2" size={32} />
                          <p className="text-gray-400 text-sm">Premium content</p>
                        </div>
                      </div>
                      <div className="blur-sm">
                        <h4 className="text-lg font-bold text-white mb-2">Tokenomics Breakdown</h4>
                        <p className="text-gray-400 text-sm">Detailed analysis of token distribution, vesting schedules, and utility...</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Info Banner */}
          <div className="mt-12 glass-card rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Chivo, sans-serif' }}>
              Want More Analysis?
            </h3>
            <p className="text-gray-400 mb-6">Get access to all premium investment research and deep-dive reports</p>
            <button
              data-testid="subscribe-for-analysis-btn"
              onClick={() => setShowPremiumModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-8 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Subscribe for $9/month
            </button>
          </div>
        </div>
      </div>

      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
    </>
  );
}