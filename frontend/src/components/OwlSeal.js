// Alpha Crypto Owl Seal - Brand identity component
// Used as a watermark/seal across all pages

const OWL_URL = "https://customer-assets.emergentagent.com/job_aa332bb7-9735-40f0-a436-aa4f8697591d/artifacts/hvgiid52_Gemini_Generated_Image_abg785abg785abg7.png";

export default function OwlSeal({ 
  position = 'bottom-right',
  size = 'md',
  opacity = 0.5,
  showText = true,
  className = ''
}) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  // Fixed position for the watermark - always visible
  if (className.includes('fixed')) {
    return (
      <div 
        className="pointer-events-none select-none z-50"
        style={{ 
          opacity,
          position: 'fixed',
          bottom: '80px',
          right: '30px'
        }}
      >
        <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gray-900/30 backdrop-blur-sm border border-emerald-500/20">
          <img 
            src={OWL_URL}
            alt="Alpha Crypto"
            className="w-44 h-44 object-contain drop-shadow-[0_0_25px_rgba(16,185,129,0.6)]"
            style={{ filter: 'brightness(1.4) contrast(1.15)' }}
          />
          {showText && (
            <span className="text-sm text-emerald-400 font-bold tracking-widest">
              αC
            </span>
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
      <div className="flex flex-col items-center gap-1">
        <img 
          src={OWL_URL}
          alt="Alpha Crypto"
          className={`${sizeClasses[size]} object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]`}
          style={{ filter: 'brightness(1.2) contrast(1.1)' }}
        />
        {showText && (
          <span className="text-[10px] text-emerald-500/70 font-bold tracking-widest">
            αC
          </span>
        )}
      </div>
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
