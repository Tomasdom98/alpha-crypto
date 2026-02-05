import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Clock, TrendingUp, TrendingDown, Minus, AlertCircle, Building2, Coins, LineChart } from 'lucide-react';
import OwlSeal from '@/components/OwlSeal';
import { useLanguage } from '@/context/LanguageContext';

const EVENTS = [
  { id: '1', date: '2026-02-12', time: '08:30 EST', name: 'CPI USA', description: 'Inflación enero 2026', category: 'economic', impact: 'neutral', importance: 'high' },
  { id: '2', date: '2026-02-19', time: '14:00 EST', name: 'FOMC Minutes', description: 'Minutas Fed enero', category: 'fed', impact: 'neutral', importance: 'medium' },
  { id: '3', date: '2026-02-20', time: '16:00 EST', name: 'Coinbase Q4', description: 'Earnings Q4 2025', category: 'earnings', impact: 'bullish', importance: 'high' },
  { id: '4', date: '2026-02-25', time: '08:00 UTC', name: 'ARB Unlock', description: '92.65M ARB unlock', category: 'unlock', impact: 'bearish', importance: 'medium' },
  { id: '5', date: '2026-02-28', time: '08:00 UTC', name: 'BTC Options', description: 'Options expiry $3.2B', category: 'options', impact: 'neutral', importance: 'high' },
  { id: '6', date: '2026-03-05', time: '16:00 EST', name: 'MicroStrategy', description: 'Q4 2025 earnings', category: 'earnings', impact: 'bullish', importance: 'medium' },
  { id: '7', date: '2026-03-12', time: '08:30 EST', name: 'CPI USA', description: 'Inflación febrero', category: 'economic', impact: 'neutral', importance: 'high' },
  { id: '8', date: '2026-03-18', time: '14:00 EST', name: 'FOMC Decision', description: 'Decisión tasas Fed', category: 'fed', impact: 'neutral', importance: 'high' },
  { id: '9', date: '2026-03-20', time: '08:00 UTC', name: 'OP Unlock', description: '31.34M OP unlock', category: 'unlock', impact: 'bearish', importance: 'medium' },
  { id: '10', date: '2026-03-28', time: '08:00 UTC', name: 'ETH Options', description: 'Q1 expiry', category: 'options', impact: 'neutral', importance: 'high' },
  { id: '11', date: '2026-04-10', time: '08:30 EST', name: 'CPI USA', description: 'Inflación marzo', category: 'economic', impact: 'neutral', importance: 'high' },
  { id: '12', date: '2026-04-15', time: '08:00 UTC', name: 'SUI Unlock', description: 'Monthly unlock', category: 'unlock', impact: 'bearish', importance: 'low' },
];

const TX_ES = {
  back: 'Volver a Índices', title: 'Calendario Macro', subtitle: 'Eventos que impactan crypto',
  all: 'Todos', fed: 'Fed/FOMC', economic: 'Económico', earnings: 'Earnings', unlock: 'Token Unlock', options: 'Opciones',
  upcoming: 'Próximos Eventos', noEvents: 'Sin eventos', more: 'más',
  legend: 'Leyenda', bullish: 'Bullish - Positivo', bearish: 'Bearish - Negativo', neutral: 'Neutral - Depende',
  high: 'Alta', medium: 'Media', low: 'Baja',
  days: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
};
const TX_EN = {
  back: 'Back to Indices', title: 'Macro Calendar', subtitle: 'Events impacting crypto',
  all: 'All', fed: 'Fed/FOMC', economic: 'Economic', earnings: 'Earnings', unlock: 'Token Unlock', options: 'Options',
  upcoming: 'Upcoming Events', noEvents: 'No events', more: 'more',
  legend: 'Legend', bullish: 'Bullish - Positive', bearish: 'Bearish - Negative', neutral: 'Neutral - Depends',
  high: 'High', medium: 'Medium', low: 'Low',
  days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
};

const IMPACT = { bullish: '🟢', bearish: '🔴', neutral: '🟡' };
const CAT_ICONS = { fed: Building2, economic: LineChart, earnings: TrendingUp, unlock: Coins, options: AlertCircle };
const CAT_COLORS = {
  fed: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  economic: { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  earnings: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  unlock: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  options: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' }
};

export default function MacroCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1));
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { language } = useLanguage();
  const tx = language === 'en' ? TX_EN : TX_ES;

  const catLabels = { fed: tx.fed, economic: tx.economic, earnings: tx.earnings, unlock: tx.unlock, options: tx.options };
  const getMonthName = (d) => d.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' });

  const getDaysInMonth = (d) => {
    const year = d.getFullYear(), month = d.getMonth();
    return { daysInMonth: new Date(year, month + 1, 0).getDate(), startingDay: new Date(year, month, 1).getDay() };
  };

  const getEventsForDate = (day) => {
    const month = currentMonth.getMonth(), year = currentMonth.getFullYear();
    return EVENTS.filter(e => {
      const ed = new Date(e.date);
      const match = ed.getDate() === day && ed.getMonth() === month && ed.getFullYear() === year;
      return match && (selectedCategory === 'all' || e.category === selectedCategory);
    });
  };

  const filteredEvents = EVENTS.filter(e => {
    const ed = new Date(e.date);
    const inMonth = ed.getMonth() === currentMonth.getMonth() && ed.getFullYear() === currentMonth.getFullYear();
    return inMonth && (selectedCategory === 'all' || e.category === selectedCategory);
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const getImpLabel = (i) => i === 'high' ? tx.high : i === 'medium' ? tx.medium : tx.low;

  return (
    <div className="min-h-screen py-12 relative">
      <OwlSeal position="bottom-right" size="lg" opacity={0.6} className="fixed"/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/indices" className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-4"><ChevronLeft size={16}/> {tx.back}</Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/20"><Calendar className="text-emerald-500" size={28}/></div>
            <div><h1 className="text-4xl md:text-5xl font-bold text-white">{tx.title}</h1><p className="text-gray-400 mt-1">{tx.subtitle}</p></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setSelectedCategory('all')} className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedCategory === 'all' ? 'bg-emerald-500 text-white' : 'bg-gray-800/50 text-gray-400 border border-gray-700/50'}`}>{tx.all}</button>
          {Object.keys(CAT_COLORS).map(k => {
            const Icon = CAT_ICONS[k]; const c = CAT_COLORS[k];
            return <button key={k} onClick={() => setSelectedCategory(k)} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${selectedCategory === k ? `${c.bg} ${c.color} border ${c.border}` : 'bg-gray-800/50 text-gray-400 border border-gray-700/50'}`}><Icon size={14}/>{catLabels[k]}</button>;
          })}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-800 rounded-lg"><ChevronLeft className="text-gray-400" size={24}/></button>
              <h2 className="text-2xl font-bold text-white capitalize">{getMonthName(currentMonth)}</h2>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-800 rounded-lg"><ChevronRight className="text-gray-400" size={24}/></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">{tx.days.map(d => <div key={d} className="text-center text-sm text-gray-500 font-medium py-2">{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startingDay }, (_, i) => <div key={`e-${i}`} className="h-24 bg-gray-800/20 rounded-lg"/>)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1; const events = getEventsForDate(day); const hasEvents = events.length > 0;
                const isToday = day === 5 && currentMonth.getMonth() === 1;
                return (
                  <div key={day} className={`h-24 p-2 rounded-lg ${isToday ? 'bg-emerald-500/20 border border-emerald-500/50' : hasEvents ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-gray-800/20'}`}>
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-emerald-400' : hasEvents ? 'text-white' : 'text-gray-500'}`}>{day}</div>
                    {events.slice(0, 2).map(e => {
                      const c = CAT_COLORS[e.category];
                      return <div key={e.id} className={`text-xs px-1.5 py-0.5 rounded ${c.bg} ${c.color} truncate mb-0.5`}>{e.name.length > 12 ? e.name.substring(0, 12) + '...' : e.name}</div>;
                    })}
                    {events.length > 2 && <div className="text-xs text-gray-500">+{events.length - 2} {tx.more}</div>}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">{tx.upcoming}</h3>
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8"><Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4"/><p className="text-gray-500">{tx.noEvents}</p></div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredEvents.map(e => {
                  const c = CAT_COLORS[e.category]; const Icon = CAT_ICONS[e.category];
                  return (
                    <div key={e.id} className={`p-4 rounded-xl border ${c.border} ${c.bg}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2"><Icon size={16} className={c.color}/><span className={`text-xs font-medium ${c.color}`}>{catLabels[e.category]}</span></div>
                        <span className="text-lg">{IMPACT[e.impact]}</span>
                      </div>
                      <h4 className="text-white font-bold mb-1">{e.name}</h4>
                      <p className="text-gray-400 text-sm mb-3">{e.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Calendar size={12}/>{new Date(e.date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' })}</span>
                        <span className="flex items-center gap-1"><Clock size={12}/>{e.time}</span>
                        <span className={`px-2 py-0.5 rounded ${e.importance === 'high' ? 'bg-red-500/20 text-red-400' : e.importance === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'}`}>{getImpLabel(e.importance)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 glass-card rounded-xl p-4">
          <h4 className="text-sm font-bold text-gray-400 mb-3">{tx.legend}</h4>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2"><span className="text-lg">🟢</span><span className="text-sm text-gray-300">{tx.bullish}</span></div>
            <div className="flex items-center gap-2"><span className="text-lg">🔴</span><span className="text-sm text-gray-300">{tx.bearish}</span></div>
            <div className="flex items-center gap-2"><span className="text-lg">🟡</span><span className="text-sm text-gray-300">{tx.neutral}</span></div>
          </div>
        </div>
        <div className="mt-8 text-center"><Link to="/indices" className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg">{tx.back}</Link></div>
      </div>
    </div>
  );
}
