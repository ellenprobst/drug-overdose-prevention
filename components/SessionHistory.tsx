import React, { useState, useEffect } from 'react';
import { History, CheckCircle, AlertTriangle, Calendar, Clock, Pill } from 'lucide-react';
import { SessionRecord } from '../types';

export const SessionHistory: React.FC = () => {
  const [history, setHistory] = useState<SessionRecord[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('haven_session_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
  }, []);

  const stats = {
    total: history.length,
    safe: history.filter(h => h.status === 'SAFE').length,
    alert: history.filter(h => h.status === 'ALERT').length,
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="flex flex-col h-full bg-warm-50">
      {/* Header */}
      <div className="p-6 pt-8 bg-white border-b border-haven-100 sticky top-0 z-10">
        <h1 className="text-2xl font-light text-haven-800">History</h1>
        <p className="text-sm text-haven-500">Your session log</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6">
        
        {/* Stats Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-haven-100 flex justify-between items-center">
            <div className="text-center flex-1 border-r border-haven-50">
                <div className="text-2xl font-light text-haven-800">{stats.total}</div>
                <div className="text-[10px] uppercase tracking-wider text-haven-400 font-bold">Total</div>
            </div>
            <div className="text-center flex-1 border-r border-haven-50">
                <div className="text-2xl font-light text-haven-600">{stats.safe}</div>
                <div className="text-[10px] uppercase tracking-wider text-haven-400 font-bold">Safe</div>
            </div>
            <div className="text-center flex-1">
                <div className="text-2xl font-light text-rose-500">{stats.alert}</div>
                <div className="text-[10px] uppercase tracking-wider text-rose-300 font-bold">Alerts</div>
            </div>
        </div>

        {/* List */}
        <div className="space-y-3">
            <h3 className="text-xs text-haven-400 uppercase tracking-wider font-semibold ml-1">Recent Sessions</h3>
            {history.length === 0 ? (
                <div className="text-center py-12 opacity-50">
                    <History className="mx-auto mb-2" size={32} />
                    <p>No history yet.</p>
                </div>
            ) : (
                history.map((record) => (
                    <div key={record.id} className="bg-white p-4 rounded-2xl shadow-sm border border-haven-100 flex items-start gap-4">
                        <div className={`mt-1 p-2 rounded-full shrink-0 ${
                            record.status === 'SAFE' ? 'bg-haven-50 text-haven-600' : 'bg-rose-50 text-rose-500'
                        }`}>
                            {record.status === 'SAFE' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h4 className={`font-medium ${record.status === 'SAFE' ? 'text-haven-800' : 'text-rose-600'}`}>
                                    {record.status === 'SAFE' ? 'Ended Safely' : 'Alert Triggered'}
                                </h4>
                                <span className="text-xs text-haven-400 font-mono">{formatDuration(record.durationSeconds)}</span>
                            </div>
                            
                            <div className="flex items-center gap-3 mt-1 text-sm text-haven-500">
                                <div className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    <span>{formatDate(record.timestamp)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock size={12} />
                                    <span>{formatTime(record.timestamp)}</span>
                                </div>
                            </div>

                            {record.substance && (
                                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium">
                                    <Pill size={12} />
                                    {record.substance}
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};