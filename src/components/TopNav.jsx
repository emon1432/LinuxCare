import React from 'react';
import { Zap, RefreshCw, Bell, Shield, Activity } from 'lucide-react';

export default function TopNav({ systemMetrics, onBoost, isBoosting, onRefresh, isRefreshing }) {
  const health = systemMetrics?.system?.healthScore || 95;
  const uptimeHours = Math.floor((systemMetrics?.system?.uptimeSeconds || 0) / 3600);
  const uptimeMinutes = Math.floor(((systemMetrics?.system?.uptimeSeconds || 0) % 3600) / 60);

  const getHealthBadge = (score) => {
    if (score >= 85) {
      return { text: 'Optimal Health', color: 'text-cyber-green', border: 'border-cyber-green/40', bg: 'bg-emerald-950/40' };
    }
    if (score >= 70) {
      return { text: 'Good State', color: 'text-cyber-cyan', border: 'border-cyber-cyan/40', bg: 'bg-cyan-950/40' };
    }
    return { text: 'Needs Attention', color: 'text-cyber-pink', border: 'border-cyber-pink/40', bg: 'bg-rose-950/40' };
  };

  const badge = getHealthBadge(health);

  return (
    <header className="h-20 px-8 border-b border-[#1a2046] bg-[#0c0f24]/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
      {/* Left: Health Indicator */}
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border ${badge.border} ${badge.bg}`}>
          <Shield className={`w-4 h-4 ${badge.color}`} />
          <span className={`text-xs font-semibold tracking-wide ${badge.color}`}>
            System Health: {health}% • {badge.text}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-cyber-muted px-3 py-1 rounded-lg bg-[#14183d]">
          <Activity className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>Uptime: {uptimeHours}h {uptimeMinutes}m</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2.5 rounded-xl cyber-card text-slate-300 hover:text-cyber-cyan hover:border-cyber-cyan/50 transition-all active:scale-95 disabled:opacity-50"
          title="Refresh Metrics"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyber-cyan' : ''}`} />
        </button>

        {/* 1-Click System Boost Button */}
        <button
          onClick={onBoost}
          disabled={isBoosting}
          className="relative group overflow-hidden px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00f5d4] via-[#00b4d8] to-[#6366f1] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-neon-cyan transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-60"
        >
          <Zap className={`w-4 h-4 text-black stroke-[3] ${isBoosting ? 'animate-bounce' : 'group-hover:rotate-12'} transition-transform`} />
          <span>{isBoosting ? 'Boosting System...' : '1-Click Boost'}</span>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"></div>
        </button>
      </div>
    </header>
  );
}
