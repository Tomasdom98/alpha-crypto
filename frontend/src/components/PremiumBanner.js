import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import PremiumModal from './PremiumModal';

export default function PremiumBanner() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="premium-banner">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 border border-emerald-500/30 premium-glow p-8 md:p-12">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxMGI5ODEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMDktMS43OTEgNC00IDRDMC43OSAyMCAwIDE4LjIwOSAwIDE2czEuNzkxLTQgNC00IDQgMS43OTEgNCA0em0wIDQwYzAgMi4yMDktMS43OTEgNC00IDRzLTQtMS43OTEtNC00IDEuNzkxLTQgNC00IDQgMS43OTEgNCA0ek0xNiAzNmMwIDIuMjA5LTEuNzkxIDQtNCA0cy00LTEuNzkxLTQtNCAxLjc5MS00IDQtNCA0IDEuNzkxIDQgNHptMzIgMGMwIDIuMjA5LTEuNzkxIDQtNCA0cy00LTEuNzkxLTQtNCAxLjc5MS00IDQtNCA0IDEuNzkxIDQgNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="text-emerald-500" size={32} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4" style={{ fontFamily: 'Chivo, sans-serif' }}>
              Unlock Premium Alpha
            </h2>
            <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
              Get exclusive airdrops, deep-dive analysis, early market signals, and advanced investment research for just $20/month
            </p>
            <button
              data-testid="unlock-premium-btn"
              onClick={() => setShowModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 px-8 rounded-lg shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 text-lg"
            >
              Subscribe with USDC on Solana
            </button>
            <div className="mt-6 flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                Exclusive Content
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                Premium Airdrops
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                Early Signals
              </div>
            </div>
          </div>
        </div>
      </section>

      <PremiumModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}