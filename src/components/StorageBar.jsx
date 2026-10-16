import React from 'react';
import { HardDrive, Layers, Database, Disc, Server } from 'lucide-react';

export default function StorageBar({ diskMetrics, ramMetrics, storageBreakdown, disks = [] }) {
  const diskPct = diskMetrics?.percent || 0;
  const ramPct = ramMetrics?.percent || 0;

  const categories = storageBreakdown?.categories || [
    { name: 'System Core', formatted: '18.5 GB', bytes: 18.5, color: '#38bdf8' },
    { name: 'Installed Apps', formatted: '14.2 GB', bytes: 14.2, color: '#7c3aed' },
    { name: 'Developer Tools', formatted: '12.8 GB', bytes: 12.8, color: '#00f5d4' },
    { name: 'Cache & Logs', formatted: '3.1 GB', bytes: 3.1, color: '#f43f5e' },
    { name: 'User Files', formatted: '8.4 GB', bytes: 8.4, color: '#10b981' }
  ];

  const totalUsed = categories.reduce((sum, c) => sum + c.bytes, 0);

  // Fallback to primary disk if disks array is empty
  const diskList = disks.length > 0 ? disks : (diskMetrics ? [{
    filesystem: '/dev/sdb2',
    mount: '/',
    model: 'System SSD',
    driveType: 'SSD',
    label: 'Primary System SSD',
    total: diskMetrics.total,
    used: diskMetrics.used,
    avail: diskMetrics.available,
    percent: diskMetrics.percent,
    formattedTotal: diskMetrics.formattedTotal,
    formattedUsed: diskMetrics.formattedUsed,
    formattedAvail: diskMetrics.formattedAvail
  }] : []);

  return (
    <div className="space-y-6">
      {/* ALL CONNECTED STORAGE DRIVES (SSD + 4TB HDD + EXT) */}
      <div className="p-6 rounded-2xl cyber-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2759]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyber-cyan/10 text-cyber-cyan">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Connected Storage Drives ({diskList.length} Drives Detected)
              </h3>
              <p className="text-[11px] text-cyber-muted">
                All mounted physical drives, SSDs, mass storage HDDs, and partitions
              </p>
            </div>
          </div>

          {diskMetrics?.totalAggregate && (
            <div className="hidden sm:block text-right">
              <span className="text-[11px] text-cyber-muted">Total PC Capacity: </span>
              <strong className="text-xs font-mono text-cyber-cyan">{diskMetrics.totalAggregate.formattedTotal}</strong>
              <span className="text-[11px] text-cyber-muted"> ({diskMetrics.totalAggregate.formattedAvail} Free)</span>
            </div>
          )}
        </div>

        {/* Drives Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {diskList.map((disk, idx) => {
            const isSSD = disk.driveType === 'SSD';
            const progressColor = disk.percent > 85 ? '#f43f5e' : (disk.percent > 70 ? '#fbbf24' : (isSSD ? '#00f5d4' : '#a855f7'));
            
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#111538] border border-[#202758] hover:border-cyber-cyan/40 transition-all duration-300 space-y-3 group"
              >
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${
                      isSSD 
                        ? 'bg-cyan-950/50 border-cyan-700/60 text-cyber-cyan' 
                        : 'bg-purple-950/50 border-purple-700/60 text-purple-300'
                    }`}>
                      {isSSD ? <HardDrive className="w-5 h-5" /> : <Disc className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white tracking-wide group-hover:text-cyber-cyan transition-colors">
                          {disk.label}
                        </h4>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          isSSD ? 'bg-cyan-950 text-cyber-cyan border border-cyan-800' : 'bg-purple-950 text-purple-300 border border-purple-800'
                        }`}>
                          {disk.driveType}
                        </span>
                      </div>
                      <p className="text-[10px] text-cyber-muted font-mono mt-0.5">
                        Model: <span className="text-slate-300">{disk.model}</span> • Mount: <span className="text-slate-300">{disk.mount}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black font-mono tracking-tight" style={{ color: progressColor }}>
                      {disk.percent}%
                    </span>
                    <p className="text-[10px] text-cyber-muted">Used</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="h-2.5 w-full bg-[#1b2149] rounded-full overflow-hidden p-0.5 relative">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${disk.percent}%`,
                        backgroundColor: progressColor,
                        boxShadow: `0 0 12px ${progressColor}80`
                      }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono mt-1.5 text-cyber-muted">
                    <span>Used: <strong className="text-slate-200">{disk.formattedUsed}</strong> / {disk.formattedTotal}</span>
                    <span className="text-cyber-green font-semibold">{disk.formattedAvail} Free</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dual Neon Sliders & Category Breakdown */}
      <div className="p-6 rounded-2xl cyber-card space-y-6">
        <div className="space-y-4">
          {/* Total System Storage Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-white flex items-center gap-2">
                <HardDrive className="w-3.5 h-3.5 text-cyber-cyan" />
                Aggregated PC Storage ({diskMetrics?.totalAggregate?.formattedTotal || diskMetrics?.formattedTotal})
              </span>
              <span className="font-mono text-cyber-cyan font-bold">
                {diskMetrics?.totalAggregate?.percent || diskPct}% Used ({diskMetrics?.totalAggregate?.formattedUsed || diskMetrics?.formattedUsed} / {diskMetrics?.totalAggregate?.formattedTotal || diskMetrics?.formattedTotal})
              </span>
            </div>
            <div className="h-3 w-full bg-[#1b2149] rounded-full overflow-hidden p-0.5 relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyber-cyan via-[#00b4d8] to-cyber-blue shadow-neon-cyan transition-all duration-700"
                style={{ width: `${diskMetrics?.totalAggregate?.percent || diskPct}%` }}
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

        {/* Segmented Phone-style Storage Breakdown for System SSD */}
        <div className="pt-4 border-t border-[#1e2659]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyber-green" />
              Primary System SSD Breakdown ({diskMetrics?.formattedTotal})
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
    </div>
  );
}
