import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrganInfo, organs } from '@/data/organs';

interface HumanBodyModelProps {
  onSelectOrgan: (organ: OrganInfo) => void;
  selectedOrgan: OrganInfo | null;
}

const organPositions: Record<string, { cx: number; cy: number; rx: number; ry: number; label: { x: number; y: number } }> = {
  brain:   { cx: 200, cy: 60,  rx: 35, ry: 30, label: { x: 200, y: 60 } },
  eyes:    { cx: 200, cy: 95,  rx: 28, ry: 8,  label: { x: 200, y: 95 } },
  ears:    { cx: 200, cy: 75,  rx: 45, ry: 10, label: { x: 200, y: 75 } },
  heart:   { cx: 210, cy: 200, rx: 20, ry: 22, label: { x: 210, y: 200 } },
  lungs:   { cx: 200, cy: 210, rx: 45, ry: 35, label: { x: 200, y: 210 } },
  stomach: { cx: 195, cy: 275, rx: 25, ry: 22, label: { x: 195, y: 275 } },
  hands:   { cx: 200, cy: 330, rx: 80, ry: 15, label: { x: 200, y: 330 } },
  legs:    { cx: 200, cy: 450, rx: 35, ry: 70, label: { x: 200, y: 450 } },
};

const HumanBodyModel = ({ onSelectOrgan, selectedOrgan }: HumanBodyModelProps) => {
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <svg viewBox="0 0 400 550" className="w-full max-w-[500px] h-auto" style={{ maxHeight: 'calc(100vh - 150px)' }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="bodyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0d1b2a" stopOpacity="0.8" />
          </linearGradient>
          <radialGradient id="organGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4fc3f7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4fc3f7" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Body silhouette */}
        <g opacity="0.5">
          {/* Head */}
          <ellipse cx="200" cy="55" rx="40" ry="45" fill="url(#bodyGradient)" stroke="#2a5a8a" strokeWidth="1.5" />
          {/* Neck */}
          <rect x="188" y="95" width="24" height="25" rx="8" fill="url(#bodyGradient)" stroke="#2a5a8a" strokeWidth="1" />
          {/* Torso */}
          <path d="M140 120 Q140 115 160 115 L240 115 Q260 115 260 120 L270 170 L270 300 Q270 320 250 320 L150 320 Q130 320 130 300 L130 170 Z"
            fill="url(#bodyGradient)" stroke="#2a5a8a" strokeWidth="1.5" />
          {/* Left Arm */}
          <path d="M140 125 L110 130 Q95 135 90 160 L80 260 Q78 275 85 280 L95 282 Q102 280 104 270 L120 170 L130 145"
            fill="url(#bodyGradient)" stroke="#2a5a8a" strokeWidth="1.5" />
          {/* Right Arm */}
          <path d="M260 125 L290 130 Q305 135 310 160 L320 260 Q322 275 315 280 L305 282 Q298 280 296 270 L280 170 L270 145"
            fill="url(#bodyGradient)" stroke="#2a5a8a" strokeWidth="1.5" />
          {/* Left Leg */}
          <path d="M150 318 L148 320 L140 400 L135 480 Q133 500 145 505 L155 505 Q165 500 163 490 L170 400 L180 325"
            fill="url(#bodyGradient)" stroke="#2a5a8a" strokeWidth="1.5" />
          {/* Right Leg */}
          <path d="M250 318 L252 320 L260 400 L265 480 Q267 500 255 505 L245 505 Q235 500 237 490 L230 400 L220 325"
            fill="url(#bodyGradient)" stroke="#2a5a8a" strokeWidth="1.5" />
        </g>

        {/* Clickable organs */}
        {organs.map((organ) => {
          const pos = organPositions[organ.id];
          if (!pos) return null;
          const isHovered = hoveredOrgan === organ.id;
          const isSelected = selectedOrgan?.id === organ.id;
          const active = isHovered || isSelected;

          return (
            <g
              key={organ.id}
              onClick={() => onSelectOrgan(organ)}
              onMouseEnter={() => setHoveredOrgan(organ.id)}
              onMouseLeave={() => setHoveredOrgan(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Glow background */}
              {active && (
                <ellipse
                  cx={pos.cx}
                  cy={pos.cy}
                  rx={pos.rx + 12}
                  ry={pos.ry + 12}
                  fill={organ.color}
                  opacity={0.15}
                  filter="url(#glow-strong)"
                />
              )}
              {/* Organ shape */}
              <ellipse
                cx={pos.cx}
                cy={pos.cy}
                rx={active ? pos.rx + 3 : pos.rx}
                ry={active ? pos.ry + 3 : pos.ry}
                fill={active ? organ.hoverColor : organ.color}
                opacity={active ? 0.9 : 0.6}
                filter={active ? 'url(#glow)' : undefined}
                style={{ transition: 'all 0.3s ease' }}
              />
              {/* Label */}
              <text
                x={pos.label.x}
                y={pos.label.y + (pos.ry + 20)}
                textAnchor="middle"
                fill={active ? '#ffffff' : '#8899aa'}
                fontSize="12"
                fontFamily="Rubik, sans-serif"
                fontWeight={active ? '600' : '400'}
                style={{ transition: 'all 0.3s ease', pointerEvents: 'none' }}
              >
                {organ.emoji} {organ.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default HumanBodyModel;
