// Alpha Crypto Owl Seal - Brand identity component with animations
// Used as a watermark/seal across all pages - clicks open ALPHA-I chat

const OWL_URL = "https://customer-assets.emergentagent.com/job_aa332bb7-9735-40f0-a436-aa4f8697591d/artifacts/ophjijkw_Screenshot%202026-02-05%20at%2013.02.09.png";

export default function OwlSeal({ 
  position = 'bottom-right',
  size = 'md',
  opacity = 0.5,
  className = '',
  onClick
}) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  // Fixed position for the watermark - with rounded border, depth and animations
  if (className.includes('fixed')) {
    return (
      <div 
        className={`select-none z-50 ${onClick ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'}`}
        style={{ 
          opacity,
          position: 'fixed',
          bottom: '80px',
          right: '24px'
        }}
        onClick={onClick}
        title={onClick ? "Abrir ALPHA-I" : undefined}
      >
        <div 
          className={`relative p-3 rounded-3xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 backdrop-blur-md border border-emerald-500/30 shadow-2xl animate-owl-float transition-all duration-300 ${onClick ? 'hover:scale-110 hover:border-emerald-400/60 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]' : ''}`}
          style={{
            boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}
        >
          {/* Pulsing glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-transparent animate-owl-pulse" />
          
          {/* Breathing glow ring */}
          <div 
            className="absolute -inset-1 rounded-3xl animate-owl-glow"
            style={{
              background: 'radial-gradient(circle at center, rgba(16,185,129,0.15) 0%, transparent 70%)',
            }}
          />
          
          <img 
            src={OWL_URL}
            alt="Alpha Crypto - Click para abrir ALPHA-I"
            className="relative w-32 h-32 object-contain drop-shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-owl-breathe"
            style={{ filter: 'brightness(1.3) contrast(1.1)' }}
          />
          
          {/* Sparkle effects */}
          <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-owl-sparkle" />
          <div className="absolute bottom-4 left-2 w-1 h-1 bg-emerald-300 rounded-full animate-owl-sparkle-delay" />
          
          {/* Click hint */}
          {onClick && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-emerald-500/90 text-white text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              ALPHA-I
            </div>
          )}
        </div>
      </div>
    );
  }

  const positionClasses = {
    'bottom-right': 'absolute bottom-6 right-6',
    'bottom-left': 'absolute bottom-6 left-6',
    'top-right': 'absolute top-6 right-6',
    'top-left': 'absolute top-6 left-6',
    'center': 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'inline': 'relative inline-block'
  };

  return (
    <div 
      className={`pointer-events-none select-none ${positionClasses[position]} ${className}`}
      style={{ opacity }}
    >
      <img 
        src={OWL_URL}
        alt="Alpha Crypto"
        className={`${sizeClasses[size]} object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-owl-breathe`}
        style={{ filter: 'brightness(1.2) contrast(1.1)' }}
      />
    </div>
  );
}

// Inline version for use in cards or sections
export function OwlBadge({ size = 'sm' }) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12'
  };

  return (
    <img 
      src={OWL_URL}
      alt="αC"
      className={`${sizeClasses[size]} object-contain opacity-60`}
    />
  );
}
