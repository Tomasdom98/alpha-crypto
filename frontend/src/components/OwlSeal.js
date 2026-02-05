// Alpha Crypto Owl Seal - Brand identity component
// Used as a watermark/seal across all pages

const OWL_URL = "https://customer-assets.emergentagent.com/job_aa332bb7-9735-40f0-a436-aa4f8697591d/artifacts/hvgiid52_Gemini_Generated_Image_abg785abg785abg7.png";

export default function OwlSeal({ 
  position = 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'center'
  size = 'md', // 'sm', 'md', 'lg'
  opacity = 0.15,
  showText = false,
  className = ''
}) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const positionClasses = {
    'bottom-right': 'absolute bottom-4 right-4',
    'bottom-left': 'absolute bottom-4 left-4',
    'top-right': 'absolute top-4 right-4',
    'top-left': 'absolute top-4 left-4',
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
          className={`${sizeClasses[size]} object-contain drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]`}
          style={{ filter: 'brightness(1.1)' }}
        />
        {showText && (
          <span className="text-xs text-gray-500 font-medium tracking-wider">
            ALPHA CRYPTO
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
