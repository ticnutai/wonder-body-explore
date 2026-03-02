import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrganInfo, organs } from '@/data/organs';

interface HumanBodyModelProps {
  onSelectOrgan: (organ: OrganInfo) => void;
  selectedOrgan: OrganInfo | null;
}

const organHotspots: Record<string, { x: number; y: number; w: number; h: number }> = {
  brain:   { x: 170, y: 22,  w: 60, h: 50 },
  eyes:    { x: 178, y: 52,  w: 44, h: 16 },
  ears:    { x: 158, y: 42,  w: 84, h: 20 },
  heart:   { x: 206, y: 145, w: 32, h: 36 },
  lungs:   { x: 160, y: 130, w: 80, h: 60 },
  stomach: { x: 182, y: 200, w: 40, h: 38 },
  hands:   { x: 88,  y: 230, w: 224, h: 40 },
  legs:    { x: 155, y: 310, w: 90, h: 180 },
};

const HumanBodyModel = ({ onSelectOrgan, selectedOrgan }: HumanBodyModelProps) => {
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);

  return (
    <div className="flex items-center justify-center w-full h-full relative select-none">
      <svg 
        viewBox="0 0 400 520" 
        className="w-full max-w-[520px] h-auto drop-shadow-2xl" 
        style={{ maxHeight: 'calc(100vh - 140px)' }}
      >
        <defs>
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="soft-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="body-shadow">
            <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#4fc3f7" floodOpacity="0.15" />
          </filter>
          <linearGradient id="skinGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a4a6b" />
            <stop offset="50%" stopColor="#1e3a5c" />
            <stop offset="100%" stopColor="#152d47" />
          </linearGradient>
          <linearGradient id="skinHighlight" x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="#3a6a9b" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1e3a5c" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="headGlow" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#4fc3f7" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#4fc3f7" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background particles */}
        {[...Array(20)].map((_, i) => (
          <circle
            key={`p-${i}`}
            cx={50 + Math.random() * 300}
            cy={50 + Math.random() * 420}
            r={0.5 + Math.random() * 1.5}
            fill="#4fc3f7"
            opacity={0.1 + Math.random() * 0.2}
          >
            <animate
              attributeName="opacity"
              values={`${0.1 + Math.random() * 0.1};${0.3 + Math.random() * 0.2};${0.1 + Math.random() * 0.1}`}
              dur={`${3 + Math.random() * 4}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* === FULL BODY === */}
        <g filter="url(#body-shadow)">
          {/* Head */}
          <ellipse cx="200" cy="48" rx="36" ry="42" fill="url(#skinGradient)" stroke="#3a6a9b" strokeWidth="1" />
          <ellipse cx="200" cy="48" rx="36" ry="42" fill="url(#headGlow)" />
          
          {/* Face details */}
          <ellipse cx="188" cy="45" rx="5" ry="3.5" fill="#0d1b2a" stroke="#2a5a8a" strokeWidth="0.5" />
          <ellipse cx="212" cy="45" rx="5" ry="3.5" fill="#0d1b2a" stroke="#2a5a8a" strokeWidth="0.5" />
          <ellipse cx="188" cy="44.5" rx="2" ry="2" fill="#4fc3f7" opacity="0.6" />
          <ellipse cx="212" cy="44.5" rx="2" ry="2" fill="#4fc3f7" opacity="0.6" />
          <path d="M194 58 Q200 63 206 58" fill="none" stroke="#3a6a9b" strokeWidth="1.2" strokeLinecap="round" />
          <ellipse cx="200" cy="53" rx="3" ry="2" fill="#1e3a5c" stroke="#2a5a8a" strokeWidth="0.5" />
          
          {/* Ears */}
          <ellipse cx="163" cy="48" rx="5" ry="10" fill="url(#skinGradient)" stroke="#3a6a9b" strokeWidth="0.8" />
          <ellipse cx="237" cy="48" rx="5" ry="10" fill="url(#skinGradient)" stroke="#3a6a9b" strokeWidth="0.8" />

          {/* Neck */}
          <rect x="190" y="88" width="20" height="28" rx="6" fill="url(#skinGradient)" stroke="#3a6a9b" strokeWidth="0.8" />

          {/* Shoulders & Torso */}
          <path 
            d="M190 110 Q190 105 170 105 L138 112 Q128 115 128 125 L128 130
               M210 110 Q210 105 230 105 L262 112 Q272 115 272 125 L272 130"
            fill="url(#skinGradient)" stroke="#3a6a9b" strokeWidth="1"
          />
          
          {/* Main torso */}
          <path
            d="M148 118 Q140 118 138 125 L135 200 Q134 230 140 260 L148 290 Q155 310 170 315 L230 315 Q245 310 252 290 L260 260 Q266 230 265 200 L262 125 Q260 118 252 118 Z"
            fill="url(#skinGradient)" stroke="#3a6a9b" strokeWidth="1.2"
          />
          <path
            d="M148 118 Q140 118 138 125 L135 200 Q134 230 140 260 L148 290 Q155 310 170 315 L230 315 Q245 310 252 290 L260 260 Q266 230 265 200 L262 125 Q260 118 252 118 Z"
            fill="url(#skinHighlight)"
          />

          {/* Chest line */}
          <line x1="200" y1="120" x2="200" y2="290" stroke="#2a5a8a" strokeWidth="0.5" opacity="0.4" />
          {/* Rib hints */}
          <path d="M175 145 Q200 150 225 145" fill="none" stroke="#2a5a8a" strokeWidth="0.4" opacity="0.3" />
          <path d="M172 160 Q200 166 228 160" fill="none" stroke="#2a5a8a" strokeWidth="0.4" opacity="0.3" />
          <path d="M170 175 Q200 182 230 175" fill="none" stroke="#2a5a8a" strokeWidth="0.4" opacity="0.3" />
          {/* Abs hints */}
          <path d="M188 220 Q200 224 212 220" fill="none" stroke="#2a5a8a" strokeWidth="0.4" opacity="0.25" />
          <path d="M188 240 Q200 244 212 240" fill="none" stroke="#2a5a8a" strokeWidth="0.4" opacity="0.25" />
          <path d="M188 260 Q200 264 212 260" fill="none" stroke="#2a5a8a" strokeWidth="0.4" opacity="0.25" />

          {/* Left Arm */}
          <path
            d="M138 125 L125 130 Q115 135 110 155 L100 220 Q95 240 92 260 L88 280 Q85 290 90 295 L98 296 Q104 292 106 282 L112 250 L120 195 L128 155"
            fill="url(#skinGradient)" stroke="#3a6a9b" strokeWidth="1"
          />
          {/* Left hand */}
          <path
            d="M88 280 L84 290 Q80 300 84 305 L92 306 Q98 302 96 296 L90 286
               M88 280 L82 295 Q78 304 82 308 L88 308
               M88 280 L86 298 Q84 308 88 312 L92 310"
            fill="url(#skinGradient)" stroke="#3a6a9b" strokeWidth="0.8"
          />

          {/* Right Arm */}
          <path
            d="M262 125 L275 130 Q285 135 290 155 L300 220 Q305 240 308 260 L312 280 Q315 290 310 295 L302 296 Q296 292 294 282 L288 250 L280 195 L272 155"
            fill="url(#skinGradient)" stroke="#3a6a9b" strokeWidth="1"
          />
          {/* Right hand */}
          <path
            d="M312 280 L316 290 Q320 300 316 305 L308 306 Q302 302 304 296 L310 286
               M312 280 L318 295 Q322 304 318 308 L312 308
               M312 280 L314 298 Q316 308 312 312 L308 310"
            fill="url(#skinGradient)" stroke="#3a6a9b" strokeWidth="0.8"
          />

          {/* Left Leg */}
          <path
            d="M170 312 L165 320 L158 370 L150 430 L148 470 Q146 490 150 500 L158 505 Q165 505 166 498 L168 470 L172 400 L178 340 L185 315"
            fill="url(#skinGradient)" stroke="#3a6a9b" strokeWidth="1.2"
          />
          {/* Left foot */}
          <path d="M150 498 L142 502 Q135 505 136 510 L155 510 Q166 508 166 502 L166 498" fill="url(#skinGradient)" stroke="#3a6a9b" strokeWidth="0.8" />

          {/* Right Leg */}
          <path
            d="M230 312 L235 320 L242 370 L250 430 L252 470 Q254 490 250 500 L242 505 Q235 505 234 498 L232 470 L228 400 L222 340 L215 315"
            fill="url(#skinGradient)" stroke="#3a6a9b" strokeWidth="1.2"
          />
          {/* Right foot */}
          <path d="M250 498 L258 502 Q265 505 264 510 L245 510 Q234 508 234 502 L234 498" fill="url(#skinGradient)" stroke="#3a6a9b" strokeWidth="0.8" />
        </g>

        {/* === INTERNAL ORGANS (visible through body) === */}
        
        {/* Brain */}
        <g opacity={hoveredOrgan === 'brain' || selectedOrgan?.id === 'brain' ? 1 : 0.55}>
          <path
            d="M180 28 Q175 20 182 15 Q192 8 200 10 Q208 8 218 15 Q225 20 220 28 Q225 35 220 42 Q215 48 208 48 Q200 50 192 48 Q185 48 180 42 Q175 35 180 28Z"
            fill={hoveredOrgan === 'brain' || selectedOrgan?.id === 'brain' ? '#ff9ecd' : '#e87aaf'}
            stroke="#ffb8db"
            strokeWidth="0.8"
            filter={hoveredOrgan === 'brain' || selectedOrgan?.id === 'brain' ? 'url(#neon-glow)' : undefined}
            style={{ transition: 'all 0.3s ease' }}
          />
          <path d="M200 15 L200 48" stroke="#d4618a" strokeWidth="0.5" opacity="0.5" />
          <path d="M188 22 Q195 28 188 35" stroke="#d4618a" strokeWidth="0.4" opacity="0.4" fill="none" />
          <path d="M212 22 Q205 28 212 35" stroke="#d4618a" strokeWidth="0.4" opacity="0.4" fill="none" />
          {(hoveredOrgan === 'brain' || selectedOrgan?.id === 'brain') && (
            <animate attributeName="opacity" values="0.85;1;0.85" dur="2s" repeatCount="indefinite" />
          )}
        </g>

        {/* Lungs */}
        <g opacity={hoveredOrgan === 'lungs' || selectedOrgan?.id === 'lungs' ? 1 : 0.5}>
          {/* Left lung */}
          <path
            d="M160 135 Q155 130 152 140 L148 175 Q147 190 155 192 L168 190 Q172 188 172 180 L170 150 Q170 138 165 135Z"
            fill={hoveredOrgan === 'lungs' || selectedOrgan?.id === 'lungs' ? '#a7e0db' : '#80cbc4'}
            stroke="#4db6ac"
            strokeWidth="0.8"
            filter={hoveredOrgan === 'lungs' || selectedOrgan?.id === 'lungs' ? 'url(#soft-glow)' : undefined}
            style={{ transition: 'all 0.3s ease' }}
          />
          {/* Right lung */}
          <path
            d="M240 135 Q245 130 248 140 L252 175 Q253 190 245 192 L232 190 Q228 188 228 180 L230 150 Q230 138 235 135Z"
            fill={hoveredOrgan === 'lungs' || selectedOrgan?.id === 'lungs' ? '#a7e0db' : '#80cbc4'}
            stroke="#4db6ac"
            strokeWidth="0.8"
            filter={hoveredOrgan === 'lungs' || selectedOrgan?.id === 'lungs' ? 'url(#soft-glow)' : undefined}
            style={{ transition: 'all 0.3s ease' }}
          />
          {/* Bronchi */}
          <path d="M200 128 L200 145 M200 138 L175 155 M200 138 L225 155" stroke="#4db6ac" strokeWidth="0.8" fill="none" opacity="0.5" />
          {(hoveredOrgan === 'lungs' || selectedOrgan?.id === 'lungs') && (
            <>
              <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
            </>
          )}
        </g>

        {/* Heart */}
        <g opacity={hoveredOrgan === 'heart' || selectedOrgan?.id === 'heart' ? 1 : 0.6}>
          <path
            d="M200 158 Q195 148 202 142 Q210 136 215 145 Q220 136 228 142 Q235 148 230 158 L215 178Z"
            fill={hoveredOrgan === 'heart' || selectedOrgan?.id === 'heart' ? '#ff6b6b' : '#ef5350'}
            stroke="#f44336"
            strokeWidth="0.8"
            filter={hoveredOrgan === 'heart' || selectedOrgan?.id === 'heart' ? 'url(#neon-glow)' : undefined}
            style={{ transition: 'all 0.3s ease' }}
          >
            <animate attributeName="d"
              values="M200 158 Q195 148 202 142 Q210 136 215 145 Q220 136 228 142 Q235 148 230 158 L215 178Z;M200 160 Q193 148 200 140 Q209 133 215 143 Q221 133 230 140 Q237 148 232 160 L215 182Z;M200 158 Q195 148 202 142 Q210 136 215 145 Q220 136 228 142 Q235 148 230 158 L215 178Z"
              dur="1s" repeatCount="indefinite" />
          </path>
        </g>

        {/* Stomach */}
        <g opacity={hoveredOrgan === 'stomach' || selectedOrgan?.id === 'stomach' ? 1 : 0.5}>
          <path
            d="M192 205 Q185 200 183 210 Q180 225 188 235 Q195 240 205 238 Q212 235 210 225 Q215 215 210 208 Q205 202 198 205Z"
            fill={hoveredOrgan === 'stomach' || selectedOrgan?.id === 'stomach' ? '#ffe082' : '#ffd54f'}
            stroke="#ffca28"
            strokeWidth="0.8"
            filter={hoveredOrgan === 'stomach' || selectedOrgan?.id === 'stomach' ? 'url(#soft-glow)' : undefined}
            style={{ transition: 'all 0.3s ease' }}
          />
        </g>

        {/* === CLICKABLE HOTSPOTS (invisible but interactive) === */}
        {organs.map((organ) => {
          const hot = organHotspots[organ.id];
          if (!hot) return null;
          const isActive = hoveredOrgan === organ.id || selectedOrgan?.id === organ.id;

          return (
            <g key={organ.id}>
              <rect
                x={hot.x}
                y={hot.y}
                width={hot.w}
                height={hot.h}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectOrgan(organ);
                }}
                onMouseEnter={() => setHoveredOrgan(organ.id)}
                onMouseLeave={() => setHoveredOrgan(null)}
              />
              {/* Label */}
              <text
                x={hot.x + hot.w / 2}
                y={hot.y + hot.h + 14}
                textAnchor="middle"
                fill={isActive ? '#ffffff' : '#6b8aaa'}
                fontSize="10"
                fontFamily="Rubik, sans-serif"
                fontWeight={isActive ? '700' : '400'}
                style={{ transition: 'all 0.3s ease', pointerEvents: 'none' }}
                filter={isActive ? 'url(#soft-glow)' : undefined}
              >
                {organ.emoji} {organ.name}
              </text>
              {/* Active indicator line */}
              {isActive && (
                <line
                  x1={hot.x + hot.w / 2 - 15}
                  y1={hot.y + hot.h + 18}
                  x2={hot.x + hot.w / 2 + 15}
                  y2={hot.y + hot.h + 18}
                  stroke="#4fc3f7"
                  strokeWidth="1.5"
                  opacity="0.7"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default HumanBodyModel;
