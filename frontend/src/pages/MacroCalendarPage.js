import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Clock, TrendingUp, TrendingDown, Minus, AlertCircle, Building2, Coins, LineChart } from 'lucide-react';
import OwlSeal from '@/components/OwlSeal';
import { useLanguage } from '@/context/LanguageContext';

// Macro events data (static for now - can be connected to APIs later)
const MACRO_EVENTS = [
  // February 2026
  {
    id: '1',
    date: '2026-02-12',
    time: '08:30 EST',
    name: 'CPI (Inflación USA)',
    description: 'Reporte de inflación enero 2026. Mercado espera 2.8% YoY.',
    category: 'economic',
    impact: 'neutral',
    importance: 'high'
  },
  {
    id: '2',
    date: '2026-02-19',
    time: '14:00 EST',
    name: 'FOMC Minutes',
    description: 'Minutas de la reunión de la Fed de enero. Señales sobre política monetaria.',
    category: 'fed',
    impact: 'neutral',
    importance: 'medium'
  },
  {
    id: '3',
    date: '2026-02-20',
    time: '16:00 EST',
    name: 'Coinbase Earnings Q4',
    description: 'Reporte de ganancias Q4 2025 de Coinbase. Expectativa: $1.2B revenue.',
    category: 'earnings',
    impact: 'bullish',
    importance: 'high'
  },
  {
    id: '4',
    date: '2026-02-25',
    time: '08:00 UTC',
    name: 'ARB Token Unlock',
    description: 'Unlock de 92.65M ARB (~$100M). 2.8% del supply circulante.',
    category: 'unlock',
    impact: 'bearish',
    importance: 'medium'
  },
  {
    id: '5',
    date: '2026-02-28',
    time: '08:00 UTC',
    name: 'BTC Options Expiry',
    description: 'Vencimiento mensual de opciones BTC. Open interest: $3.2B.',
    category: 'options',
    impact: 'neutral',
    importance: 'high'
  },
  // March 2026
  {
    id: '6',
    date: '2026-03-05',
    time: '16:00 EST',
    name: 'MicroStrategy Earnings',
    description: 'Reporte Q4 2025. Holdings actuales: 200,000+ BTC.',
    category: 'earnings',
    impact: 'bullish',
    importance: 'medium'
  },
  {
    id: '7',
    date: '2026-03-12',
    time: '08:30 EST',
    name: 'CPI (Inflación USA)',
    description: 'Reporte de inflación febrero 2026.',
    category: 'economic',
    impact: 'neutral',
    importance: 'high'
  },
  {
    id: '8',
    date: '2026-03-18',
    time: '14:00 EST',
    name: 'FOMC Decision',
    description: 'Decisión de tasas de la Fed. Proyección: sin cambios (4.25-4.50%).',
    category: 'fed',
    impact: 'neutral',
    importance: 'high'
  },
  {
    id: '9',
    date: '2026-03-20',
    time: '08:00 UTC',
    name: 'OP Token Unlock',
    description: 'Unlock de 31.34M OP (~$50M). Distribución a contribuidores.',
    category: 'unlock',
    impact: 'bearish',
    importance: 'medium'
  },
  {
    id: '10',
    date: '2026-03-28',
    time: '08:00 UTC',
    name: 'ETH Options Expiry',
    description: 'Vencimiento trimestral de opciones ETH. Mayor volatilidad esperada.',
    category: 'options',
    impact: 'neutral',
    importance: 'high'
  },
  // April 2026
  {
    id: '11',
    date: '2026-04-10',
    time: '08:30 EST',
    name: 'CPI (Inflación USA)',
    description: 'Reporte de inflación marzo 2026.',
    category: 'economic',
    impact: 'neutral',
    importance: 'high'
  },
  {
    id: '12',
    date: '2026-04-15',
    time: '08:00 UTC',
    name: 'SUI Token Unlock',
    description: 'Unlock mensual de SUI tokens para early investors.',
    category: 'unlock',
    impact: 'bearish',
    importance: 'low'
  },
];

// Translations
const TRANSLATIONS = {
  es: {
    backToIndices: 'Volver a Índices',
    title: 'Calendario Macro',
    subtitle: 'Eventos económicos que impactan los mercados crypto',
    all: 'Todos',
    fedFomc: 'Fed/FOMC',
    economic: 'Económico',
    earnings: 'Earnings',
    tokenUnlock: 'Token Unlock',
    options: 'Opciones',
    upcomingEvents: 'Próximos Eventos',
    noEvents: 'No hay eventos este mes',
    more: 'más',
    impactLegend: 'Leyenda de Impacto',
    bullish: 'Bullish - Potencialmente positivo para crypto',
    bearish: 'Bearish - Potencialmente negativo para crypto',
    neutral: 'Neutral - Depende del resultado del evento',
    back: 'Volver a Índices',
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
    days: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  },
  en: {
    backToIndices: 'Back to Indices',
    title: 'Macro Calendar',
    subtitle: 'Economic events that impact crypto markets',
    all: 'All',
    fedFomc: 'Fed/FOMC',
    economic: 'Economic',
    earnings: 'Earnings',
    tokenUnlock: 'Token Unlock',
    options: 'Options',
    upcomingEvents: 'Upcoming Events',
    noEvents: 'No events this month',
    more: 'more',
    impactLegend: 'Impact Legend',
    bullish: 'Bullish - Potentially positive for crypto',
    bearish: 'Bearish - Potentially negative for crypto',
    neutral: 'Neutral - Depends on event outcome',
    back: 'Back to Indices',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  }
};

export default function MacroCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1)); // February 2026
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { language } = useLanguage();
  
  const tx = TRANSLATIONS[language] || TRANSLATIONS.es;

  const CATEGORY_CONFIG = {
    fed: { label: tx.fedFomc, icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    economic: { label: tx.economic, icon: LineChart, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    earnings: { label: tx.earnings, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    unlock: { label: tx.tokenUnlock, icon: Coins, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    options: { label: tx.options, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  };

  const IMPACT_CONFIG = {
    bullish: { label: 'Bullish', icon: TrendingUp, color: 'text-emerald-400', emoji: '🟢' },
    bearish: { label: 'Bearish', icon: TrendingDown, color: 'text-red-400', emoji: '🔴' },
    neutral: { label: 'Neutral', icon: Minus, color: 'text-yellow-400', emoji: '🟡' },
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const getEventsForDate = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return MACRO_EVENTS.filter(e => e.date === dateStr);
  };

  const filteredEvents = MACRO_EVENTS
    .filter(e => {
      const eventDate = new Date(e.date);
      const inMonth = eventDate.getMonth() === currentMonth.getMonth() && eventDate.getFullYear() === currentMonth.getFullYear();
      const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
      return inMonth && matchesCategory;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);

  const getImportanceLabel = (imp) => {
    if (imp === 'high') return tx.high;
    if (imp === 'medium') return tx.medium;
    return tx.low;
  };

  return (
    <div className="min-h-screen py-12 relative">
      <OwlSeal position="bottom-right" size="lg" opacity={0.6} className="fixed" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/indices" className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-4 transition-colors">
            <ChevronLeft size={16} /> {tx.backToIndices}
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <Calendar className="text-emerald-500" size={28} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {tx.title}
              </h1>
              <p className="text-gray-400 mt-1">{tx.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === 'all' ? 'bg-emerald-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700/50'
            }`}
          >
            {tx.all}
          </button>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedCategory === key ? `${config.bg} ${config.color} border ${config.border}` : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700/50'
              }`}
            >
              <config.icon size={14} />
              {config.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <ChevronLeft className="text-gray-400" size={24} />
              </button>
              <h2 className="text-2xl font-bold text-white capitalize" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {getMonthName(currentMonth)}
              </h2>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <ChevronRight className="text-gray-400" size={24} />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {tx.days.map(day => (
                <div key={day} className="text-center text-sm text-gray-500 font-medium py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDay }, (_, i) => (
                <div key={`empty-${i}`} className="h-24 bg-gray-800/20 rounded-lg" />
              ))}
              
              {/* Actual days */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const events = getEventsForDate(day);
                const hasEvents = events.length > 0;
                const isToday = day === 5 && currentMonth.getMonth() === 1; // Feb 5 for demo
                
                return (
                  <div
                    key={day}
                    className={`h-24 p-2 rounded-lg transition-all ${
                      isToday ? 'bg-emerald-500/20 border border-emerald-500/50' : 
                      hasEvents ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-gray-800/20'
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-emerald-400' : hasEvents ? 'text-white' : 'text-gray-500'}`}>
                      {day}
                    </div>
                    {events.slice(0, 2).map(event => {
                      const config = CATEGORY_CONFIG[event.category];
                      return (
                        <div
                          key={event.id}
                          className={`text-xs px-1.5 py-0.5 rounded ${config.bg} ${config.color} truncate mb-0.5`}
                          title={event.name}
                        >
                          {event.name.length > 12 ? event.name.substring(0, 12) + '...' : event.name}
                        </div>
                      );
                    })}
                    {events.length > 2 && (
                      <div className="text-xs text-gray-500">+{events.length - 2} {tx.more}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Events List */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {tx.upcomingEvents}
            </h3>
            
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">{tx.noEvents}</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredEvents.map(event => {
                  const categoryConfig = CATEGORY_CONFIG[event.category];
                  const impactConfig = IMPACT_CONFIG[event.impact];
                  
                  return (
                    <div
                      key={event.id}
                      className={`p-4 rounded-xl border ${categoryConfig.border} ${categoryConfig.bg} transition-all hover:scale-[1.02]`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <categoryConfig.icon size={16} className={categoryConfig.color} />
                          <span className={`text-xs font-medium ${categoryConfig.color}`}>{categoryConfig.label}</span>
                        </div>
                        <span className="text-lg" title={impactConfig.label}>{impactConfig.emoji}</span>
                      </div>
                      
                      <h4 className="text-white font-bold mb-1">{event.name}</h4>
                      <p className="text-gray-400 text-sm mb-3">{event.description}</p>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(event.date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {event.time}
                        </span>
                        <span className={`px-2 py-0.5 rounded ${event.importance === 'high' ? 'bg-red-500/20 text-red-400' : event.importance === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {getImportanceLabel(event.importance)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 glass-card rounded-xl p-4">
          <h4 className="text-sm font-bold text-gray-400 mb-3">{tx.impactLegend}</h4>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <span className="text-lg">🟢</span>
              <span className="text-sm text-gray-300">{tx.bullish}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🔴</span>
              <span className="text-sm text-gray-300">{tx.bearish}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🟡</span>
              <span className="text-sm text-gray-300">{tx.neutral}</span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link to="/indices" className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
            {tx.back}
          </Link>
        </div>
      </div>
    </div>
  );
}
