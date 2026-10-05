import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'white';
  showTagline?: boolean;
  className?: string;
}

export default function Logo({
  size = 'md',
  variant = 'full',
  showTagline = true,
  className = '',
}: LogoProps) {
  // Size mapping
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const taglineSizes = {
    sm: 'text-[7px]',
    md: 'text-[9px]',
    lg: 'text-[11px]',
    xl: 'text-[13px]',
  };

  const isWhite = variant === 'white';

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <div className="flex items-center gap-2.5">
        {/* SVG Graphic Emblem */}
        <div className={`relative shrink-0 ${iconSizes[size]}`}>
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-xs"
          >
            {/* Navy Pin Shield Container */}
            <path
              d="M40 30 C40 20, 130 20, 130 45 C130 85, 110 115, 95 135 L95 135 L40 30 Z"
              fill={isWhite ? "#ffffff" : "#0A2540"}
            />
            
            {/* Outer Navy Location Pin Shield Body */}
            <path
              d="M48 24 H120 C138 24 148 38 140 58 L126 90 C110 126 96 148 96 148 C96 148 78 120 62 88 L52 64 C44 48 48 24 48 24 Z"
              fill={isWhite ? "rgba(255,255,255,0.15)" : "#0A2540"}
              stroke={isWhite ? "#ffffff" : "#0A2540"}
              strokeWidth="6"
            />

            {/* Inner White Cutout Background for Industrial Skyline */}
            <path
              d="M60 38 H112 C122 38 126 48 120 62 L108 86 C98 108 96 116 96 116 C96 116 88 100 76 76 L66 56 C60 44 60 38 60 38 Z"
              fill={isWhite ? "#0A2540" : "#FFFFFF"}
            />

            {/* Industrial Skyline Silhouettes (Factory Chimney, Water Tower, Plant) */}
            {/* Chimney */}
            <rect x="70" y="44" width="7" height="36" fill={isWhite ? "#FFFFFF" : "#0A2540"} />
            <line x1="70" y1="52" x2="77" y2="52" stroke="#FF6B00" strokeWidth="2" />
            <line x1="70" y1="62" x2="77" y2="62" stroke="#FF6B00" strokeWidth="2" />
            
            {/* Birds in Sky */}
            <path d="M84 42 Q86 40 88 42 Q90 40 92 42" stroke={isWhite ? "#FFFFFF" : "#0A2540"} strokeWidth="1.2" fill="none" />
            <path d="M94 46 Q96 44 98 46 Q100 44 102 46" stroke={isWhite ? "#FFFFFF" : "#0A2540"} strokeWidth="1" fill="none" />

            {/* Water Tower & Plant */}
            <path d="M83 58 L89 58 L87 78 L85 78 Z" fill={isWhite ? "#FFFFFF" : "#0A2540"} />
            <ellipse cx="86" cy="56" rx="5" ry="4" fill={isWhite ? "#FFFFFF" : "#0A2540"} />
            <rect x="91" y="60" width="16" height="20" fill={isWhite ? "#FFFFFF" : "#0A2540"} />
            {/* Windows on Factory */}
            <rect x="93" y="64" width="3" height="3" fill={isWhite ? "#0A2540" : "#FFFFFF"} />
            <rect x="98" y="64" width="3" height="3" fill={isWhite ? "#0A2540" : "#FFFFFF"} />
            <rect x="93" y="70" width="3" height="3" fill={isWhite ? "#0A2540" : "#FFFFFF"} />
            <rect x="98" y="70" width="3" height="3" fill={isWhite ? "#0A2540" : "#FFFFFF"} />

            {/* Orange Stylized Wrench / Gear 'F' Arm */}
            <path
              d="M102 52 H152 C158 52 162 56 162 62 V72 C162 76 158 80 152 80 H124 V92 H146 C150 92 154 96 154 100 V106 C154 110 150 114 146 114 H118 L96 160 C92 168 84 168 80 160 L78 156 L108 96 H112 V62 Z"
              fill="#FF6B00"
            />
            {/* Wrench Circle Eye */}
            <circle cx="96" cy="144" r="5" fill="#FFFFFF" />
          </svg>
        </div>

        {/* Brand Text Header */}
        {variant !== 'icon' && (
          <div className="flex flex-col text-left">
            <div className={`font-black tracking-tight leading-none flex items-center gap-1 ${titleSizes[size]}`}>
              <span className={isWhite ? 'text-white' : 'text-[#0A2540]'}>DURGAPUR</span>
              <span className="text-[#FF6B00]">FIX</span>
            </div>
            {showTagline && (
              <div className={`flex items-center gap-1 mt-1 font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap ${taglineSizes[size]}`}>
                <span className="h-[1px] w-2 bg-[#FF6B00] inline-block opacity-70"></span>
                <span className={isWhite ? 'text-blue-100/90' : 'text-[#0A2540]'}>FIND</span>
                <span className="text-[#FF6B00]">•</span>
                <span className={isWhite ? 'text-blue-100/90' : 'text-[#0A2540]'}>CONNECT</span>
                <span className="text-[#FF6B00]">•</span>
                <span className="text-[#FF6B00] font-extrabold">GET IT FIXED</span>
                <span className="h-[1px] w-2 bg-[#FF6B00] inline-block opacity-70"></span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
