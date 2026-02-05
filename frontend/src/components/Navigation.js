import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Crown, Sparkles, Bot } from 'lucide-react';
import { useState } from 'react';
import PremiumModal from './PremiumModal';
import AlphaiChat from './AlphaiChat';

const OWL_ICON_URL = "https://customer-assets.emergentagent.com/job_aa332bb7-9735-40f0-a436-aa4f8697591d/artifacts/hvgiid52_Gemini_Generated_Image_abg785abg785abg7.png";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showAlphai, setShowAlphai] = useState(false);
  const location = useLocation();

  // Free content
  const freeItems = [
    { path: '/', label: 'Inicio' },
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
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-2xl font-bold transition-all duration-300 group-hover:scale-105">
              <span className="text-emerald-400" style={{ fontFamily: 'serif' }}>α</span>
              <span className="text-white">C</span>
            </span>
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

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {/* ALPHA-I Button */}
            <button
              onClick={() => setShowAlphai(true)}
              data-testid="alphai-nav-btn"
              className="px-3 py-1.5 rounded-lg text-sm font-mono font-medium text-emerald-400 border border-emerald-500/40 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all"
            >
              ALPHA-I
            </button>
            
            {/* Premium Button */}
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
            
            {/* ALPHA-I Button Mobile */}
            <button
              onClick={() => {
                setIsOpen(false);
                setShowAlphai(true);
              }}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold py-3 px-4 rounded-lg transition-all"
            >
              ALPHA-I
              <span className="text-gray-400 text-sm font-sans">- Asistente DeFi</span>
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false);
                setShowPremiumModal(true);
              }}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-4 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
            >
              <Sparkles size={18} />
              Ver Planes Premium
            </button>
          </div>
        </div>
      )}
      
      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
      <AlphaiChat isOpen={showAlphai} onClose={() => setShowAlphai(false)} />
    </nav>
  );
}
