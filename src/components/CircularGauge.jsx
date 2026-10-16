import React from 'react';

export default function CircularGauge({ 
  percentage = 0, 
  label = 'Metric', 
  sublabel = '', 
  color = '#00f5d4', // neon cyan
  size = 130, 
  strokeWidth = 10,
  icon: Icon
}) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl cyber-card relative group transition-all duration-300 hover:scale-105">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1b2149"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Neon Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 0.8s ease-in-out',
              filter: `drop-shadow(0 0 8px ${color})`
            }}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {Icon && <Icon className="w-4 h-4 mb-0.5 opacity-80" style={{ color }} />}
          <span className="text-xl font-bold tracking-tight text-white font-mono">
            {Math.round(percentage)}%
          </span>
          {sublabel && (
            <span className="text-[10px] text-cyber-muted tracking-wider uppercase font-medium">
              {sublabel}
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 text-center">
        <h4 className="text-xs font-semibold text-cyber-muted tracking-wider uppercase">{label}</h4>
      </div>
    </div>
  );
}
