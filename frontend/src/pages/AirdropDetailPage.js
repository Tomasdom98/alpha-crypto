import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, ExternalLink, CheckCircle2, Circle, Zap, Users, Calendar, Shield } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL + '/api';

function AirdropDetailPage() {
  const { airdropId } = useParams();
  const [airdrop, setAirdrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});
  const { language } = useLanguage();
  const isEs = language === 'es';

  const tx = {
    loading: isEs ? 'Cargando detalles del airdrop...' : 'Loading airdrop details...',
    notFound: isEs ? 'Airdrop No Encontrado' : 'Airdrop Not Found',
    backToAirdrops: isEs ? 'Volver a Airdrops' : 'Back to Airdrops',
    premiumAlpha: 'Premium Alpha',
    difficulty: isEs ? 'Dificultad' : 'Difficulty',
    deadline: isEs ? 'Fecha límite' : 'Deadline',
    estimatedReward: isEs ? 'Recompensa Estimada*' : 'Estimated Reward*',
    aboutAirdrop: isEs ? 'Acerca de Este Airdrop' : 'About This Airdrop',
    tasksToComplete: isEs ? 'Tareas a Completar' : 'Tasks to Complete',
    completed: isEs ? 'completadas' : 'completed',
    step: isEs ? 'Paso' : 'Step',
    investors: isEs ? 'Inversores y Respaldo' : 'Investors and Backing',
    timeline: isEs ? 'Cronograma' : 'Timeline',
    status: 'Status',
    startAirdrop: isEs ? 'Iniciar Este Airdrop' : 'Start This Airdrop',
    viewAll: isEs ? 'Ver Todos los Airdrops' : 'View All Airdrops',
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(API + '/airdrops/' + airdropId);
        setAirdrop(response.data);
        const initial = {};
        const tasks = response.data.tasks || [];
        for (let i = 0; i < tasks.length; i++) {
          initial[tasks[i].id] = tasks[i].completed || false;
        }
        setCompletedTasks(initial);
      } catch (err) {
        setError('Airdrop not found');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [airdropId]);

  function toggleTask(taskId) {
    setCompletedTasks(function(prev) {
      const newState = Object.assign({}, prev);
      newState[taskId] = !prev[taskId];
      return newState;
    });
    axios.post(API + '/airdrops/' + airdropId + '/tasks/' + taskId + '/toggle').catch(function() {});
  }

  function getDifficultyColor(difficulty) {
    const d = (difficulty || '').toLowerCase();
    if (d === 'easy') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (d === 'medium') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (d === 'hard') return 'bg-red-500/20 text-red-400 border-red-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-emerald-500 text-xl font-mono">{tx.loading}</div>
      </div>
    );
  }

  if (error || !airdrop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">{tx.notFound}</h2>
          <Link to="/airdrops" className="bg-emerald-500 text-white px-6 py-3 rounded-lg">{tx.backToAirdrops}</Link>
        </div>
      </div>
    );
  }

  const tasks = airdrop.tasks || [];
  let completedCount = 0;
  const taskIds = Object.keys(completedTasks);
  for (let i = 0; i < taskIds.length; i++) {
    if (completedTasks[taskIds[i]]) completedCount++;
  }
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  return (
    <div className="min-h-screen py-12" data-testid="airdrop-detail-page">
      <div className="max-w-5xl mx-auto px-4">
        <Link to="/airdrops" className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-500 mb-8" data-testid="back-to-airdrops">
          <ArrowLeft size={20} /> Back to Airdrops
        </Link>

        <div className={'glass-card rounded-2xl p-8 mb-8 ' + (airdrop.premium ? 'premium-glow' : '')}>
          <div className="flex flex-col md:flex-row items-start gap-6">
            {airdrop.logo_url && <img src={airdrop.logo_url} alt={airdrop.project_name} className="w-24 h-24 rounded-xl object-cover" data-testid="airdrop-logo" />}
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-black text-white" data-testid="airdrop-title">{airdrop.project_name}</h1>
                {airdrop.premium && <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1 rounded-full text-sm font-bold">Premium Alpha</span>}
              </div>
              
              <p className="text-gray-300 text-lg mb-4" data-testid="airdrop-description">{airdrop.description}</p>

              <div className="flex items-center gap-3 flex-wrap">
                <span className={'px-4 py-2 rounded-lg border text-sm font-bold ' + getDifficultyColor(airdrop.difficulty)}>{airdrop.difficulty} Difficulty</span>
                {airdrop.chain && <span className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 text-sm">{airdrop.chain}</span>}
                <span className="text-gray-500 flex items-center gap-2 text-sm">
                  <Clock size={16} /> Deadline: {new Date(airdrop.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6 text-center min-w-[200px]">
              <div className="text-sm text-gray-400 mb-2">Estimated Reward*</div>
              <div className="text-3xl font-black text-emerald-500" data-testid="airdrop-reward">{airdrop.estimated_reward}</div>
              {airdrop.timeline && <div className="text-xs text-gray-500 mt-2">{airdrop.timeline}</div>}
              {airdrop.reward_note && <div className="text-xs text-amber-400/80 mt-2 leading-tight">{airdrop.reward_note}</div>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {airdrop.full_description && (
              <div className="glass-card rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="text-emerald-500" size={24} /> About This Airdrop
                </h2>
                <p className="text-gray-300 leading-relaxed" data-testid="airdrop-full-description">{airdrop.full_description}</p>
              </div>
            )}

            {tasks.length > 0 && (
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-500" size={24} /> Tasks to Complete
                  </h2>
                  <span className="text-sm text-gray-400">{completedCount}/{totalTasks} completed</span>
                </div>

                <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full" style={{ width: progressPercent + '%' }}></div>
                </div>

                <div className="space-y-3" data-testid="airdrop-tasks-list">
                  {tasks.map(function(task, index) {
                    const isCompleted = completedTasks[task.id];
                    return (
                      <button
                        key={task.id}
                        onClick={function() { toggleTask(task.id); }}
                        className={'w-full flex items-start gap-4 p-4 rounded-lg text-left ' + (isCompleted ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-gray-800/50 border border-gray-700')}
                        data-testid={'task-' + task.id}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {isCompleted ? <CheckCircle2 className="text-emerald-500" size={24} /> : <Circle className="text-gray-500" size={24} />}
                        </div>
                        <div className="flex-1">
                          <span className="text-xs text-gray-500 font-mono mb-1 block">Step {index + 1}</span>
                          <span className={isCompleted ? 'text-gray-400 line-through' : 'text-gray-200'}>{task.description}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {airdrop.backing && (
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Users className="text-emerald-500" size={20} /> Investors and Backing
                </h3>
                <p className="text-gray-300 text-sm" data-testid="airdrop-backing">{airdrop.backing}</p>
              </div>
            )}

            {airdrop.timeline && (
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Calendar className="text-emerald-500" size={20} /> Timeline
                </h3>
                <p className="text-gray-300 text-sm" data-testid="airdrop-timeline">{airdrop.timeline}</p>
              </div>
            )}

            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Shield className="text-emerald-500" size={20} /> Status
              </h3>
              <div className="flex items-center gap-2">
                <span className={'w-3 h-3 rounded-full ' + (airdrop.status === 'active' ? 'bg-emerald-500' : 'bg-gray-500')}></span>
                <span className="text-gray-300 capitalize">{airdrop.status}</span>
              </div>
            </div>

            <a href={airdrop.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 px-6 rounded-xl" data-testid="airdrop-cta-button">
              Start This Airdrop <ExternalLink size={16} />
            </a>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link to="/airdrops" className="inline-flex items-center gap-2 bg-gray-800 text-white font-bold py-3 px-6 rounded-lg">
            <ArrowLeft size={20} /> View All Airdrops
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AirdropDetailPage;
