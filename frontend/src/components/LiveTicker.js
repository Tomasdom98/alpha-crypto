import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LiveTicker() {
  const [prices, setPrices] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPrices = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const { data } = await axios.get(`${API}/crypto/prices`);
      setPrices(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Fetch immediately on mount
    fetchPrices();
    
    // Update every 30 seconds
    const interval = setInterval(fetchPrices, 30000);

    return () => clearInterval(interval);
  }, [fetchPrices]);

  if (prices.length === 0) {
    return (
      <div className="bg-gray-900/50 border-b border-gray-800 py-3 px-4">
        <div className="flex items-center gap-2 text-gray-500">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading prices...</span>
        </div>
      </div>
    );
  }

  // Duplicate for seamless loop
  const tickerItems = [...prices, ...prices];

  return (
    <div className="bg-gray-900/50 border-b border-gray-800 overflow-hidden relative" data-testid="live-ticker">
      {/* Live indicator */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2 bg-gray-900/90 px-3 py-1 rounded-full border border-gray-700/50">
        <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
        <span className="text-xs text-gray-400 font-medium">LIVE</span>
      </div>
      
      <div className="flex ticker-animation ml-24">
        {tickerItems.map((crypto, index) => (
          <div
            key={`${crypto.id}-${index}`}
            className="flex items-center gap-3 px-8 py-3 whitespace-nowrap"
          >
            <span className="font-bold text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {crypto.symbol}
            </span>
            <span className="text-gray-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              ${crypto.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span
              className={`flex items-center gap-1 text-sm ${
                crypto.price_change_24h >= 0 ? 'text-emerald-500' : 'text-red-500'
              }`}
            >
              {crypto.price_change_24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(crypto.price_change_24h).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
