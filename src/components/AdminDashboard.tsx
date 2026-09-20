import { useState, useEffect } from 'react';
import { Shield, Lock, Trash2, RefreshCw, MapPin, Smartphone, Clock, ArrowLeft } from 'lucide-react';
import { getVisitLogs, clearVisitLogs } from '../utils/tracker';
import type { VisitLog } from '../utils/tracker';

const ADMIN_PASSWORD = 'dimpi'; // Change password here if desired

interface AdminDashboardProps {
  onClose: () => void;
}

export function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [logs, setLogs] = useState<VisitLog[]>([]);

  const loadLogs = async () => {
    const data = await getVisitLogs();
    setLogs(data);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadLogs();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect Password. Access Denied.');
    }
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear all visit logs?')) {
      await clearVisitLogs();
      setLogs([]);
    }
  };

  const handleRefresh = () => {
    loadLogs();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b050e] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#160c1c] border border-rose-copper/30 rounded-3xl p-8 shadow-2xl relative text-center">
          <div className="w-16 h-16 rounded-full bg-rose-copper/10 border border-rose-copper/40 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-rose-copper" />
          </div>

          <h2 className="font-editorial text-3xl font-normal text-white mb-2">Admin Access</h2>
          <p className="text-xs text-white/60 font-sans-clean mb-6">
            Enter password to view private visitor logs.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter Admin Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-rose-copper text-center text-sm font-sans-clean"
              autoFocus
            />

            {errorMsg && <p className="text-xs text-rose-500 font-sans-clean">{errorMsg}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-sans-clean text-white/70"
              >
                Back to Site
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-rose-copper text-[#2b0c10] text-xs font-sans-clean font-semibold hover:bg-rose-copper/90"
              >
                Unlock
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b050e] text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-rose-copper" />
              <h1 className="font-editorial text-2xl sm:text-3xl text-white">Visitor Tracker Logs</h1>
            </div>
            <p className="text-xs text-white/60 font-sans-clean">
              Secret dashboard recording visitor timestamps, location, and device details.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-sans-clean flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-rose-copper" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-xl bg-rose-900/40 hover:bg-rose-900/60 border border-rose-500/30 text-xs font-sans-clean text-rose-200 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear Logs</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-rose-copper text-[#2b0c10] font-semibold text-xs font-sans-clean flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/50 font-sans-clean uppercase tracking-wider mb-1">Total Recorded Visits</p>
            <p className="text-3xl font-editorial text-rose-copper">{logs.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/50 font-sans-clean uppercase tracking-wider mb-1">Last Recorded Visit</p>
            <p className="text-sm font-sans-clean text-white truncate">{logs[0]?.timestamp || 'No visits recorded yet'}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/50 font-sans-clean uppercase tracking-wider mb-1">Latest Location</p>
            <p className="text-sm font-sans-clean text-white truncate">
              {logs[0] ? `${logs[0].city}, ${logs[0].country}` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Logs Table / Cards */}
        {logs.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10">
            <Clock className="w-10 h-10 text-white/30 mx-auto mb-3" />
            <p className="text-sm font-sans-clean text-white/70">No visit logs recorded yet.</p>
            <p className="text-xs font-sans-clean text-white/40 mt-1">Logs will automatically appear here when someone opens the website.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-rose-copper/10 border border-rose-copper/30 text-rose-copper shrink-0 mt-0.5 sm:mt-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-sans-clean text-base font-semibold text-white flex flex-wrap items-center gap-2">
                      <span>{log.city}, {log.region}</span>
                      <span className="text-xs font-mono text-rose-copper bg-rose-copper/10 px-2 py-0.5 rounded border border-rose-copper/20">
                        {log.country}
                      </span>
                      {log.accuracyType && (
                        <span className={`text-[10px] font-sans-clean px-2 py-0.5 rounded-full border ${
                          log.accuracyType === 'GPS (Exact)' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}>
                          {log.accuracyType}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-white/60 font-sans-clean mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-white/40" />
                        {log.device}
                      </span>
                      {log.isp && (
                        <>
                          <span>•</span>
                          <span>Network: {log.isp}</span>
                        </>
                      )}
                      {log.ip && (
                        <>
                          <span>•</span>
                          <span>IP: {log.ip}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right sm:self-center">
                  <span className="inline-flex items-center gap-1.5 text-xs text-white/70 font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                    <Clock className="w-3.5 h-3.5 text-rose-copper" />
                    {log.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
