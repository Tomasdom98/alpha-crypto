import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Crown, Sparkles, Bot, Globe } from 'lucide-react';
import { useState } from 'react';
import PremiumModal from './PremiumModal';
import AlphaiChat from './AlphaiChat';
import { useLanguage } from '@/context/LanguageContext';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showAlphai, setShowAlphai] = useState(false);
  const location = useLocation();
  const { language, toggleLanguage, t } = useLanguage();

  // Free content
  const freeItems = [
    { path: '/', label: t('nav.home') },
    { path: '/articles', label: t('nav.research') },
    { path: '/indices', label: t('nav.indices') },
  ];

  // Premium content
  const premiumItems = [
    { path: '/portfolio', label: t('nav.portfolio') },
    { path: '/signals', label: t('nav.signals') },
    { path: '/airdrops', label: t('nav.airdrops') },
    { path: '/consulting', label: t('nav.consulting') },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <span className="text-2xl font-bold transition-all duration-300 group-hover:scale-110">
                <span className="gradient-text-primary" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.75rem' }}>α</span>
              </span>
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                data-testid={`nav-${item.path.replace('/', '') || 'home'}`}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Separator */}
            <div className="h-6 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent mx-3" />
            
            {/* Premium Items */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20">
              <Crown className="w-3.5 h-3.5 text-violet-400" />
              {premiumItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.path.replace('/', '')}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-violet-500/20 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.2)]'
                      : 'text-gray-400 hover:text-violet-300 hover:bg-violet-500/10'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Buttons + Language Selector */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              data-testid="language-toggle"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 border border-white/5 hover:border-white/10"
              title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              <Globe size={14} />
              <span className="font-bold">{language === 'es' ? '🇪🇸 ES' : '🇺🇸 EN'}</span>
            </button>

            {/* ALPHA-I Button */}
            <button
              onClick={() => setShowAlphai(true)}
              data-testid="alphai-nav-btn"
              className="relative px-4 py-2 rounded-xl text-sm font-bold font-mono overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 group-hover:from-emerald-500/30 group-hover:to-cyan-500/30 transition-all duration-300" />
              <div className="absolute inset-0 border border-emerald-500/40 rounded-xl group-hover:border-emerald-400/60 transition-colors duration-300" />
              <span className="relative flex items-center gap-2 text-emerald-400">
                <Bot size={16} className="text-cyan-400" />
                ALPHA-I
              </span>
              <div className="absolute inset-0 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-shadow duration-300 pointer-events-none" />
            </button>
            
            {/* Premium Button */}
            <button
              onClick={() => setShowPremiumModal(true)}
              data-testid="premium-nav-btn"
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Sparkles size={16} />
              <span>{t('nav.premium')}</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            data-testid="mobile-menu-toggle"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-white/5 bg-black/90 backdrop-blur-2xl" data-testid="mobile-menu">
          <div className="px-4 py-4 space-y-2">
            {/* Language Toggle Mobile */}
            <button
              onClick={toggleLanguage}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 border border-white/5 mb-4"
            >
              <Globe size={16} />
              <span className="font-bold">{language === 'es' ? '🇪🇸 Español' : '🇺🇸 English'}</span>
            </button>

            {/* Free Section */}
            <div className="text-xs text-gray-500 uppercase tracking-wider px-4 mb-2">{t('nav.freeContent')}</div>
            {freeItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Premium Section */}
            <div className="border-t border-white/5 pt-4 mt-4">
              <div className="flex items-center gap-2 text-xs text-violet-400 uppercase tracking-wider px-4 mb-2">
                <Crown size={12} />
                {t('nav.premium')}
              </div>
              {premiumItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                      : 'text-gray-400 hover:text-violet-300 hover:bg-violet-500/10'
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
              className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-bold py-3 px-4 rounded-xl transition-all duration-300"
            >
              <Bot size={18} className="text-cyan-400" />
              ALPHA-I
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false);
                setShowPremiumModal(true);
              }}
              className="w-full mt-2 btn-primary flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              {t('nav.premium')}
            </button>
          </div>
        </div>
      )}
      
      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
      <AlphaiChat isOpen={showAlphai} onClose={() => setShowAlphai(false)} onUpgrade={() => setShowPremiumModal(true)} />
    </nav>
  );
}
