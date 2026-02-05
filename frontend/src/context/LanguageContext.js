import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  es: {
    // Navigation
    nav: {
      home: 'Inicio',
      research: 'Alpha Research',
      indices: 'Índices',
      portfolio: 'Portfolio',
      signals: 'Señales',
      airdrops: 'Airdrops',
      consulting: 'Consultoría',
      premium: 'Premium',
      freeContent: 'Contenido Gratuito',
    },
    // Common
    common: {
      backToHome: 'Volver al Inicio',
      readMore: 'Leer más',
      viewDetails: 'Ver Detalles',
      loading: 'Cargando...',
      found: 'encontrado',
      clearFilters: 'Limpiar filtros',
      all: 'Todas',
      tasks: 'tareas',
      goToVault: 'Ir al Vault',
      stake: 'Stake',
      updated: 'Actualizado',
      estimatedReward: 'Recompensa Estimada',
      accordingToVolume: 'Según volumen y puntos',
      status: 'Estado',
      active: 'Activo',
    },
    // Home Page
    home: {
      badge: 'Professional Crypto Intelligence',
      title: 'Tu fuente de',
      titleHighlight: 'alpha',
      titleEnd: 'en crypto',
      subtitle: 'Indicadores on-chain, artículos educativos, airdrops verificados, señales de inversión y portfolio tracking. Todo en un solo lugar.',
      marketIndicators: 'Indicadores de Mercado',
      marketIndicatorsDesc: 'Métricas on-chain y sentimiento del mercado',
      fearGreed: 'Índice de Miedo y Codicia',
      rainbowChart: 'Bitcoin Rainbow Chart',
      mvrvScore: 'MVRV Z-Score',
      latestResearch: 'Últimos Alpha Research',
      latestResearchDesc: 'Análisis profundos y contenido educativo',
      viewAllArticles: 'Ver todos los artículos',
      activeAirdrops: 'Airdrops Activos',
      activeAirdropsDesc: 'Oportunidades verificadas para maximizar rewards',
      viewAllAirdrops: 'Ver todos los airdrops',
    },
    // Articles/Research Page
    research: {
      badge: 'Contenido Educativo',
      title: 'Alpha Research',
      subtitle: 'Insights profundos y alpha para inversores crypto. Aprende sobre las últimas tendencias, tecnologías y oportunidades.',
      searchPlaceholder: 'Buscar artículos por título, contenido o tags...',
      articlesFound: 'artículos encontrados',
      articleFound: 'artículo encontrado',
      noArticles: 'No se encontraron artículos',
      tryOtherTerms: 'Intenta con otros términos de búsqueda o categoría',
    },
    // Airdrops Page
    airdrops: {
      badge: 'Oportunidades Verificadas',
      title: 'Airdrops Activos',
      subtitle: 'Completa tareas y acumula puntos para maximizar tus recompensas.',
      searchPlaceholder: 'Buscar por nombre, descripción o chain...',
      airdropsFound: 'airdrops encontrados',
      airdropFound: 'airdrop encontrado',
      noAirdrops: 'No se encontraron airdrops',
      chain: 'Chain',
      tasks: 'Tareas',
      moreTasks: 'tareas más',
      whatIsAirdrop: '¿Qué es un Airdrop?',
      learnHow: 'Aprende cómo funcionan y maximiza tus recompensas',
      airdropExplanation: 'Un airdrop es una distribución gratuita de tokens que los proyectos crypto realizan para recompensar a usuarios tempranos y construir comunidad.',
      howTheyWork: '¿Cómo funcionan?',
      howToQualify: '¿Cómo calificar?',
      howTheyWorkList: ['Usa la aplicación o protocolo', 'Completa tareas específicas', 'Acumula puntos o volumen', 'Recibe tokens al TGE'],
      howToQualifyList: ['Actividad constante (no solo una vez)', 'Genera volumen de trading real', 'Usa múltiples features', 'Participa en testnets'],
      tips: 'Tips de Alpha Crypto',
      tipsList: ['Diversifica: Participa en múltiples airdrops', 'Consistencia: La actividad regular vale más que un solo trade grande', 'Comunidad: Únete a Discords oficiales para no perderte snapshots'],
    },
    // Indices Page
    indices: {
      badge: 'Datos en Tiempo Real',
      title: 'Índices de Mercado',
      subtitle: 'Métricas clave del mercado crypto actualizadas en tiempo real',
      totalMarketCap: 'Total Market Cap',
      stablecoinMarketCap: 'Stablecoin Market Cap',
      defiTvl: 'DeFi TVL',
      fearGreedIndex: 'Fear & Greed Index',
      stablecoinDistribution: 'Distribución de Stablecoins',
      source: 'Fuente',
      change24h: 'Cambio 24h',
    },
    // Portfolio Page
    portfolio: {
      title: 'Portfolio Alpha Crypto',
      subtitle: 'Seguimiento del portfolio, yields en stablecoins y staking.',
      totalValue: 'Valor Total del Portfolio',
      monthlyReturn: 'Monthly Return',
      performance: '6-Month Performance',
      allocation: 'Allocation',
      holdings: 'Holdings',
      recentTrades: 'Recent Trades',
      strategyNotes: 'Strategy Notes',
      currentStrategy: 'Current Strategy',
      currentStrategyText: 'DCA semanal en BTC y ETH. Manteniendo posición defensiva con 15% en stables.',
      nextMoves: 'Next Moves',
      nextMovesText: 'Monitorear soporte en $65K BTC. Si se rompe, aumentar stables a 25%.',
      disclaimer: 'This portfolio is for educational purposes only. Past performance does not guarantee future results. Always DYOR before making investment decisions.',
    },
    // Yield Section
    yield: {
      title: 'Stablecoin Yields',
      subtitle: 'Las mejores oportunidades para rentabilizar tus stablecoins',
      note: 'Los APYs son aproximados y pueden variar según condiciones del mercado. Diversifica en varios protocolos para mitigar riesgos.',
    },
    // Staking Section
    staking: {
      title: 'Staking',
      subtitle: 'Genera rendimiento pasivo con tus tokens',
      asset: 'Asset',
      apyApprox: 'APY Aprox.',
      platform: 'Plataforma',
      action: 'Acción',
      note: 'Los APYs son aproximados y pueden variar según condiciones del mercado y la red. Siempre verifica en la plataforma oficial antes de hacer staking.',
    },
    // Newsletter
    newsletter: {
      title: '¿Quieres recibir alpha directo a tu inbox?',
      subtitle: 'Únete a nuestra newsletter y recibe los mejores análisis, señales y oportunidades de airdrop antes que nadie.',
      placeholder: 'tu@email.com',
      button: 'Suscribirse',
      success: '¡Gracias por suscribirte!',
    },
    // Premium Modal
    premium: {
      title: 'Acceso Premium',
      subtitle: 'Desbloquea todo el potencial de Alpha Crypto',
      features: [
        'Acceso completo al Portfolio',
        'Señales de trading en tiempo real',
        'Airdrops verificados con guías paso a paso',
        'Consultoría personalizada',
        'ALPHA-I sin límites',
      ],
      monthlyPrice: '$29/mes',
      yearlyPrice: '$290/año',
      yearlyDiscount: 'Ahorra 2 meses',
      getStarted: 'Comenzar',
    },
    // ALPHA-I
    alphai: {
      title: 'ALPHA-I',
      subtitle: 'Tu asistente DeFi personal',
      placeholder: 'Pregúntame sobre DeFi, airdrops, yields...',
      send: 'Enviar',
      freeMessages: 'mensajes gratis restantes',
      upgradeForMore: 'Actualiza a Premium para mensajes ilimitados',
    },
  },
  en: {
    // Navigation
    nav: {
      home: 'Home',
      research: 'Alpha Research',
      indices: 'Indices',
      portfolio: 'Portfolio',
      signals: 'Signals',
      airdrops: 'Airdrops',
      consulting: 'Consulting',
      premium: 'Premium',
      freeContent: 'Free Content',
    },
    // Common
    common: {
      backToHome: 'Back to Home',
      readMore: 'Read more',
      viewDetails: 'View Details',
      loading: 'Loading...',
      found: 'found',
      clearFilters: 'Clear filters',
      all: 'All',
      tasks: 'tasks',
      goToVault: 'Go to Vault',
      stake: 'Stake',
      updated: 'Updated',
      estimatedReward: 'Estimated Reward',
      accordingToVolume: 'Based on volume and points',
      status: 'Status',
      active: 'Active',
    },
    // Home Page
    home: {
      badge: 'Professional Crypto Intelligence',
      title: 'Your source of',
      titleHighlight: 'alpha',
      titleEnd: 'in crypto',
      subtitle: 'On-chain indicators, educational articles, verified airdrops, investment signals and portfolio tracking. All in one place.',
      marketIndicators: 'Market Indicators',
      marketIndicatorsDesc: 'On-chain metrics and market sentiment',
      fearGreed: 'Fear & Greed Index',
      rainbowChart: 'Bitcoin Rainbow Chart',
      mvrvScore: 'MVRV Z-Score',
      latestResearch: 'Latest Alpha Research',
      latestResearchDesc: 'Deep analysis and educational content',
      viewAllArticles: 'View all articles',
      activeAirdrops: 'Active Airdrops',
      activeAirdropsDesc: 'Verified opportunities to maximize rewards',
      viewAllAirdrops: 'View all airdrops',
    },
    // Articles/Research Page
    research: {
      badge: 'Educational Content',
      title: 'Alpha Research',
      subtitle: 'Deep insights and alpha for crypto investors. Learn about the latest trends, technologies and opportunities.',
      searchPlaceholder: 'Search articles by title, content or tags...',
      articlesFound: 'articles found',
      articleFound: 'article found',
      noArticles: 'No articles found',
      tryOtherTerms: 'Try other search terms or category',
    },
    // Airdrops Page
    airdrops: {
      badge: 'Verified Opportunities',
      title: 'Active Airdrops',
      subtitle: 'Complete tasks and accumulate points to maximize your rewards.',
      searchPlaceholder: 'Search by name, description or chain...',
      airdropsFound: 'airdrops found',
      airdropFound: 'airdrop found',
      noAirdrops: 'No airdrops found',
      chain: 'Chain',
      tasks: 'Tasks',
      moreTasks: 'more tasks',
      whatIsAirdrop: 'What is an Airdrop?',
      learnHow: 'Learn how they work and maximize your rewards',
      airdropExplanation: 'An airdrop is a free distribution of tokens that crypto projects do to reward early users and build community.',
      howTheyWork: 'How do they work?',
      howToQualify: 'How to qualify?',
      howTheyWorkList: ['Use the application or protocol', 'Complete specific tasks', 'Accumulate points or volume', 'Receive tokens at TGE'],
      howToQualifyList: ['Consistent activity (not just once)', 'Generate real trading volume', 'Use multiple features', 'Participate in testnets'],
      tips: 'Alpha Crypto Tips',
      tipsList: ['Diversify: Participate in multiple airdrops', 'Consistency: Regular activity is worth more than a single big trade', 'Community: Join official Discords to not miss snapshots'],
    },
    // Indices Page
    indices: {
      badge: 'Real-Time Data',
      title: 'Market Indices',
      subtitle: 'Key crypto market metrics updated in real-time',
      totalMarketCap: 'Total Market Cap',
      stablecoinMarketCap: 'Stablecoin Market Cap',
      defiTvl: 'DeFi TVL',
      fearGreedIndex: 'Fear & Greed Index',
      stablecoinDistribution: 'Stablecoin Distribution',
      source: 'Source',
      change24h: '24h Change',
    },
    // Portfolio Page
    portfolio: {
      title: 'Alpha Crypto Portfolio',
      subtitle: 'Portfolio tracking, stablecoin yields and staking.',
      totalValue: 'Total Portfolio Value',
      monthlyReturn: 'Monthly Return',
      performance: '6-Month Performance',
      allocation: 'Allocation',
      holdings: 'Holdings',
      recentTrades: 'Recent Trades',
      strategyNotes: 'Strategy Notes',
      currentStrategy: 'Current Strategy',
      currentStrategyText: 'Weekly DCA in BTC and ETH. Maintaining defensive position with 15% in stables.',
      nextMoves: 'Next Moves',
      nextMovesText: 'Monitor support at $65K BTC. If broken, increase stables to 25%.',
      disclaimer: 'This portfolio is for educational purposes only. Past performance does not guarantee future results. Always DYOR before making investment decisions.',
    },
    // Yield Section
    yield: {
      title: 'Stablecoin Yields',
      subtitle: 'The best opportunities to earn yield on your stablecoins',
      note: 'APYs are approximate and may vary according to market conditions. Diversify across multiple protocols to mitigate risks.',
    },
    // Staking Section
    staking: {
      title: 'Staking',
      subtitle: 'Generate passive income with your tokens',
      asset: 'Asset',
      apyApprox: 'APY Approx.',
      platform: 'Platform',
      action: 'Action',
      note: 'APYs are approximate and may vary according to market and network conditions. Always verify on the official platform before staking.',
    },
    // Newsletter
    newsletter: {
      title: 'Want to receive alpha directly to your inbox?',
      subtitle: 'Join our newsletter and receive the best analysis, signals and airdrop opportunities before anyone else.',
      placeholder: 'your@email.com',
      button: 'Subscribe',
      success: 'Thanks for subscribing!',
    },
    // Premium Modal
    premium: {
      title: 'Premium Access',
      subtitle: 'Unlock the full potential of Alpha Crypto',
      features: [
        'Full Portfolio access',
        'Real-time trading signals',
        'Verified airdrops with step-by-step guides',
        'Personalized consulting',
        'Unlimited ALPHA-I',
      ],
      monthlyPrice: '$29/month',
      yearlyPrice: '$290/year',
      yearlyDiscount: 'Save 2 months',
      getStarted: 'Get Started',
    },
    // ALPHA-I
    alphai: {
      title: 'ALPHA-I',
      subtitle: 'Your personal DeFi assistant',
      placeholder: 'Ask me about DeFi, airdrops, yields...',
      send: 'Send',
      freeMessages: 'free messages remaining',
      upgradeForMore: 'Upgrade to Premium for unlimited messages',
    },
  }
};

// Article translations
export const articleTranslations = {
  es: {
    '1': {
      title: 'Stablecoins: $300B y Contando... La Revolución Ya Llegó',
      excerpt: '$46 trillones en transacciones anuales. Los stablecoins ya procesan más que Visa y Mastercard combinadas.',
    },
    '2': {
      title: 'AI Agents: Las Máquinas Ya Tienen Wallets... y Están Gastando',
      excerpt: 'El protocolo x402, Ethereum como backbone, y cómo los agentes de IA están creando una economía de $100B para 2030.',
    },
    '3': {
      title: 'Estado del Mercado Crypto 2026: Lo Que Necesitas Saber',
      excerpt: 'BTC a $70K, ETFs con $50B+, y el halving haciendo lo suyo. Aquí está el panorama completo.',
    },
    '4': {
      title: 'DeFi 2.0: Dónde Encontrar Yield REAL en 2026',
      excerpt: 'Olvídate de APYs de 10,000%. Aquí están los protocolos con revenue real y yields sostenibles.',
    },
    '5': {
      title: 'L2 Wars 2026: Arbitrum vs Optimism vs Base',
      excerpt: 'Los Layer 2 dominan Ethereum. Aquí está cuál elegir para trading, airdrops y desarrollo.',
    },
  },
  en: {
    '1': {
      title: 'Stablecoins: $300B and Counting... The Revolution Is Here',
      excerpt: '$46 trillion in annual transactions. Stablecoins now process more than Visa and Mastercard combined.',
    },
    '2': {
      title: 'AI Agents: Machines Now Have Wallets... and They\'re Spending',
      excerpt: 'The x402 protocol, Ethereum as backbone, and how AI agents are creating a $100B economy by 2030.',
    },
    '3': {
      title: 'Crypto Market Status 2026: What You Need to Know',
      excerpt: 'BTC at $70K, ETFs with $50B+, and the halving doing its thing. Here\'s the complete picture.',
    },
    '4': {
      title: 'DeFi 2.0: Where to Find REAL Yield in 2026',
      excerpt: 'Forget 10,000% APYs. Here are the protocols with real revenue and sustainable yields.',
    },
    '5': {
      title: 'L2 Wars 2026: Arbitrum vs Optimism vs Base',
      excerpt: 'Layer 2s dominate Ethereum. Here\'s which one to choose for trading, airdrops and development.',
    },
  }
};

// Airdrop translations
export const airdropTranslations = {
  es: {
    '1': { description: 'DEX híbrido institucional en zkSync - TGE confirmado Q1 2026' },
    '2': { description: 'Exchange de Solana del equipo Mad Lads - Token confirmado' },
    '3': { description: 'DEX de perpetuos en Starknet respaldado por Paradigm' },
    '4': { description: 'L2 modular para trading - Token confirmado' },
    '5': { description: 'DEX de perpetuos en Base con vaults de yield' },
    '6': { description: 'Perpetuos de RWA y crypto - Stocks, forex y más' },
    '7': { description: 'DEX con historial de airdrop exitoso - Segunda ronda' },
    '8': { description: 'Perpetuos en Solana con vaults y social trading' },
  },
  en: {
    '1': { description: 'Institutional hybrid DEX on zkSync - TGE confirmed Q1 2026' },
    '2': { description: 'Solana exchange from Mad Lads team - Token confirmed' },
    '3': { description: 'Perpetuals DEX on Starknet backed by Paradigm' },
    '4': { description: 'Modular L2 for trading - Token confirmed' },
    '5': { description: 'Perpetuals DEX on Base with yield vaults' },
    '6': { description: 'RWA and crypto perpetuals - Stocks, forex and more' },
    '7': { description: 'DEX with successful airdrop history - Second round' },
    '8': { description: 'Perpetuals on Solana with vaults and social trading' },
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('alpha-crypto-lang') || 'es';
    }
    return 'es';
  });

  useEffect(() => {
    localStorage.setItem('alpha-crypto-lang', language);
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'es' ? 'en' : 'es');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, translations: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
