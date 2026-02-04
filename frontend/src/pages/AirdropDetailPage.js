import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ExternalLink, Check, Clock, TrendingUp, Shield, Users } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AirdropDetailPage() {
  const { id } = useParams();
  const [airdrop, setAirdrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taskStates, setTaskStates] = useState({});

  useEffect(() => {
    const fetchAirdrop = async () => {
      try {
        const { data } = await axios.get(`${API}/airdrops/${id}`);
        setAirdrop(data);
        
        // Initialize task states
        const states = {};
        data.tasks?.forEach((task) => {
          states[task.id] = task.completed;
        });
        setTaskStates(states);
      } catch (error) {
        console.error('Error fetching airdrop:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAirdrop();
  }, [id]);

  const toggleTask = (taskId) => {
    setTaskStates((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

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
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4" />
          <div className="text-emerald-500 text-xl font-semibold">Loading airdrop details...</div>
        </div>
      </div>
    );
  }

  if (!airdrop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-white mb-4">Airdrop not found</h2>
          <Link to="/airdrops" className="text-emerald-500 hover:text-emerald-400">
            Back to Airdrops
          </Link>
        </div>
      </div>
    );
  }

  const completedTasks = Object.values(taskStates).filter(Boolean).length;
  const totalTasks = airdrop.tasks?.length || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/airdrops"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Airdrops
        </Link>

        {/* Header Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 p-8 mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-start gap-6 mb-6">
              <img 
                src={airdrop.logo_url} 
                alt={airdrop.project_name} 
                className="w-24 h-24 rounded-2xl border-2 border-emerald-500/30" 
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 
                    className="text-4xl font-bold text-white" 
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {airdrop.project_name}
                  </h1>
                  {airdrop.premium && (
                    <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-xl text-gray-300 mb-4">{airdrop.description}</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg border border-gray-700 font-medium">
                    {airdrop.chain}
                  </span>
                  <span className={`px-4 py-2 rounded-lg border font-bold ${getDifficultyColor(airdrop.difficulty)}`}>
                    {airdrop.difficulty}
                  </span>
                  <span className="flex items-center gap-2 text-gray-400">
                    <Clock size={16} />
                    {new Date(airdrop.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">Estimated Reward</div>
                <div 
                  className="text-3xl font-bold text-emerald-500 mb-2" 
                  style={{ fontFamily: 'Space Grotesk, monospace' }}
                >
                  {airdrop.estimated_reward}
                </div>
                <a
                  href={airdrop.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-6 rounded-lg transition-all hover:scale-105"
                >
                  Start Now <ExternalLink size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Full Description */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                About {airdrop.project_name}
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                {airdrop.full_description || airdrop.description}
              </p>
              
              {airdrop.backing && (
                <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <Shield size={18} />
                    <span className="font-bold">Backing & Investors</span>
                  </div>
                  <p className="text-gray-300 text-sm">{airdrop.backing}</p>
                </div>
              )}

              {airdrop.timeline && (
                <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Clock size={18} />
                    <span className="font-bold">Expected Timeline</span>
                  </div>
                  <p className="text-gray-300 text-sm">{airdrop.timeline}</p>
                </div>
              )}
            </div>

            {/* Tasks Checklist */}
            {airdrop.tasks && airdrop.tasks.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Tasks to Complete
                  </h2>
                  <span className="text-emerald-500 font-bold">
                    {completedTasks}/{totalTasks}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}% complete</p>
                </div>

                <div className="space-y-3">
                  {airdrop.tasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors"
                    >
                      <Checkbox
                        checked={taskStates[task.id] || false}
                        onCheckedChange={() => toggleTask(task.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-emerald-500">Step {index + 1}</span>
                        </div>
                        <span className={`${taskStates[task.id] ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                          {task.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gray-800/30 border border-gray-700 rounded-xl">
                  <p className="text-sm text-gray-400">
                    <strong className="text-white">Pro Tip:</strong> Complete all tasks consistently and maintain activity to maximize your airdrop allocation. Higher trading volume and longer participation usually result in better rewards.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Chain</div>
                  <div className="text-white font-medium">{airdrop.chain}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Difficulty</div>
                  <span className={`inline-block px-3 py-1 rounded-lg border text-sm font-bold ${getDifficultyColor(airdrop.difficulty)}`}>
                    {airdrop.difficulty}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Status</div>
                  <span className="inline-block px-3 py-1 rounded-lg border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-sm font-bold capitalize">
                    {airdrop.status}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Deadline</div>
                  <div className="text-white font-medium">
                    {new Date(airdrop.deadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Link */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Get Started</h3>
              <p className="text-sm text-gray-400 mb-4">
                Use our referral link to maximize your rewards:
              </p>
              <a
                href={airdrop.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-4 rounded-lg transition-all hover:scale-105"
              >
                Visit {airdrop.project_name}
                <ExternalLink size={18} />
              </a>
            </div>

            {/* Important Notes */}
            <div className="glass-card rounded-2xl p-6 bg-amber-500/5 border-amber-500/20">
              <h3 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
                <TrendingUp size={20} />
                Important Notes
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>No official airdrop confirmation unless stated</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>DYOR (Do Your Own Research) before participating</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>Never share your seed phrase or private keys</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>Be aware of gas fees and trading costs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
