/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LogEntry } from '../types';
import { Terminal, RefreshCw, Trash2 } from 'lucide-react';

interface LogViewProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export default function LogView({ logs, onClearLogs }: LogViewProps) {
  return (
    <div id="diagnostic-terminal" className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col space-y-3.5 h-[340px] font-mono leading-relaxed select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-sans">Local Pipeline Diagnostic Logs</h3>
        </div>
        <button
          id="btn-clear-logs"
          onClick={onClearLogs}
          className="text-slate-500 hover:text-slate-300 transition p-1 cursor-pointer"
          title="Flush console log buffer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 text-[11px] pr-1 select-text scrollbar-thin">
        {logs.map((log) => {
          let sourceColor = 'text-slate-500';
          if (log.source === 'FFmpeg') sourceColor = 'text-purple-400';
          if (log.source === 'Whisper.cpp') sourceColor = 'text-indigo-400';
          if (log.source === 'GPU') sourceColor = 'text-amber-400';

          let typeColor = 'text-slate-300';
          if (log.type === 'success') typeColor = 'text-emerald-400';
          if (log.type === 'warn') typeColor = 'text-amber-400';
          if (log.type === 'error') typeColor = 'text-rose-450';

          return (
            <div key={log.id} id={`log-item-${log.id}`} className="hover:bg-slate-900/40 py-0.5 px-1 rounded transition">
              <span className="text-slate-600 mr-2">[{log.timestamp}]</span>
              <span className={`font-semibold uppercase tracking-wide mr-2 ${sourceColor}`}>[${log.source}]</span>
              <span className={typeColor}>{log.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
