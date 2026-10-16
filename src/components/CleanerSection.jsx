import React, { useState, useEffect } from 'react';
import { Trash2, CheckCircle2, AlertCircle, RefreshCw, Sparkles, CheckSquare, Square } from 'lucide-react';

export default function CleanerSection({ onCleanupSuccess }) {
  const [scanData, setScanData] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanResult, setCleanResult] = useState(null);

  const fetchScan = async () => {
    setIsScanning(true);
    setCleanResult(null);
    try {
      const res = await fetch('http://127.0.0.1:4141/api/cleaner/scan');
      const data = await res.json();
      setScanData(data);
      // Pre-select all safe non-empty items
      const preselected = data.items.filter(i => i.bytes > 0).map(i => i.id);
      setSelectedIds(preselected);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    fetchScan();
  }, []);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (!scanData) return;
    if (selectedIds.length === scanData.items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(scanData.items.map(i => i.id));
    }
  };

  const handleClean = async () => {
    if (selectedIds.length === 0) return;
    setIsCleaning(true);
    try {
      const res = await fetch('http://127.0.0.1:4141/api/cleaner/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: selectedIds })
      });
      const data = await res.json();
      setCleanResult({ success: true, count: selectedIds.length });
      if (onCleanupSuccess) onCleanupSuccess();
      // Re-scan after 1 sec
      setTimeout(fetchScan, 1000);
    } catch (e) {
      setCleanResult({ success: false, error: e.message });
    } finally {
      setIsCleaning(false);
    }
  };

  const selectedBytes = scanData?.items
    ?.filter(i => selectedIds.includes(i.id))
    ?.reduce((sum, i) => sum + i.bytes, 0) || 0;

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="p-6 rounded-2xl cyber-card bg-gradient-to-r from-[#14183d] via-[#1b2256] to-[#12163b] border border-[#2a3473] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyber-cyan/10 text-cyber-cyan">
              <Sparkles className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-black text-white tracking-wide font-mono uppercase">
              Smart Junk & Cache Cleaner
            </h3>
          </div>
          <p className="text-sm text-cyber-muted max-w-xl">
            Deep scan browser caches, thumbnail caches, orphan packages, redundant systemd journal logs, and disabled snap duplicates.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchScan}
            disabled={isScanning || isCleaning}
            className="px-4 py-2.5 rounded-xl bg-[#1d2459] hover:bg-[#252e70] text-cyber-cyan text-xs font-bold tracking-wider uppercase flex items-center gap-2 border border-cyber-cyan/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Rescan'}</span>
          </button>

          <button
            onClick={handleClean}
            disabled={selectedIds.length === 0 || isCleaning}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-cyber-blue text-black text-xs font-black tracking-wider uppercase flex items-center gap-2 shadow-neon-cyan transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
          >
            <Trash2 className="w-4 h-4 text-black stroke-[2.5]" />
            <span>{isCleaning ? 'Cleaning Junk...' : `Clean ${formatBytes(selectedBytes)}`}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {cleanResult?.success && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-cyber-green text-cyber-green text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-semibold">
            Awesome! Successfully cleaned {cleanResult.count} selected junk categories and reclaimed disk space.
          </span>
        </div>
      )}

      {/* Cleanable Items Grid */}
      <div className="cyber-card p-6 rounded-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#1f275a] mb-4">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-xs font-semibold text-cyber-cyan hover:text-white transition-colors"
          >
            {scanData && selectedIds.length === scanData.items.length ? (
              <CheckSquare className="w-4 h-4 text-cyber-cyan" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>Select All Categories ({scanData?.items?.length || 0})</span>
          </button>

          <span className="text-xs font-mono text-cyber-muted">
            Total Detected: <strong className="text-white">{scanData?.formattedTotal || '0 B'}</strong>
          </span>
        </div>

        <div className="space-y-2.5">
          {scanData?.items?.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleSelect(item.id)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#18204c] border-cyber-cyan/40 shadow-sm'
                    : 'bg-[#121638] border-[#1d2454] opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'text-cyber-cyan' : 'text-slate-500'}`}>
                    {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white tracking-wide">{item.name}</h5>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-cyber-muted">
                        {item.safe ? 'Safe to remove' : 'Caution'}
                      </span>
                      {item.requiresRoot && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-400 border border-amber-800">
                          Root required
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-sm font-mono font-bold ${item.bytes > 0 ? 'text-cyber-cyan' : 'text-slate-500'}`}>
                    {item.formatted}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
