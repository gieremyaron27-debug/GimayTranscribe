/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutDashboard, FileText, DownloadCloud, Settings, HelpCircle, Cpu, Cpu as MicroIcon, Music } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  queueCount: number;
}

export default function Sidebar({ activeTab, setActiveTab, queueCount }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', name: 'Library & Queue', icon: LayoutDashboard, badge: queueCount > 0 ? queueCount : null },
    { id: 'editor', name: 'Transcript Editor', icon: FileText },
    { id: 'settings', name: 'System Settings', icon: Settings },
  ];

  return (
    <nav id="app-sidebar" className="w-56 bg-slate-900/50 border-r border-slate-800 flex flex-col p-3 gap-1 h-screen text-slate-300 pointer-events-auto select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3 mb-2 select-none">
        <div className="w-8 h-8 bg-indigo-600/90 rounded flex items-center justify-center shadow-md shadow-indigo-500/10">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <polyline points="4 17 10 11 12 13 18 7" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xs font-bold tracking-tight uppercase text-slate-100 flex items-center">
            WhisperLocal
          </h1>
          <span className="text-[9px] font-mono text-slate-500">v1.4.2 PREMIUM</span>
        </div>
      </div>

      {/* Main Navigation Segment */}
      <div className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1.5 tracking-widest mt-1">Main</div>
      
      <div className="space-y-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-btn-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-xs transition-colors duration-150 relative cursor-pointer text-left ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400 font-bold border-l-2 border-indigo-500'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge !== null && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Model Status Segment */}
      <div className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1.5 mt-5 tracking-widest">Local Active Model</div>
      <div className="space-y-1.5 px-2 py-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300 font-medium">Whisper Tiny</span>
          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-semibold uppercase">Loaded</span>
        </div>
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs">Weights cached</span>
          <span className="text-[9px] font-mono">12.4 GB Storage</span>
        </div>
      </div>

      {/* Connection Indicator card in professional design styling */}
      <div className="mt-auto p-4 bg-slate-900 rounded-lg border border-slate-800">
        <div className="text-xs font-semibold mb-1 text-slate-200 flex items-center gap-1.5">
          <MicroIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Offline Engine</span>
        </div>
        <div className="text-[10px] text-slate-500 leading-relaxed mb-3">
          Surgical 4-bit quantization leveraging Apple Metal lanes locally.
        </div>
        <button 
          onClick={() => setActiveTab('settings')}
          className="w-full text-[11px] bg-slate-800 hover:bg-slate-700 py-1.5 rounded transition-colors border border-slate-700 text-slate-300 font-medium cursor-pointer text-center"
        >
          Engine Config
        </button>
      </div>
    </nav>
  );
}

