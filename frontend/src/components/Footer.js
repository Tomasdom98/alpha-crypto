import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900/50 border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">
                Ʉ
              </div>
              <span className="font-bold text-xl text-white" style={{ fontFamily: 'Chivo, sans-serif' }}>
                Alpha Crypto
              </span>
            </div>
            <p className="text-gray-400 text-sm max-w-md">
              Tu fuente de alpha en crypto. Análisis profundo, airdrops verificados, e insights de mercado para inversores inteligentes.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Platform</h4>
            <div className="space-y-2">
              <Link to="/articles" className="block text-gray-400 hover:text-emerald-500 text-sm transition-colors">
                Articles
              </Link>
              <Link to="/airdrops" className="block text-gray-400 hover:text-emerald-500 text-sm transition-colors">
                Airdrops
              </Link>
              <Link to="/indices" className="block text-gray-400 hover:text-emerald-500 text-sm transition-colors">
                Market Indices
              </Link>
              <Link to="/analysis" className="block text-gray-400 hover:text-emerald-500 text-sm transition-colors">
                Analysis
              </Link>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-bold text-white mb-4">Community</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-400 hover:text-emerald-500 text-sm transition-colors">
                Twitter
              </a>
              <a href="#" className="block text-gray-400 hover:text-emerald-500 text-sm transition-colors">
                Discord
              </a>
              <a href="#" className="block text-gray-400 hover:text-emerald-500 text-sm transition-colors">
                Telegram
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2024 Alpha Crypto. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
