/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppSettings } from '../types';
import { Settings, Cpu, Database, Save, Sparkles, FolderOpen, RefreshCcw, HelpCircle } from 'lucide-react';

interface SettingsPanelProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  hardwareSpecs: {
    cpus: number;
    cpuModel: string;
    memoryGb: number;
    gpuType: string;
    hasGpu: boolean;
    platform: string;
    arch: string;
  };
}

export default function SettingsPanel({ settings, onSaveSettings, hardwareSpecs }: SettingsPanelProps) {
  const handleToggleGpu = () => {
    onSaveSettings({
      ...settings,
      enableGpu: !settings.enableGpu
    });
  };

  const handleThreadChange = (val: number) => {
    onSaveSettings({
      ...settings,
      threads: val
    });
  };

  const handleInputChange = (field: keyof AppSettings, val: any) => {
    onSaveSettings({
      ...settings,
      [field]: val
    });
  };

  return (
    <div id="settings-view" className="flex flex-col space-y-6 select-none h-full p-1 leading-relaxed">
      {/* Upper header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          <span>Pipeline & Hardware Settings</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Tune whisper.cpp thread allocations, cache locations, and CPU/GPU memory optimizations for seamless offline execution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core settings form block */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 space-y-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800/60">
              Model Paths & Storage
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">GGML Models Local Cache Directory</label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={settings.modelPath}
                      onChange={(e) => handleInputChange('modelPath', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    id="btn-browse-model-path"
                    className="px-3.5 py-2 bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white rounded-lg text-xs font-semibold cursor-pointer"
                    title="Select folder"
                  >
                    Browse
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Default path: Local UserData folder of Electron applet</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Hotfolder Auto-Watch Directory (Optional)</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={settings.hotfolderPath}
                    placeholder="/Users/username/Downloads/transcribe-watch"
                    onChange={(e) => handleInputChange('hotfolderPath', e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    id="btn-browse-hot-path"
                    className="px-3.5 py-2 bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white rounded-lg text-xs font-semibold cursor-pointer text-center"
                  >
                    Browse
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Watches this folder continuously. New audio drops get transcribed instantly.</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 space-y-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800/60 font-sans flex items-center justify-between">
              <span>AI Engine Router</span>
              <span className="text-[10px] font-semibold text-indigo-400 uppercase">Hybrid Pipeline</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Active Transcription Engine</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('engine', 'auto')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer select-none ${
                      settings.engine === 'auto'
                        ? 'bg-indigo-950/20 border-indigo-500/80 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold">Auto Engine Selection</span>
                    <span className="text-[9px] text-slate-400 mt-1">Smart fallbacks based on capabilities & OS platform</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInputChange('engine', 'whispercpp')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer select-none ${
                      settings.engine === 'whispercpp'
                        ? 'bg-indigo-950/20 border-indigo-500/80 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold">whisper.cpp (Native)</span>
                    <span className="text-[9px] text-slate-400 mt-1">Direct GGUF/GGML local thread execution</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInputChange('engine', 'transformers')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer select-none ${
                      settings.engine === 'transformers'
                        ? 'bg-indigo-950/20 border-indigo-500/80 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold">Transformers.js (Browser)</span>
                    <span className="text-[9px] text-slate-400 mt-1">100% on-device WebAssembly and WebGPU inside sandbox</span>
                  </button>
                </div>
              </div>

              {(settings.engine === 'transformers' || settings.engine === 'auto') && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-4">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wide">Browser Runtime Configuration</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Acceleration Backend</label>
                      <select
                        value={settings.transformersDevice}
                        onChange={(e) => handleInputChange('transformersDevice', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                      >
                        <option value="webgpu">WebGPU (Chrome/Edge 113+ Acceleration)</option>
                        <option value="wasm">WebAssembly (Threaded Multicore CPU)</option>
                        <option value="cpu">Basic WebAssembly CPU Fallback</option>
                      </select>
                      <span className="text-[10px] text-slate-500">Enable WebGPU for hardware graphics card compilation speedups.</span>
                    </div>

                    <div className="space-y-1.5 font-sans">
                      <label className="text-xs font-medium text-slate-300">Memory Chunking Size</label>
                      <select
                        value={settings.chunkLength}
                        onChange={(e) => handleInputChange('chunkLength', parseInt(e.target.value, 10))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value={15}>15 Seconds (Stable / Lightweight)</option>
                        <option value={30}>30 Seconds (Recommended Balanced)</option>
                        <option value={60}>60 Seconds (Faster / High RAM)</option>
                      </select>
                      <span className="text-[10px] text-slate-500">Slices audio into sequential loads to prevent 32-bit WASM buffer limits.</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-xs font-bold text-slate-300">Quantized ONNX Weights</span>
                      <p className="text-[10px] text-slate-500">Loads lightweight 4-bit models to conserve IndexedDB storage space.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInputChange('transformersQuantized', !settings.transformersQuantized)}
                      className={`px-4 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition select-none ${
                        settings.transformersQuantized
                          ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      {settings.transformersQuantized ? 'Enabled (Compressed)' : 'Disabled (Full precision)'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 space-y-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800/60 font-sans">
              Inference Parameters Tuning
            </h3>

            <div className="space-y-4">
              {/* Sliders for Cores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="font-semibold text-slate-300">Inference Thread Allocation</label>
                    <span className="text-indigo-400 font-bold">{settings.threads} Threads</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={hardwareSpecs.cpus || 8}
                    step="1"
                    value={settings.threads}
                    onChange={(e) => handleThreadChange(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500">Auto allocated according to physical cores</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="font-semibold text-slate-300">Voice Activity Detection (VAD)</label>
                    <span className="text-indigo-400 font-bold">{settings.vadThreshold > 0 ? `${settings.vadThreshold * 100}%` : 'Disabled'}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.vadThreshold}
                    onChange={(e) => handleInputChange('vadThreshold', parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500">Filters out silent stretches before transcribing to conserve battery</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <button
                  id="toggle-gpu"
                  onClick={handleToggleGpu}
                  className={`p-4 rounded-xl border text-left flex justify-between items-center transition cursor-pointer select-none ${
                    settings.enableGpu
                      ? 'bg-indigo-950/20 border-indigo-500/80 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">GPU Acceleration</span>
                    <p className="text-[10px] text-slate-400 mt-1">Accelerate GGML kernels using Metal or CUDA GPU</p>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded-full ${settings.enableGpu ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                </button>

                <button
                  id="toggle-diarization"
                  onClick={() => handleInputChange('enableDiarization', !settings.enableDiarization)}
                  className={`p-4 rounded-xl border text-left flex justify-between items-center transition cursor-pointer select-none ${
                    settings.enableDiarization
                      ? 'bg-indigo-950/20 border-indigo-500/80 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">Diarization (Speaker Labels)</span>
                    <p className="text-[10px] text-slate-400 mt-1">Group and categorize segments by speaker identities</p>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded-full ${settings.enableDiarization ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hardware diagnostic panel card */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800/60 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Diagnostic specifications</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850 space-y-2">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Active Operating System</span>
                <span className="text-slate-200 font-semibold">{hardwareSpecs.platform} ({hardwareSpecs.arch})</span>
              </div>

              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850 space-y-2">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Physical CPU Core Profile</span>
                <span className="text-slate-200 truncate block">{hardwareSpecs.cpuModel}</span>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>Threads Available:</span>
                  <span>{hardwareSpecs.cpus} Cores</span>
                </div>
              </div>

              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850 space-y-2">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Unified system RAM Capacity</span>
                <span className="text-slate-200 font-semibold">{hardwareSpecs.memoryGb} Gigabytes RAM</span>
              </div>

              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850 space-y-2">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Selected Graphics Card</span>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-400 font-semibold font-sans">{hardwareSpecs.gpuType} Acceleration</span>
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded uppercase">
                    {hardwareSpecs.hasGpu ? 'Online' : 'CPU FALLBACK'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-2xl p-5 text-indigo-300 text-xs space-y-2.5">
            <h4 className="font-semibold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>GPU Multi-threading Optimizations</span>
            </h4>
            <p className="leading-relaxed">
              When GPU mode is active, GGML uses Apple Silicon Metal framework or Nvidia CUDA. Multi-threaded inference ensures that transcription completes up to 12x faster than traditional speech-to-text libraries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
