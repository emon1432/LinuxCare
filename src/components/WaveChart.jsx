import React from 'react';

export default function WaveChart({ history = [], label = "CPU & RAM Telemetry", height = 140 }) {
  // If not enough data points, pad with defaults
  const points = history.length > 1 ? history : [
    { cpu: 15, ram: 45 }, { cpu: 22, ram: 48 }, { cpu: 18, ram: 46 },
    { cpu: 35, ram: 50 }, { cpu: 25, ram: 49 }, { cpu: 19, ram: 47 }
  ];

  const width = 450;
  const padding = 15;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Generate SVG path for a metric
  const makePath = (key) => {
    if (points.length === 0) return '';
    const stepX = chartWidth / (points.length - 1);
    
    return points.reduce((acc, curr, index) => {
      const x = padding + index * stepX;
      const y = padding + chartHeight - (curr[key] / 100) * chartHeight;
      if (index === 0) return `M ${x} ${y}`;
      // Smooth cubic bezier spline
      const prev = points[index - 1];
      const prevX = padding + (index - 1) * stepX;
      const prevY = padding + chartHeight - (prev[key] / 100) * chartHeight;
      const cp1x = prevX + (x - prevX) / 2;
      const cp2x = cp1x;
      return `${acc} C ${cp1x} ${prevY}, ${cp2x} ${y}, ${x} ${y}`;
    }, '');
  };

  const cpuPath = makePath('cpu');
  const ramPath = makePath('ram');

  // Closed area paths for gradient fills
  const makeAreaPath = (linePath) => {
    if (!linePath) return '';
    return `${linePath} L ${padding + chartWidth} ${height - padding} L ${padding} ${height - padding} Z`;
  };

  const cpuArea = makeAreaPath(cpuPath);

  return (
    <div className="p-4 rounded-2xl cyber-card flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase">{label}</h3>
          <p className="text-[11px] text-cyber-muted">Real-time kernel polling (500ms sample)</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan shadow-neon-cyan animate-pulse"></span>
            <span className="text-cyber-cyan font-semibold">CPU: {points[points.length - 1]?.cpu || 0}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-blue"></span>
            <span className="text-cyber-blue font-semibold">RAM: {points[points.length - 1]?.ram || 0}%</span>
          </div>
        </div>
      </div>

      <div className="w-full relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible">
          <defs>
            <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f5d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00f5d4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1f2552" strokeDasharray="3 3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1f2552" strokeDasharray="3 3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#2a326d" />

          {/* Area fill */}
          <path d={cpuArea} fill="url(#cpuGradient)" />

          {/* Spline Lines */}
          <path
            d={ramPath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="opacity-70"
          />
          <path
            d={cpuPath}
            fill="none"
            stroke="#00f5d4"
            strokeWidth="3"
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 8px rgba(0, 245, 212, 0.8))' }}
          />

          {/* Dot on current position */}
          {points.length > 0 && (
            <circle
              cx={padding + chartWidth}
              cy={padding + chartHeight - ((points[points.length - 1]?.cpu || 0) / 100) * chartHeight}
              r="4.5"
              fill="#00f5d4"
              style={{ filter: 'drop-shadow(0 0 6px #00f5d4)' }}
            />
          )}
        </svg>
      </div>
    </div>
  );
}
