import { useEffect, useState } from 'react';
import axios from 'axios';
import { Clock, ExternalLink, Filter, TrendingUp } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import PremiumModal from '@/components/PremiumModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AirdropsPage() {
  const [airdrops, setAirdrops] = useState([]);
  const [filteredAirdrops, setFilteredAirdrops] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [loading, setLoading] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [taskStates, setTaskStates] = useState({});

  useEffect(() => {
    const fetchAirdrops = async () => {
      try {
        const { data } = await axios.get(`${API}/airdrops`);
        setAirdrops(data);
        setFilteredAirdrops(data);

        // Initialize task states
        const states = {};
        data.forEach((airdrop) => {
          airdrop.tasks.forEach((task) => {
            states[task.id] = task.completed;
          });
        });
        setTaskStates(states);
      } catch (error) {
        console.error('Error fetching airdrops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAirdrops();
  }, []);

  useEffect(() => {
    let filtered = airdrops;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((a) => a.status === selectedStatus);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter((a) => a.difficulty.toLowerCase() === selectedDifficulty);
    }

    setFilteredAirdrops(filtered);
  }, [selectedStatus, selectedDifficulty, airdrops]);

  const toggleTask = (taskId) => {
    setTaskStates((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
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

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : 'Expired';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-emerald-500 text-xl font-mono">Loading airdrops...</div>
      </div>
    );
  }

  return (
    <>
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
          </div>

          {/* Filters */}
          <div className="mb-8">
            <div className="flex items-center gap-4 flex-wrap">
              <Filter className="text-gray-500" size={20} />
              
              {/* Status Filter */}
              <div className="flex gap-2">
                {['all', 'active', 'expired'].map((status) => (
                  <button
                    key={status}
                    data-testid={`status-filter-${status}`}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                      selectedStatus === status
                        ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Difficulty Filter */}
              <div className="flex gap-2">
                {['all', 'easy', 'medium', 'hard'].map((difficulty) => (
                  <button
                    key={difficulty}
                    data-testid={`difficulty-filter-${difficulty}`}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                      selectedDifficulty === difficulty
                        ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6 text-gray-400" data-testid="airdrops-count">
            Showing {filteredAirdrops.length} airdrop{filteredAirdrops.length !== 1 ? 's' : ''}
          </div>

          {/* Airdrops List */}
          {filteredAirdrops.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No airdrops found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAirdrops.map((airdrop) => (
                <div
                  key={airdrop.id}
                  data-testid={`airdrop-card-${airdrop.id}`}
                  className={`glass-card rounded-xl p-6 card-hover ${airdrop.premium ? 'premium-glow' : ''}`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <img src={airdrop.logo_url} alt={airdrop.project_name} className="w-16 h-16 rounded-lg" />
                      <div>
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
                        <p className="text-gray-400 mb-3">{airdrop.description}</p>
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded border ${getDifficultyColor(airdrop.difficulty)} text-sm font-medium`}>
                            {airdrop.difficulty}
                          </span>
                          <span className="text-gray-500 flex items-center gap-1 text-sm">
                            <Clock size={14} /> {getTimeRemaining(airdrop.deadline)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400 mb-1">Estimated Reward</div>
                      <div
                        className="text-2xl font-bold text-emerald-500"
                        style={{ fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        {airdrop.estimated_reward}
                      </div>
                    </div>
                  </div>

                  {/* Tasks Checklist */}
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <TrendingUp size={20} className="text-emerald-500" />
                      Tasks to Complete
                    </h4>
                    <div className="space-y-3">
                      {airdrop.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                          data-testid={`task-${task.id}`}
                        >
                          <Checkbox
                            data-testid={`task-checkbox-${task.id}`}
                            checked={taskStates[task.id] || false}
                            onCheckedChange={() => toggleTask(task.id)}
                            className="mt-1"
                          />
                          <span className={`flex-1 ${taskStates[task.id] ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                            {task.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <div className="text-sm text-gray-500">
                      Deadline: {new Date(airdrop.deadline).toLocaleDateString()}
                    </div>
                    {airdrop.premium ? (
                      <button
                        data-testid={`unlock-airdrop-${airdrop.id}-btn`}
                        onClick={() => setShowPremiumModal(true)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-lg transition-all hover:scale-105 active:scale-95 text-sm"
                      >
                        Unlock Premium
                      </button>
                    ) : (
                      <a
                        href={airdrop.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`visit-project-${airdrop.id}-link`}
                        className="flex items-center gap-2 text-emerald-500 hover:text-emerald-400 font-medium transition-colors"
                      >
                        Visit Project <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
    </>
  );
}