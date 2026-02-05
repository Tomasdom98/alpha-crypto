import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Clock, TrendingUp, AlertCircle, Building2, Coins, LineChart } from 'lucide-react';
import OwlSeal from '@/components/OwlSeal';
import { useLanguage } from '@/context/LanguageContext';

const EVENTS = [
  { id: '1', date: '2026-02-12', time: '08:30 EST', name: 'CPI USA', desc: 'Inflación enero', cat: 'economic', impact: 'neutral', imp: 'high' },
  { id: '2', date: '2026-02-19', time: '14:00 EST', name: 'FOMC Minutes', desc: 'Minutas Fed', cat: 'fed', impact: 'neutral', imp: 'medium' },
  { id: '3', date: '2026-02-20', time: '16:00 EST', name: 'Coinbase Q4', desc: 'Earnings Q4', cat: 'earnings', impact: 'bullish', imp: 'high' },
  { id: '4', date: '2026-02-25', time: '08:00 UTC', name: 'ARB Unlock', desc: '92.65M ARB', cat: 'unlock', impact: 'bearish', imp: 'medium' },
  { id: '5', date: '2026-02-28', time: '08:00 UTC', name: 'BTC Options', desc: 'Options expiry', cat: 'options', impact: 'neutral', imp: 'high' },
  { id: '6', date: '2026-03-05', time: '16:00 EST', name: 'MicroStrategy', desc: 'Q4 earnings', cat: 'earnings', impact: 'bullish', imp: 'medium' },
  { id: '7', date: '2026-03-12', time: '08:30 EST', name: 'CPI USA', desc: 'Inflación febrero', cat: 'economic', impact: 'neutral', imp: 'high' },
  { id: '8', date: '2026-03-18', time: '14:00 EST', name: 'FOMC Decision', desc: 'Decisión tasas', cat: 'fed', impact: 'neutral', imp: 'high' },
  { id: '9', date: '2026-03-20', time: '08:00 UTC', name: 'OP Unlock', desc: '31M OP', cat: 'unlock', impact: 'bearish', imp: 'medium' },
  { id: '10', date: '2026-03-28', time: '08:00 UTC', name: 'ETH Options', desc: 'Q1 expiry', cat: 'options', impact: 'neutral', imp: 'high' },
];

function MacroCalendarPage() {
  const [month, setMonth] = useState(new Date(2026, 1, 1));
  const [filter, setFilter] = useState('all');
  const { language } = useLanguage();
  const isEs = language === 'es';

  const catColors = {
    fed: 'blue', economic: 'purple', earnings: 'emerald', unlock: 'amber', options: 'red'
  };

  const catLabels = {
    fed: isEs ? 'Fed/FOMC' : 'Fed/FOMC',
    economic: isEs ? 'Económico' : 'Economic',
    earnings: 'Earnings',
    unlock: 'Token Unlock',
    options: isEs ? 'Opciones' : 'Options'
  };

  const getMonthName = () => month.toLocaleDateString(isEs ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' });
  
  const getDaysInMonth = () => {
    const year = month.getFullYear();
    const m = month.getMonth();
    return { days: new Date(year, m + 1, 0).getDate(), start: new Date(year, m, 1).getDay() };
  };

  const getEventsForDay = (day) => {
    return EVENTS.filter(e => {
      const d = new Date(e.date);
      return d.getDate() === day && d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear() && (filter === 'all' || e.cat === filter);
    });
  };

  const filtered = EVENTS.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear() && (filter === 'all' || e.cat === filter);
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const { days, start } = getDaysInMonth();
  const dayNames = isEs ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const impLabels = { high: isEs ? 'Alta' : 'High', medium: isEs ? 'Media' : 'Medium', low: isEs ? 'Baja' : 'Low' };
  const impactEmoji = { bullish: '🟢', bearish: '🔴', neutral: '🟡' };

  return (
    <div className="min-h-screen py-12 relative">
      <OwlSeal position="bottom-right" size="lg" opacity={0.6} className="fixed" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/indices" className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-4">
            <ChevronLeft size={16} /> {isEs ? 'Volver a Índices' : 'Back to Indices'}
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <Calendar className="text-emerald-500" size={28} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">{isEs ? 'Calendario Macro' : 'Macro Calendar'}</h1>
              <p className="text-gray-400 mt-1">{isEs ? 'Eventos que impactan crypto' : 'Events impacting crypto'}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'all' ? 'bg-emerald-500 text-white' : 'bg-gray-800/50 text-gray-400 border border-gray-700/50'}`}
          >
            {isEs ? 'Todos' : 'All'}
          </button>
          {Object.keys(catColors).map(k => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                filter === k
                  ? `bg-${catColors[k]}-500/10 text-${catColors[k]}-400 border border-${catColors[k]}-500/20`
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50'
              }`}
            >
              {catLabels[k]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="p-2 hover:bg-gray-800 rounded-lg">
                <ChevronLeft className="text-gray-400" size={24} />
              </button>
              <h2 className="text-2xl font-bold text-white capitalize">{getMonthName()}</h2>
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="p-2 hover:bg-gray-800 rounded-lg">
                <ChevronRight className="text-gray-400" size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(d => (
                <div key={d} className="text-center text-sm text-gray-500 font-medium py-2">{d}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: start }).map((_, i) => (
                <div key={`e-${i}`} className="h-24 bg-gray-800/20 rounded-lg" />
              ))}
              {Array.from({ length: days }).map((_, i) => {
                const day = i + 1;
                const events = getEventsForDay(day);
                const hasEvents = events.length > 0;
                const isToday = day === 5 && month.getMonth() === 1;
                
                return (
                  <div
                    key={day}
                    className={`h-24 p-2 rounded-lg ${
                      isToday ? 'bg-emerald-500/20 border border-emerald-500/50' :
                      hasEvents ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-gray-800/20'
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-emerald-400' : hasEvents ? 'text-white' : 'text-gray-500'}`}>
                      {day}
                    </div>
                    {events.slice(0, 2).map(e => (
                      <div key={e.id} className={`text-xs px-1.5 py-0.5 rounded bg-${catColors[e.cat]}-500/10 text-${catColors[e.cat]}-400 truncate mb-0.5`}>
                        {e.name}
                      </div>
                    ))}
                    {events.length > 2 && <div className="text-xs text-gray-500">+{events.length - 2}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">{isEs ? 'Próximos Eventos' : 'Upcoming Events'}</h3>
            {filtered.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">{isEs ? 'Sin eventos' : 'No events'}</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filtered.map(e => (
                  <div key={e.id} className={`p-4 rounded-xl border border-${catColors[e.cat]}-500/20 bg-${catColors[e.cat]}-500/10`}>
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-xs font-medium text-${catColors[e.cat]}-400`}>{catLabels[e.cat]}</span>
                      <span className="text-lg">{impactEmoji[e.impact]}</span>
                    </div>
                    <h4 className="text-white font-bold mb-1">{e.name}</h4>
                    <p className="text-gray-400 text-sm mb-3">{e.desc}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(e.date).toLocaleDateString(isEs ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {e.time}
                      </span>
                      <span className={`px-2 py-0.5 rounded ${
                        e.imp === 'high' ? 'bg-red-500/20 text-red-400' :
                        e.imp === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {impLabels[e.imp]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 glass-card rounded-xl p-4">
          <h4 className="text-sm font-bold text-gray-400 mb-3">{isEs ? 'Leyenda' : 'Legend'}</h4>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <span>🟢</span>
              <span className="text-sm text-gray-300">Bullish</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔴</span>
              <span className="text-sm text-gray-300">Bearish</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🟡</span>
              <span className="text-sm text-gray-300">Neutral</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/indices" className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg">
            {isEs ? 'Volver a Índices' : 'Back to Indices'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MacroCalendarPage;
