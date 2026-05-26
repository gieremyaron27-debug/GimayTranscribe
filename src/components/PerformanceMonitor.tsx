/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Cpu, Zap, Database, Clock, Gauge, Compass } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PerformanceMonitorProps {
  cpuLoad: number; 
  gpuUsage: number; 
  ramUsedGb: number; 
  ramTotalGb: number;
  engineMode: 'whisper.cpp (Native)' | 'Transformers.js (Browser)';
  modelLoadTime: number; 
  transcribeSpeed: string; 
  activeBackend: string; 
  isTranscribing: boolean;
}

export default function PerformanceMonitor({
  cpuLoad,
  gpuUsage,
  ramUsedGb,
  ramTotalGb,
  engineMode,
  modelLoadTime,
  transcribeSpeed,
  activeBackend,
  isTranscribing
}: PerformanceMonitorProps) {
  const [animatedCpu, setAnimatedCpu] = useState(cpuLoad);
  const [animatedGpu, setAnimatedGpu] = useState(gpuUsage);

  // Realistic load simulation pattern during active runs
  useEffect(() => {
    if (!isTranscribing) {
      setAnimatedCpu(Math.max(1, Math.min(5, cpuLoad + Math.floor(Math.random() * 2))));
      setAnimatedGpu(0);
      return;
    }

    const interval = setInterval(() => {
      setAnimatedCpu(Math.max(52, Math.min(84, cpuLoad + Math.floor(Math.random() * 10 - 5))));
      setAnimatedGpu(Math.max(48, Math.min(78, gpuUsage + Math.floor(Math.random() * 8 - 4))));
    }, 800);

    return () => clearInterval(interval);
  }, [isTranscribing, cpuLoad, gpuUsage]);

  const cpuPercent = isTranscribing ? animatedCpu : cpuLoad;
  const gpuPercent = isTranscribing ? animatedGpu : gpuUsage;

  return (
    <div id="perf-monitor-panel" className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4 select-none">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Gauge className="w-4 h-4 text-indigo-400" />
          <span>Hardware Telemetry</span>
        </h3>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
          isTranscribing 
            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono' 
            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono'
        }`}>
          {isTranscribing ? 'ENGINE TRANSCRIBING' : 'READY / IDLE'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850 space-y-1">
          <span className="text-[10px] text-slate-500 block font-sans">ACTIVE RUNTIME</span>
          <span className="text-white font-semibold truncate block text-[11px]">{engineMode}</span>
        </div>
        <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850 space-y-1">
          <span className="text-[10px] text-slate-500 block font-sans">ACCELERATION</span>
          <span className="text-indigo-400 font-semibold uppercase">{activeBackend}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* CPU */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5 font-sans">
              <Cpu className="w-3.5 h-3.5 text-indigo-400/80" />
              CPU Core Load
            </span>
            <span className="text-slate-200">{cpuPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
            <div
              className={`h-full transition-all duration-500 ${
                cpuPercent > 75 ? 'bg-red-500' : cpuPercent > 45 ? 'bg-amber-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${cpuPercent}%` }}
            />
          </div>
        </div>

        {/* GPU */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5 font-sans">
              <Zap className="w-3.5 h-3.5 text-indigo-400/80" />
              GPU Shader Utilization
            </span>
            <span className="text-slate-200">{gpuPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
            <div
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${gpuPercent}%` }}
            />
          </div>
        </div>

        {/* RAM */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5 font-sans">
              <Database className="w-3.5 h-3.5 text-indigo-400/80" />
              Dynamic Heap (RAM)
            </span>
            <span className="text-slate-400">{ramUsedGb.toFixed(2)} GB / {ramTotalGb} GB</span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (ramUsedGb / ramTotalGb) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3 text-[11px] border-t border-slate-800/60 font-sans">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-500 uppercase leading-none font-semibold">Model Load Time</span>
            <span className="text-slate-300 font-mono mt-0.5">{modelLoadTime > 0 ? `${(modelLoadTime / 1000).toFixed(1)}s` : 'Instant (Cached)'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-emerald-500" />
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-500 uppercase leading-none font-semibold">Inference Speed</span>
            <span className="text-slate-300 font-mono mt-0.5">{transcribeSpeed}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
