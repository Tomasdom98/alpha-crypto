import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Crown, Sparkles } from 'lucide-react';
import { useState } from 'react';
import PremiumModal from './PremiumModal';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const location = useLocation();

  // Free content
  const freeItems = [
    { path: '/', label: 'Home' },
    { path: '/articles', label: 'Artículos' },
    { path: '/indices', label: 'Índices' },
    { path: '/airdrops', label: 'Airdrops' },
  ];

  // Premium content
  const premiumItems = [
    { path: '/portfolio', label: 'Portfolio' },
    { path: '/signals', label: 'Señales' },
    { path: '/consulting', label: 'Consultoría' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-gray-900/80 border-b border-gray-800/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-lg overflow-hidden bg-[#1a1f2e] shadow-lg shadow-emerald-500/10 transition-all duration-300 group-hover:shadow-emerald-500/30 group-hover:scale-105">
              <img 
                src="https://customer-assets.emergentagent.com/job_aa332bb7-9735-40f0-a436-aa4f8697591d/artifacts/3t4s66a5_Gemini_Generated_Image_2rrfmj2rrfmj2rrf.png" 
                alt="Alpha Crypto Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-xl text-white transition-colors group-hover:text-emerald-400" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Alpha Crypto
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Free Items */}
            {freeItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Separator */}
            <div className="h-6 w-px bg-gray-700 mx-2" />
            
            {/* Premium Items */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              {premiumItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'text-amber-300/80 hover:text-amber-300 hover:bg-amber-500/10'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button
              onClick={() => setShowPremiumModal(true)}
              data-testid="premium-nav-btn"
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-2 px-4 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Sparkles size={16} />
              <span>Premium</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            data-testid="mobile-menu-toggle"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-900/95 backdrop-blur-xl" data-testid="mobile-menu">
          <div className="px-4 py-4 space-y-2">
            {/* Free Section */}
            <div className="text-xs text-gray-500 uppercase tracking-wider px-4 mb-2">Contenido Gratuito</div>
            {freeItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Premium Section */}
            <div className="border-t border-gray-800 pt-4 mt-4">
              <div className="flex items-center gap-2 text-xs text-amber-500 uppercase tracking-wider px-4 mb-2">
                <Crown size={12} />
                Premium
              </div>
              {premiumItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'text-amber-300/80 hover:text-amber-300 hover:bg-amber-500/10'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            <button
              onClick={() => {
                setIsOpen(false);
                setShowPremiumModal(true);
              }}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-4 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
            >
              <Sparkles size={18} />
              Ver Planes Premium
            </button>
          </div>
        </div>
      )}
      
      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
    </nav>
  );
}
