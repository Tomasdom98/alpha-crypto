import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight, Gift, Target, Users, TrendingUp, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function EducationalSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-10 glass-card rounded-2xl overflow-hidden border border-emerald-500/20">
      {/* Header - Always visible */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-800/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/20">
            <Gift className="text-emerald-500" size={28} />
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              ¿Qué es un Airdrop?
            </h2>
            <p className="text-gray-400 text-sm mt-1">Aprende cómo funcionan y maximiza tus recompensas</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="text-emerald-500" size={24} />
        ) : (
          <ChevronDown className="text-emerald-500" size={24} />
        )}
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-6 border-t border-gray-800">
          {/* Main explanation */}
          <div className="pt-6">
            <p className="text-gray-300 leading-relaxed">
              Un <span className="text-emerald-400 font-semibold">airdrop</span> es una distribución gratuita de tokens 
              que los proyectos crypto realizan para recompensar a usuarios tempranos y construir comunidad. 
              En lugar de una ICO tradicional, los proyectos regalan tokens a quienes interactúan con su plataforma.
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <Target className="text-blue-400" size={20} />
                <h3 className="font-bold text-white">¿Cómo funcionan?</h3>
              </div>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• Usa la aplicación o protocolo</li>
                <li>• Completa tareas específicas (trades, bridges, stakes)</li>
                <li>• Acumula puntos o volumen de actividad</li>
                <li>• Cuando lanzan el token, recibes tu parte proporcional</li>
              </ul>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <Users className="text-purple-400" size={20} />
                <h3 className="font-bold text-white">¿Por qué los proyectos hacen airdrops?</h3>
              </div>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• Descentralizar la propiedad del token</li>
                <li>• Recompensar a early adopters</li>
                <li>• Crear una comunidad leal</li>
                <li>• Generar actividad y liquidez inicial</li>
              </ul>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="text-emerald-400" size={20} />
                <h3 className="font-bold text-white">¿Cómo calificar?</h3>
              </div>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• Mantén actividad constante (no solo una vez)</li>
                <li>• Genera volumen de trading real</li>
                <li>• Usa múltiples features del protocolo</li>
                <li>• Participa en testnets si están disponibles</li>
              </ul>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="text-amber-400" size={20} />
                <h3 className="font-bold text-white">Expectativas realistas</h3>
              </div>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• Las recompensas varían según tu actividad</li>
                <li>• No todos los proyectos lanzan token</li>
                <li>• Nunca inviertas más de lo que puedes perder</li>
                <li>• Los airdrops "confirmados" aún pueden cambiar</li>
              </ul>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/5 rounded-xl p-5 border border-emerald-500/20">
            <h3 className="font-bold text-emerald-400 mb-3">💡 Tips de Alpha Crypto</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>• <strong>Diversifica:</strong> Participa en múltiples airdrops para reducir riesgo</p>
              <p>• <strong>Documenta:</strong> Usa los links de referido para obtener bonificaciones extras</p>
              <p>• <strong>Consistencia:</strong> La actividad regular vale más que un solo trade grande</p>
              <p>• <strong>Comunidad:</strong> Únete a Discords oficiales para no perderte snapshots</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
        <div className="text-emerald-500 text-xl font-mono">Cargando airdrops...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <Gift className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-medium">Oportunidades Verificadas</span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-black text-white mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            data-testid="airdrops-page-heading"
          >
            Airdrops Activos
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Completa tareas y acumula puntos para maximizar tus recompensas. Click en cualquier airdrop para ver la guía completa.
          </p>
        </div>

        {/* Educational Section */}
        <EducationalSection />

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-gray-400" data-testid="airdrops-count">
            Mostrando {airdrops.length} airdrop{airdrops.length !== 1 ? 's' : ''} activo{airdrops.length !== 1 ? 's' : ''}
          </div>
          <div className="text-sm text-gray-500">
            <span className="text-emerald-500">●</span> Premium = Mayor potencial de recompensa
          </div>
        </div>

        {/* Airdrops List */}
        {airdrops.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">No hay airdrops disponibles</p>
          </div>
        ) : (
          <div className="space-y-6">
            {airdrops.map((airdrop) => (
              <Link
                to={`/airdrops/${airdrop.id}`}
                key={airdrop.id}
                data-testid={`airdrop-card-${airdrop.id}`}
                className={`block glass-card rounded-xl p-6 card-hover transition-all hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 ${airdrop.premium ? 'border-amber-500/30 hover:border-amber-500/50' : ''}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4 flex-1">
                    {airdrop.logo_url && (
                      <img src={airdrop.logo_url} alt={airdrop.project_name} className="w-16 h-16 rounded-lg object-cover" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                          {airdrop.project_name}
                        </h3>
                        {airdrop.premium && (
                          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg tracking-wide uppercase">
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
                          <Clock size={14} /> {new Date(airdrop.deadline).toLocaleDateString('es-ES')}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {airdrop.tasks?.length || 0} tareas
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm text-gray-400 mb-1">Recompensa Estimada*</div>
                    <div
                      className="text-2xl font-bold text-emerald-500"
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      {airdrop.estimated_reward}
                    </div>
                    {airdrop.timeline && (
                      <div className="text-xs text-gray-500 mt-1">{airdrop.timeline}</div>
                    )}
                    <div className="text-xs text-amber-400/70 mt-1 max-w-[150px]">*Según volumen y puntos</div>
                  </div>
                </div>

                {/* Tasks Preview */}
                {airdrop.tasks && airdrop.tasks.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-gray-400 mb-2">Tareas a Completar:</h4>
                    <div className="space-y-2">
                      {airdrop.tasks.slice(0, 2).map((task) => (
                        <div key={task.id} className="text-sm text-gray-300 pl-4 border-l-2 border-gray-700">
                          {task.description}
                        </div>
                      ))}
                      {airdrop.tasks.length > 2 && (
                        <div className="text-xs text-gray-500 pl-4">+ {airdrop.tasks.length - 2} tareas más</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div className="text-sm text-gray-500">
                    Estado: <span className="text-emerald-500 capitalize">{airdrop.status === 'active' ? 'Activo' : airdrop.status}</span>
                  </div>
                  <span className="flex items-center gap-2 text-emerald-500 font-bold text-sm group-hover:gap-3 transition-all">
                    Ver Detalles
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
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
