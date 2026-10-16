import React from 'react';
import { 
  LayoutDashboard, 
  Trash2, 
  Layers, 
  Cpu, 
  Settings, 
  ShieldCheck, 
  Terminal, 
  HardDrive
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, systemInfo }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cleaner', label: 'Junk Cleaner', icon: Trash2 },
    { id: 'apps', label: 'App Manager', icon: Layers },
    { id: 'telemetry', label: 'Telemetry', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0a0d20] border-r border-[#1a2046] flex flex-col justify-between p-5 select-none shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyber-cyan via-cyber-blue to-cyber-purple flex items-center justify-center shadow-neon-cyan">
            <ShieldCheck className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-white font-mono flex items-center gap-1.5">
              LINUX<span className="text-cyber-cyan text-glow-cyan">CARE</span>
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-cyber-green shadow-neon-cyan animate-pulse"></span>
              <span className="text-[10px] text-cyber-muted font-mono tracking-widest uppercase">System Guard</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-[#171f54] to-[#12163e] text-cyber-cyan border-l-4 border-cyber-cyan shadow-card-glow font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-[#12163a]'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-cyber-cyan' : 'text-slate-400'}`} />
                <span className="tracking-wide">{item.label}</span>
                {isActive && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-cyber-cyan shadow-neon-cyan"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Machine Info Card */}
      <div className="p-4 rounded-2xl cyber-card bg-gradient-to-b from-[#13173d] to-[#0c0f26] border border-[#232b60] relative overflow-hidden">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="p-2 rounded-lg bg-[#1b2253] text-cyber-cyan">
            <HardDrive className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{systemInfo?.hostname || 'ubuntu'}</p>
            <p className="text-[10px] text-cyber-muted truncate">{systemInfo?.osName || 'Ubuntu Linux'}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-[#1e2659] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Kernel:</span>
          <span className="text-cyber-cyan font-medium truncate max-w-[120px]">{systemInfo?.kernel?.split('-')[0] || 'Linux'}</span>
        </div>
      </div>
    </aside>
  );
}
