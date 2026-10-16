import React from 'react';
import { HardDrive, Layers, Database } from 'lucide-react';

export default function StorageBar({ diskMetrics, ramMetrics, storageBreakdown }) {
  const diskPct = diskMetrics?.percent || 0;
  const ramPct = ramMetrics?.percent || 0;
  const swapPct = ramMetrics?.swapPercent || 0;

  const categories = storageBreakdown?.categories || [
    { name: 'System Core', formatted: '18.5 GB', bytes: 18.5, color: '#38bdf8' },
    { name: 'Installed Apps', formatted: '14.2 GB', bytes: 14.2, color: '#7c3aed' },
    { name: 'Developer Tools', formatted: '12.8 GB', bytes: 12.8, color: '#00f5d4' },
    { name: 'Cache & Logs', formatted: '3.1 GB', bytes: 3.1, color: '#f43f5e' },
    { name: 'User Files', formatted: '8.4 GB', bytes: 8.4, color: '#10b981' }
  ];

  const totalUsed = categories.reduce((sum, c) => sum + c.bytes, 0);

  return (
    <div className="p-6 rounded-2xl cyber-card space-y-6">
      {/* Dual Neon Sliders (Matching Reference Image) */}
      <div className="space-y-4">
        {/* Storage Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-white flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-cyber-cyan" />
              SSD Root Storage
            </span>
            <span className="font-mono text-cyber-cyan font-bold">{diskPct}% Used ({diskMetrics?.formattedUsed} / {diskMetrics?.formattedTotal})</span>
          </div>
          <div className="h-3 w-full bg-[#1b2149] rounded-full overflow-hidden p-0.5 relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyber-cyan via-[#00b4d8] to-cyber-blue shadow-neon-cyan transition-all duration-700"
              style={{ width: `${diskPct}%` }}
            ></div>
          </div>
        </div>

        {/* RAM Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-white flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-cyber-blue" />
              Physical RAM Memory
            </span>
            <span className="font-mono text-cyber-blue font-bold">{ramPct}% Used ({ramMetrics?.formattedUsed} / {ramMetrics?.formattedTotal})</span>
          </div>
          <div className="h-3 w-full bg-[#1b2149] rounded-full overflow-hidden p-0.5 relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyber-blue via-cyber-indigo to-cyber-purple shadow-neon-blue transition-all duration-700"
              style={{ width: `${ramPct}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Segmented Phone-style Storage Breakdown */}
      <div className="pt-4 border-t border-[#1e2659]">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-cyber-green" />
            Storage Breakdown by Category
          </h4>
          <span className="text-xs font-mono text-cyber-green font-semibold">
            {diskMetrics?.formattedAvail} Available Free
          </span>
        </div>

        {/* Multi-segmented bar */}
        <div className="h-4 w-full bg-[#161b3d] rounded-xl overflow-hidden flex p-0.5 gap-0.5 mb-4">
          {categories.map((cat, idx) => {
            const widthPct = totalUsed > 0 ? (cat.bytes / totalUsed) * 100 : 20;
            return (
              <div
                key={idx}
                className="h-full first:rounded-l-lg last:rounded-r-lg transition-all duration-500 hover:opacity-90 cursor-pointer"
                style={{ width: `${widthPct}%`, backgroundColor: cat.color }}
                title={`${cat.name}: ${cat.formatted}`}
              />
            );
          })}
        </div>

        {/* Legend Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-[#14183a] border border-[#1e2554]">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
              <div className="overflow-hidden">
                <p className="text-[11px] text-cyber-muted truncate">{cat.name}</p>
                <p className="text-xs font-bold text-white font-mono">{cat.formatted}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
