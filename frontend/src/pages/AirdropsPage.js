import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AirdropsPage() {
  const [airdrops, setAirdrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAirdrops = async () => {
      try {
        const { data } = await axios.get(`${API}/airdrops`);
        setAirdrops(data);
      } catch (error) {
        console.error('Error fetching airdrops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAirdrops();
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'hard':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-emerald-500 text-xl font-mono">Loading airdrops...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl md:text-5xl font-black text-white mb-4"
            style={{ fontFamily: 'Chivo, sans-serif' }}
            data-testid="airdrops-page-heading"
          >
            Active Airdrops
          </h1>
          <p className="text-gray-400 text-lg">Track and complete airdrop tasks to maximize rewards</p>
          <p className="text-gray-500 text-sm mt-2">Click on any airdrop to see full details and step-by-step guide</p>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-400" data-testid="airdrops-count">
          Showing {airdrops.length} active airdrop{airdrops.length !== 1 ? 's' : ''}
        </div>

        {/* Airdrops List */}
        {airdrops.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">No airdrops found in Sanity</p>
            <p className="text-gray-600 text-sm">Create airdrops at: https://15c5x8s5.sanity.studio</p>
          </div>
        ) : (
          <div className="space-y-6">
            {airdrops.map((airdrop) => (
              <Link
                to={`/airdrops/${airdrop.id}`}
                key={airdrop.id}
                data-testid={`airdrop-card-${airdrop.id}`}
                className={`block glass-card rounded-xl p-6 card-hover transition-all hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 ${airdrop.premium ? 'premium-glow' : ''}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4 flex-1">
                    {airdrop.logo_url && (
                      <img src={airdrop.logo_url} alt={airdrop.project_name} className="w-16 h-16 rounded-lg object-cover" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Chivo, sans-serif' }}>
                          {airdrop.project_name}
                        </h3>
                        {airdrop.premium && (
                          <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg tracking-wide uppercase">
                            Premium
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 mb-3 line-clamp-2">{airdrop.description}</p>
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className={`px-3 py-1 rounded border ${getDifficultyColor(airdrop.difficulty)} text-sm font-medium capitalize`}>
                          {airdrop.difficulty}
                        </span>
                        {airdrop.chain && (
                          <span className="px-3 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-sm">
                            {airdrop.chain}
                          </span>
                        )}
                        <span className="text-gray-500 flex items-center gap-1 text-sm">
                          <Clock size={14} /> {new Date(airdrop.deadline).toLocaleDateString()}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {airdrop.tasks?.length || 0} tasks
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm text-gray-400 mb-1">Estimated Reward</div>
                    <div
                      className="text-2xl font-bold text-emerald-500"
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      {airdrop.estimated_reward}
                    </div>
                    {airdrop.timeline && (
                      <div className="text-xs text-gray-500 mt-1">{airdrop.timeline}</div>
                    )}
                  </div>
                </div>

                {/* Tasks Preview */}
                {airdrop.tasks && airdrop.tasks.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-gray-400 mb-2">Tasks to Complete:</h4>
                    <div className="space-y-2">
                      {airdrop.tasks.slice(0, 2).map((task) => (
                        <div key={task.id} className="text-sm text-gray-300 pl-4 border-l-2 border-gray-700">
                          {task.description}
                        </div>
                      ))}
                      {airdrop.tasks.length > 2 && (
                        <div className="text-xs text-gray-500 pl-4">+ {airdrop.tasks.length - 2} more tasks</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div className="text-sm text-gray-500">
                    Status: <span className="text-emerald-500 capitalize">{airdrop.status}</span>
                  </div>
                  <span className="flex items-center gap-2 text-emerald-500 font-bold text-sm group-hover:gap-3 transition-all">
                    View Details
                    <ChevronRight size={18} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}