import React from 'react';

/**
 * Orbit Logo: Blue & Black Abstract Black Hole
 * Matches the Saturn/Black Hole silhouette with electric neon blue glowing orbital rings,
 * deep black core, and white orbiting particle.
 */
export default function OrbitLogo({ size = 32, className = '' }) {
  const idPrefix = React.useId().replace(/:/g, '');

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          {/* Electric Blue Neon Gradient */}
          <linearGradient id={`${idPrefix}-blue-ring`} x1="15%" y1="20%" x2="85%" y2="80%">
            <stop offset="0%" stopColor="#38bdf8" />   {/* Sky / Cyan highlight */}
            <stop offset="35%" stopColor="#00d2ff" />  {/* Vivid electric cyan */}
            <stop offset="70%" stopColor="#2563eb" />  {/* Vibrant blue */}
            <stop offset="100%" stopColor="#1d4ed8" /> {/* Deep royal blue */}
          </linearGradient>

          {/* Secondary highlight gradient for the front swoop */}
          <linearGradient id={`${idPrefix}-front-glow`} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="60%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          {/* Soft ambient cosmic background haze */}
          <radialGradient id={`${idPrefix}-bg-aura`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.32" />
            <stop offset="65%" stopColor="#0369a1" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>

          {/* Neon Bloom Glow Filter */}
          <filter id={`${idPrefix}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Soft Circular Background Aura (Behind everything) */}
        <circle
          cx="50"
          cy="49"
          r="38"
          fill={`url(#${idPrefix}-bg-aura)`}
        />

        {/* 2. Back Upper Arc of the Outer Ring (Passes behind the sphere) */}
        <path
          d="M 22 55 C 20 30, 68 18, 84 37"
          stroke={`url(#${idPrefix}-blue-ring)`}
          strokeWidth="6.5"
          strokeLinecap="round"
          filter={`url(#${idPrefix}-glow)`}
        />

        {/* 3. Deep Black Hole Singularity Core Sphere */}
        <circle
          cx="50"
          cy="48"
          r="23"
          fill="#000000"
          stroke="#0f172a"
          strokeWidth="1.2"
        />

        {/* 4. Inner Ring Track with White Particle */}
        <path
          d="M 64 33 C 74 36, 80 43, 76 49 C 71 55, 54 58, 44 57"
          stroke={`url(#${idPrefix}-blue-ring)`}
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* White Orbiting Satellite / Photon Particle */}
        <circle
          cx="74"
          cy="38"
          r="3"
          fill="#ffffff"
          className="drop-shadow-[0_0_4px_rgba(255,255,255,0.9)]"
        />

        {/* 5. Front Lower Arc of the Outer Ring (Sweeps boldly in front of the sphere) */}
        <path
          d="M 20 58 C 22 71, 48 76, 75 58 C 84 52, 88 44, 85 37"
          stroke={`url(#${idPrefix}-front-glow)`}
          strokeWidth="7"
          strokeLinecap="round"
          filter={`url(#${idPrefix}-glow)`}
        />

        {/* Upper Left Front Tip (Connecting curvature) */}
        <path
          d="M 21 54 C 20 56, 20.5 57.5, 22 59"
          stroke={`url(#${idPrefix}-front-glow)`}
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
