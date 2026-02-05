import { Sparkles, Zap, Crown } from 'lucide-react';
import { useState } from 'react';
import PremiumModal from './PremiumModal';

export default function PremiumBanner() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="premium-banner">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 border border-emerald-500/30 premium-glow p-8 md:p-12">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxMGI5ODEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMDktMS43OTEgNC00IDRDMC43OSAyMCAwIDE4LjIwOSAwIDE2czEuNzkxLTQgNC00IDQgMS43OTEgNCA0em0wIDQwYzAgMi4yMDktMS43OTEgNC00IDRzLTQtMS43OTEtNC00IDEuNzkxLTQgNC00IDQgMS43OTEgNCA0ek0xNiAzNmMwIDIuMjA5LTEuNzkxIDQtNCA0cy00LTEuNzkxLTQtNCAxLjc5MS00IDQtNCA0IDEuNzkxIDQgNHptMzIgMGMwIDIuMjA5LTEuNzkxIDQtNCA0cy00LTEuNzkxLTQtNCAxLjc5MS00IDQtNCA0IDEuNzkxIDQgNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Left content */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 mb-4">
                  <Sparkles className="text-emerald-500" size={32} />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4" style={{ fontFamily: 'Chivo, sans-serif' }}>
                  Accede al Alpha Premium
                </h2>
                <p className="text-lg text-gray-300 mb-6 max-w-xl">
                  Airdrops exclusivos, señales tempranas, research avanzado y consultoría personalizada
                </p>
              </div>
              
              {/* Right - Pricing Cards Preview */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Alpha Access Card */}
                <div className="bg-gray-800/50 border border-emerald-500/30 rounded-xl p-5 min-w-[180px]">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="text-emerald-500" size={20} />
                    <span className="text-white font-bold">Alpha Access</span>
                  </div>
                  <div className="text-2xl font-black text-white mb-2">
                    $30<span className="text-sm text-gray-400">/mes</span>
                  </div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>✓ Airdrops + guías</li>
                    <li>✓ Portfolio tracking</li>
                    <li>✓ Early Signals</li>
                  </ul>
                </div>
                
                {/* Alpha Pro Card */}
                <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/50 rounded-xl p-5 min-w-[180px] relative">
                  <div className="absolute -top-2 right-3 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                    POPULAR
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="text-amber-500" size={20} />
                    <span className="text-white font-bold">Alpha Pro</span>
                  </div>
                  <div className="text-2xl font-black text-white mb-2">
                    $100<span className="text-sm text-gray-400">/mes</span>
                  </div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>✓ Todo en Access</li>
                    <li>✓ Consultoría</li>
                    <li>✓ Research exclusivo</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="mt-8 text-center lg:text-left">
              <button
                data-testid="unlock-premium-btn"
                onClick={() => setShowModal(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 px-8 rounded-lg shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 text-lg"
              >
                Ver Planes Premium
              </button>
              <p className="mt-4 text-sm text-gray-500">
                Paga con USDC en Solana, Base o Arbitrum
              </p>
            </div>
          </div>
        </div>
      </section>

      <PremiumModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
