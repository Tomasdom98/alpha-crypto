// Floating Background Icons - Hero decoration for HomePage
// Subtle animated crypto and tech icons

import { 
  Bitcoin, 
  Wallet, 
  TrendingUp, 
  Brain, 
  Lock, 
  Rocket, 
  Zap, 
  BarChart3,
  Cpu,
  Network,
  Boxes,
  Bot,
  Coins,
  LineChart,
  Shield,
  Sparkles,
  Database,
  GitBranch
} from 'lucide-react';

// Ethereum symbol component
const EthereumIcon = ({ size = 24, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2L4 12l8 4.5 8-4.5L12 2z" />
    <path d="M4 12l8 10 8-10" />
    <path d="M12 6.5v10" />
  </svg>
);

// Solana-style icon
const SolanaIcon = ({ size = 24, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 6h14l-3 3H4l3-3z" />
    <path d="M4 12h14l-3 3H4l3-3z" />
    <path d="M4 18h14l-3-3H4l3 3z" />
  </svg>
);

// Candlestick chart icon
const CandlestickIcon = ({ size = 24, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <line x1="6" y1="4" x2="6" y2="20" />
    <rect x="4" y="8" width="4" height="6" />
    <line x1="12" y1="2" x2="12" y2="22" />
    <rect x="10" y="6" width="4" height="8" />
    <line x1="18" y1="6" x2="18" y2="18" />
    <rect x="16" y="10" width="4" height="4" />
  </svg>
);

// Floating icons configuration
const floatingIcons = [
  // Top left area
  { Icon: Bitcoin, size: 32, top: '8%', left: '5%', delay: 0, duration: 18, opacity: 0.12 },
  { Icon: Brain, size: 28, top: '15%', left: '12%', delay: 2, duration: 22, opacity: 0.08 },
  { Icon: Lock, size: 24, top: '25%', left: '3%', delay: 4, duration: 20, opacity: 0.1 },
  
  // Top center-left
  { Icon: EthereumIcon, size: 36, top: '5%', left: '25%', delay: 1, duration: 24, opacity: 0.1 },
  { Icon: Network, size: 26, top: '18%', left: '22%', delay: 3, duration: 19, opacity: 0.08 },
  
  // Top center-right
  { Icon: Rocket, size: 28, top: '8%', left: '72%', delay: 5, duration: 21, opacity: 0.1 },
  { Icon: CandlestickIcon, size: 30, top: '20%', left: '78%', delay: 2, duration: 23, opacity: 0.09 },
  
  // Top right area
  { Icon: SolanaIcon, size: 32, top: '6%', left: '88%', delay: 0, duration: 20, opacity: 0.11 },
  { Icon: Zap, size: 24, top: '15%', left: '92%', delay: 4, duration: 18, opacity: 0.08 },
  { Icon: Shield, size: 26, top: '28%', left: '95%', delay: 1, duration: 22, opacity: 0.07 },
  
  // Middle left
  { Icon: Bot, size: 30, top: '45%', left: '2%', delay: 3, duration: 25, opacity: 0.1 },
  { Icon: Coins, size: 24, top: '55%', left: '8%', delay: 5, duration: 19, opacity: 0.08 },
  
  // Middle right
  { Icon: Wallet, size: 28, top: '42%', left: '93%', delay: 2, duration: 21, opacity: 0.09 },
  { Icon: Database, size: 24, top: '52%', left: '88%', delay: 4, duration: 23, opacity: 0.07 },
  
  // Bottom left
  { Icon: TrendingUp, size: 32, top: '70%', left: '5%', delay: 1, duration: 20, opacity: 0.1 },
  { Icon: Boxes, size: 26, top: '78%', left: '12%', delay: 3, duration: 24, opacity: 0.08 },
  { Icon: GitBranch, size: 22, top: '85%', left: '4%', delay: 5, duration: 18, opacity: 0.07 },
  
  // Bottom center-left
  { Icon: Cpu, size: 28, top: '75%', left: '22%', delay: 0, duration: 22, opacity: 0.09 },
  { Icon: LineChart, size: 24, top: '82%', left: '28%', delay: 2, duration: 19, opacity: 0.08 },
  
  // Bottom center-right
  { Icon: Sparkles, size: 26, top: '72%', left: '75%', delay: 4, duration: 21, opacity: 0.08 },
  { Icon: BarChart3, size: 28, top: '80%', left: '70%', delay: 1, duration: 23, opacity: 0.09 },
  
  // Bottom right
  { Icon: Bitcoin, size: 24, top: '75%', left: '90%', delay: 3, duration: 20, opacity: 0.07 },
  { Icon: Network, size: 20, top: '85%', left: '94%', delay: 5, duration: 18, opacity: 0.06 },
];

export default function FloatingIcons() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {floatingIcons.map((item, index) => {
        const { Icon, size, top, left, delay, duration, opacity } = item;
        
        return (
          <div
            key={index}
            className="absolute animate-float-icon"
            style={{
              top,
              left,
              opacity,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          >
            <Icon 
              size={size} 
              className="text-emerald-400/80 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
              strokeWidth={1.2}
            />
          </div>
        );
      })}
    </div>
  );
}
