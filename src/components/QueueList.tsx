/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { TranscriptionJob } from '../types';
import { UploadCloud, Film, Play, Pause, X, AlertCircle, RefreshCw, FileAudio, ChevronDown } from 'lucide-react';

interface QueueListProps {
  jobs: TranscriptionJob[];
  onAddJob: (file: File) => void;
  onPauseJob: (jobId: string) => void;
  onResumeJob: (jobId: string) => void;
  onCancelJob: (jobId: string) => void;
  activeModelName: string;
}

export default function QueueList({ jobs, onAddJob, onPauseJob, onResumeJob, onCancelJob, activeModelName }: QueueListProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files) as File[];
      // Validate extensions
      const allowedExts = ['mp3', 'wav', 'm4a', 'flac', 'mp4', 'mkv', 'mov'];
      droppedFiles.forEach(file => {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        if (allowedExts.includes(ext)) {
          onAddJob(file);
        } else {
          alert(`Unsupported file format: .${ext}. Please use MP3, WAV, M4A, FLAC, MP4, MKV, or MOV.`);
        }
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      (Array.from(e.target.files) as File[]).forEach(file => {
        onAddJob(file);
      });
    }
  };

  return (
    <div id="queue-list-container" className="flex flex-col space-y-6 select-none h-full">
      {/* File Dropper Zone */}
      <div
        id="file-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group ${
          isDragging
            ? 'border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-500/5'
            : 'border-slate-800 bg-slate-900/50 hover:border-slate-700/80 hover:bg-slate-900'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept=".mp3,.wav,.m4a,.flac,.mp4,.mkv,.mov"
          className="hidden"
        />
        
        <div className="w-14 h-14 rounded-full bg-slate-800/80 flex items-center justify-center group-hover:bg-indigo-600/10 group-hover:border-indigo-500/20 border border-transparent transition-all duration-300">
          <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-indigo-400" />
        </div>
        
        <h3 className="text-sm font-semibold text-slate-200 mt-4 group-hover:text-white transition-colors">
          Drag & Drop Media Files
        </h3>
        <p className="text-slate-400 text-xs mt-1.5 max-w-md">
          Supports <span className="text-indigo-400 font-medium">MP3, WAV, M4A, FLAC, MP4, MKV, MOV</span>. Videos are normalized automatically using a local FFmpeg compiler.
        </p>
        <div className="flex items-center space-x-2 mt-4 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/40">
          <span className="text-[10px] font-mono text-slate-500">Active Pipeline Model:</span>
          <span className="text-[10px] font-mono text-indigo-400 font-semibold uppercase">{activeModelName}</span>
        </div>
      </div>

      {/* Batch Queues Section */}
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">Batch queue listing</h3>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
              {jobs.length} Job{jobs.length === 1 ? '' : 's'}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">Auto Language Detection: Enabled</span>
        </div>

        {jobs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-500">
            <p className="text-sm">No transcription jobs queued in the offline pipeline</p>
            <p className="text-[11px] text-slate-600 mt-1">Drag & drop media files or click the dropzone above to begin</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {jobs.map((job) => {
              const isComp = job.status === 'completed';
              const isExec = job.status === 'transcribing' || job.status === 'extracting';
              
              return (
                <div
                  key={job.id}
                  id={`job-row-${job.id}`}
                  className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-slate-900/80"
                >
                  {/* File Metadata */}
                  <div className="flex items-center space-x-3.5 min-w-[320px] max-w-md truncate">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                      {job.fileType === 'video' ? (
                        <Film className="w-5 h-5 text-purple-400" />
                      ) : (
                        <FileAudio className="w-5 h-5 text-indigo-400" />
                      )}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-white truncate">{job.fileName}</p>
                      <div className="flex items-center space-x-2 mt-1 text-[10px] font-mono text-slate-500">
                        <span>{job.fileSize}</span>
                        <span>•</span>
                        <span className="uppercase">{job.fileType}</span>
                        <span>•</span>
                        <span>Model: {job.model}</span>
                      </div>
                      {job.status === 'failed' && job.error && (
                        <p className="text-[10px] text-rose-400 mt-1.5 font-sans leading-relaxed break-words max-w-[280px] md:max-w-xs">
                          Error: {job.error}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress Indicators */}
                  <div className="flex-1 max-w-sm space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className={`font-semibold uppercase tracking-wider ${
                        job.status === 'completed' ? 'text-emerald-400' :
                        job.status === 'paused' ? 'text-amber-400' :
                        job.status === 'failed' ? 'text-rose-400' : 'text-indigo-400'
                      }`}>
                        {job.status === 'extracting' ? 'Extracting WAV Audio...' : job.status}
                      </span>
                      {isExec && (
                        <span className="text-slate-400">
                          {job.speed && `${job.speed} • `}ETA {job.eta || '--:--'}
                        </span>
                      )}
                    </div>
                    
                    {/* Progress Slider */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          job.status === 'completed' ? 'bg-emerald-500' :
                          job.status === 'paused' ? 'bg-amber-500' :
                          job.status === 'failed' ? 'bg-rose-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions Tools */}
                  <div className="flex items-center space-x-2.5">
                    {job.status === 'transcribing' && (
                      <button
                        id={`btn-pause-${job.id}`}
                        onClick={() => onPauseJob(job.id)}
                        className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                        title="Pause local process"
                      >
                        <Pause className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {job.status === 'paused' && (
                      <button
                        id={`btn-resume-${job.id}`}
                        onClick={() => onResumeJob(job.id)}
                        className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                        title="Resume local process"
                      >
                        <Play className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                    )}
                    
                    {!isComp && job.status !== 'failed' && (
                      <button
                        id={`btn-cancel-${job.id}`}
                        onClick={() => onCancelJob(job.id)}
                        className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer"
                        title="Abort job"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isComp && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md font-bold uppercase select-none">
                        Completed
                      </span>
                    )}

                    {job.status === 'failed' && (
                      <div className="flex items-center space-x-1.5 text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md text-[10px] font-bold font-mono">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>FAILED</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
