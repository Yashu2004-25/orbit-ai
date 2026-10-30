import React from 'react';

/**
 * Orbit Logo: Razor-sharp Blue & Black Planet with Glowing Accretion Ring
 * Built with exact geometric arcs so there are zero disjointed caps, distortions, or blurry dilations.
 */
export default function OrbitLogo({ size = 32, className = '' }) {
  const idPrefix = React.useId().replace(/:/g, '');

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 256 256"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Crisp Electric Neon Blue Gradient */}
          <linearGradient id={`${idPrefix}-blue`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="35%" stopColor="#00d2ff" />
            <stop offset="70%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          {/* Clean, tight neon glow (non-dilated) */}
          <filter id={`${idPrefix}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft cosmic background aura */}
          <radialGradient id={`${idPrefix}-aura`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.28" />
            <stop offset="70%" stopColor="#0369a1" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Halo */}
        <circle cx="128" cy="128" r="95" fill={`url(#${idPrefix}-aura)`} />

        {/* Tilted Planetary Ring System (-26deg) */}
        <g transform="rotate(-26 128 128)">
          {/* 1. Back Arc of the Outer Ring (behind sphere) */}
          <path
            d="M 32 128 A 96 35 0 0 1 224 128"
            fill="none"
            stroke={`url(#${idPrefix}-blue)`}
            strokeWidth="12"
            strokeLinecap="round"
            filter={`url(#${idPrefix}-glow)`}
          />

          {/* 2. Inner Satellite Orbit Track */}
          <path
            d="M 152 108 A 78 28 0 0 1 206 128"
            fill="none"
            stroke={`url(#${idPrefix}-blue)`}
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* 3. Orbiting White Satellite Moon */}
          <circle cx="184" cy="114" r="7" fill="#ffffff" />
          <circle
            cx="184"
            cy="114"
            r="9"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.5"
            opacity="0.6"
          />

          {/* 4. Pure Black Planet Sphere Core */}
          <circle
            cx="128"
            cy="128"
            r="54"
            fill="#000000"
            stroke="#1e293b"
            strokeWidth="1.5"
          />

          {/* 5. Front Arc of the Outer Ring (smoothly sweeps in front of sphere) */}
          <path
            d="M 224 128 A 96 35 0 0 1 32 128"
            fill="none"
            stroke={`url(#${idPrefix}-blue)`}
            strokeWidth="12"
            strokeLinecap="round"
            filter={`url(#${idPrefix}-glow)`}
          />
        </g>
      </svg>
    </div>
  );
}
