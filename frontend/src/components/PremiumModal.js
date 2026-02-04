import { X, Check, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PremiumModal({ isOpen, onClose }) {
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const features = [
    'Exclusive premium articles and analysis',
    'Access to premium-only airdrops',
    'Early market signals and alerts',
    'Deep-dive tokenomics research',
    'Private Discord community',
    'Weekly alpha calls',
  ];

  const handleConnectWallet = () => {
    // Solana wallet connection would go here
    setWalletConnected(true);
  };

  const handleSubscribe = () => {
    // Solana Pay integration would go here
    alert('Payment processing... In production, this would use Solana Pay for USDC payment.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="premium-modal">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-emerald-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Sparkles className="text-emerald-500" size={28} />
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Chivo, sans-serif' }}>
              Premium Subscription
            </h2>
          </div>
          <button
            data-testid="close-modal-btn"
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="text-gray-400" size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Price */}
          <div className="text-center py-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20">
            <div className="text-5xl font-black text-white mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              $9<span className="text-2xl text-gray-400">/month</span>
            </div>
            <p className="text-emerald-500 font-medium">Pay with USDC on Solana</p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white mb-4">What's Included:</h3>
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="text-emerald-500" size={14} />
                </div>
                <span className="text-gray-300">{feature}</span>
              </div>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="space-y-4">
            {!walletConnected ? (
              <button
                data-testid="connect-wallet-btn"
                onClick={handleConnectWallet}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-lg border border-gray-700 transition-all duration-300 hover:border-emerald-500/30"
              >
                Connect Solana Wallet
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-emerald-500 mb-2">
                    <Check size={16} />
                    <span className="font-medium">Wallet Connected</span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono">DRpb...x7Qz</p>
                </div>
                <button
                  data-testid="subscribe-btn"
                  onClick={handleSubscribe}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 px-6 rounded-lg shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-102 active:scale-98"
                >
                  Subscribe for $9/month in USDC
                </button>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>Secure payment via Solana blockchain</p>
            <p>Cancel anytime • No hidden fees • Instant access</p>
          </div>
        </div>
      </div>
    </div>
  );
}