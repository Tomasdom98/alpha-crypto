import { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LiveTicker() {
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const { data } = await axios.get(`${API}/crypto/prices`);
        setPrices(data);
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (prices.length === 0) return null;

  // Duplicate for seamless loop
  const tickerItems = [...prices, ...prices];

  return (
    <div className="bg-gray-900/50 border-b border-gray-800 overflow-hidden" data-testid="live-ticker">
      <div className="flex ticker-animation">
        {tickerItems.map((crypto, index) => (
          <div
            key={`${crypto.id}-${index}`}
            className="flex items-center gap-3 px-8 py-3 whitespace-nowrap"
          >
            <span className="font-bold text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {crypto.symbol}
            </span>
            <span className="text-gray-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              ${crypto.current_price.toLocaleString()}
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