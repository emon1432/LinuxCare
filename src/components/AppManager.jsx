import React, { useState, useEffect } from 'react';
import { Search, Layers, Trash2, Package, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AppManager() {
  const [apps, setApps] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [uninstallingApp, setUninstallingApp] = useState(null);
  const [actionStatus, setActionStatus] = useState(null);

  const fetchApps = async () => {
    setLoading(true);
    setActionStatus(null);
    try {
      const res = await fetch('http://127.0.0.1:4141/api/apps');
      const data = await res.json();
      setApps(data.apps || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleUninstall = async (app) => {
    if (!window.confirm(`Are you sure you want to uninstall ${app.name}?`)) return;
    setUninstallingApp(app.name);
    try {
      const res = await fetch('http://127.0.0.1:4141/api/apps/uninstall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: app.type,
          snapName: app.snapName,
          pkgName: app.pkgName,
          name: app.name
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionStatus({ success: true, message: data.message });
        fetchApps();
      } else {
        setActionStatus({ success: false, message: data.error || 'Uninstall canceled or failed' });
      }
    } catch (e) {
      setActionStatus({ success: false, message: e.message });
    } finally {
      setUninstallingApp(null);
    }
  };

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) ||
                          app.exec?.toLowerCase().includes(search.toLowerCase());
    if (filterType === 'SNAP') return matchesSearch && app.type === 'Snap';
    if (filterType === 'APT') return matchesSearch && app.type.includes('APT');
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="p-6 rounded-2xl cyber-card flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyber-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search installed applications (e.g. Chrome, VS Code)..."
            className="w-full bg-[#101435] border border-[#212959] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-cyber-muted focus:outline-none focus:border-cyber-cyan transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {['ALL', 'APT', 'SNAP'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
                filterType === type
                  ? 'bg-cyber-cyan text-black shadow-neon-cyan'
                  : 'bg-[#14183d] text-cyber-muted hover:text-white border border-[#212856]'
              }`}
            >
              {type === 'ALL' ? `All (${apps.length})` : type}
            </button>
          ))}

          <button
            onClick={fetchApps}
            disabled={loading}
            className="p-2 rounded-lg bg-[#14183d] text-cyber-muted hover:text-cyber-cyan border border-[#212856] ml-2"
            title="Refresh App List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionStatus && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 animate-fade-in ${
          actionStatus.success
            ? 'bg-emerald-950/60 border-cyber-green text-cyber-green'
            : 'bg-rose-950/60 border-rose-500 text-rose-300'
        }`}>
          {actionStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{actionStatus.message}</span>
        </div>
      )}

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-cyber-muted text-xs font-mono">
            Scanning application repositories and desktop entries...
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="col-span-full py-16 text-center text-cyber-muted text-xs">
            No applications match your search query.
          </div>
        ) : (
          filteredApps.map((app) => (
            <div
              key={app.id}
              className="p-4 rounded-xl cyber-card flex items-center justify-between gap-3 group hover:border-cyber-cyan/40 transition-all"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-[#1a2152] flex items-center justify-center shrink-0 border border-[#27306e] group-hover:border-cyber-cyan/30">
                  <Package className="w-5 h-5 text-cyber-cyan" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-white tracking-wide truncate group-hover:text-cyber-cyan transition-colors">
                    {app.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium ${
                      app.type === 'Snap'
                        ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                        : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
                    }`}>
                      {app.type}
                    </span>
                    {app.version && (
                      <span className="text-[10px] text-cyber-muted truncate font-mono">
                        v{app.version}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleUninstall(app)}
                disabled={uninstallingApp === app.name}
                className="p-2 rounded-lg bg-[#18204d] hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 border border-[#232c66] hover:border-rose-700/60 transition-all shrink-0 active:scale-95 disabled:opacity-40"
                title={`Uninstall ${app.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
