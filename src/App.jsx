import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import CircularGauge from './components/CircularGauge';
import WaveChart from './components/WaveChart';
import StorageBar from './components/StorageBar';
import CleanerSection from './components/CleanerSection';
import AppManager from './components/AppManager';
import { Cpu, HardDrive, Database, ShieldCheck, Zap, Sparkles, Layers, Terminal, AlertTriangle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [storageBreakdown, setStorageBreakdown] = useState(null);
  const [isBoosting, setIsBoosting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [boostSuccessMsg, setBoostSuccessMsg] = useState(null);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('http://127.0.0.1:4141/api/metrics');
      const data = await res.json();
      setMetrics(data);

      // Append to telemetry history (keep last 20 samples)
      setHistory(prev => {
        const next = [...prev, { cpu: data.cpu.percent, ram: data.ram.percent }];
        return next.length > 20 ? next.slice(next.length - 20) : next;
      });
    } catch (e) {
      console.warn('System service offline or connecting...', e.message);
    }
  };

  const fetchStorageBreakdown = async () => {
    try {
      const res = await fetch('http://127.0.0.1:4141/api/storage-breakdown');
      const data = await res.json();
      setStorageBreakdown(data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchMetrics();
    fetchStorageBreakdown();

    // 2-second real-time polling
    const interval = setInterval(fetchMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchMetrics(), fetchStorageBreakdown()]);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleBoost = async () => {
    setIsBoosting(true);
    setBoostSuccessMsg(null);
    try {
      const res = await fetch('http://127.0.0.1:4141/api/boost', { method: 'POST' });
      const data = await res.json();
      setBoostSuccessMsg(data.message || 'System boosted successfully!');
      await fetchMetrics();
      setTimeout(() => setBoostSuccessMsg(null), 4000);
    } catch (e) {
      setBoostSuccessMsg('Boost finished.');
    } finally {
      setIsBoosting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0c0f24] text-slate-100 font-sans">
      {/* Futuristic Cyberpunk Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemInfo={metrics?.system}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav
          systemMetrics={metrics}
          onBoost={handleBoost}
          isBoosting={isBoosting}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        <main className="p-8 space-y-8 flex-1 overflow-y-auto">
          {/* Boost Notification Banner */}
          {boostSuccessMsg && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 to-[#12233b] border border-cyber-green text-cyber-green text-xs font-semibold flex items-center gap-3 shadow-neon-cyan animate-fade-in">
              <Zap className="w-4 h-4 text-cyber-green animate-pulse" />
              <span>{boostSuccessMsg}</span>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <>
              {/* TOP ROW: 4 Glowing Circular Gauges (Matching Reference Image) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <CircularGauge
                  percentage={metrics?.system?.healthScore || 95}
                  label="System Health"
                  sublabel="Score"
                  color="#00f5d4"
                  icon={ShieldCheck}
                />
                <CircularGauge
                  percentage={metrics?.cpu?.percent || 0}
                  label="CPU Load"
                  sublabel={`${metrics?.cpu?.cores || 4} Cores`}
                  color="#38bdf8"
                  icon={Cpu}
                />
                <CircularGauge
                  percentage={metrics?.ram?.percent || 0}
                  label="Memory (RAM)"
                  sublabel={metrics?.ram?.formattedUsed || '0 GB'}
                  color="#7c3aed"
                  icon={Database}
                />
                <CircularGauge
                  percentage={metrics?.disk?.percent || 0}
                  label="SSD Storage"
                  sublabel={`${metrics?.disk?.formattedAvail || '0 GB'} Free`}
                  color="#10b981"
                  icon={HardDrive}
                />
              </div>

              {/* MIDDLE ROW: Spline Wave Chart & Quick Telemetry */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <WaveChart history={history} />
                </div>

                {/* Quick Care Actions Card */}
                <div className="p-6 rounded-2xl cyber-card flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="p-1.5 rounded-lg bg-cyber-cyan/10 text-cyber-cyan">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Actions</h4>
                    </div>
                    <p className="text-xs text-cyber-muted">
                      Keep your Linux environment clean and responsive with automated optimization.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      onClick={() => setActiveTab('cleaner')}
                      className="w-full p-3 rounded-xl bg-[#14183d] hover:bg-[#1a2050] border border-[#21295c] hover:border-cyber-cyan/40 text-left flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-cyber-cyan" />
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-cyber-cyan transition-colors">Junk Cleaner</p>
                          <p className="text-[10px] text-cyber-muted">Scan & reclaim SSD gigabytes</p>
                        </div>
                      </div>
                      <span className="text-xs text-cyber-cyan font-mono font-bold">→</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('apps')}
                      className="w-full p-3 rounded-xl bg-[#14183d] hover:bg-[#1a2050] border border-[#21295c] hover:border-cyber-cyan/40 text-left flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Layers className="w-4 h-4 text-cyber-purple" />
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-cyber-purple transition-colors">App Manager</p>
                          <p className="text-[10px] text-cyber-muted">Uninstall APT & Snap packages</p>
                        </div>
                      </div>
                      <span className="text-xs text-cyber-purple font-mono font-bold">→</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: Dual Neon Sliders & Segmented Storage Breakdown */}
              <StorageBar
                diskMetrics={metrics?.disk}
                ramMetrics={metrics?.ram}
                storageBreakdown={storageBreakdown}
              />
            </>
          )}

          {activeTab === 'cleaner' && (
            <CleanerSection
              onCleanupSuccess={() => {
                fetchMetrics();
                fetchStorageBreakdown();
              }}
            />
          )}

          {activeTab === 'apps' && (
            <AppManager />
          )}

          {activeTab === 'telemetry' && (
            <div className="space-y-6">
              <WaveChart history={history} height={200} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl cyber-card space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyber-cyan" />
                    Processor Telemetry
                  </h4>
                  <div className="text-xs space-y-2 text-cyber-muted font-mono">
                    <p className="flex justify-between"><span>Model:</span> <span className="text-white">{metrics?.cpu?.model}</span></p>
                    <p className="flex justify-between"><span>Cores:</span> <span className="text-white">{metrics?.cpu?.cores}</span></p>
                    <p className="flex justify-between"><span>Current Load:</span> <span className="text-cyber-cyan font-bold">{metrics?.cpu?.percent}%</span></p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl cyber-card space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyber-blue" />
                    Memory & Swap Telemetry
                  </h4>
                  <div className="text-xs space-y-2 text-cyber-muted font-mono">
                    <p className="flex justify-between"><span>Total RAM:</span> <span className="text-white">{metrics?.ram?.formattedTotal}</span></p>
                    <p className="flex justify-between"><span>Used RAM:</span> <span className="text-cyber-blue font-bold">{metrics?.ram?.formattedUsed}</span></p>
                    <p className="flex justify-between"><span>Swap Memory:</span> <span className="text-white">{metrics?.ram?.formattedSwapUsed} / {metrics?.ram?.formattedSwapTotal}</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-8 rounded-2xl cyber-card max-w-2xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">About LinuxCare</h3>
                <p className="text-xs text-cyber-muted mt-1">
                  Modern open-source device care and telemetry dashboard for Linux systems.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#1e2554] text-xs font-mono">
                <div className="flex justify-between py-2 border-b border-[#181d45]">
                  <span className="text-cyber-muted">Version:</span>
                  <span className="text-cyber-cyan font-bold">1.0.0-alpha</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#181d45]">
                  <span className="text-cyber-muted">Repository:</span>
                  <span className="text-cyber-blue">https://github.com/emon1432/LinuxCare.git</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#181d45]">
                  <span className="text-cyber-muted">License:</span>
                  <span className="text-white">MIT Open Source</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
