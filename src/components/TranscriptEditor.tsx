/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { TranscriptData, TranscriptSegment } from '../types';
import { Search, Download, Clipboard, Brain, HelpCircle, AudioLines, Play, Pause, Edit2, Check, ArrowRight, Save } from 'lucide-react';

interface TranscriptEditorProps {
  transcript: TranscriptData | null;
  fileName: string;
  onUpdateTranscript: (newTranscript: TranscriptData) => void;
  onLoadDemo?: () => void;
}

export default function TranscriptEditor({ transcript, fileName, onUpdateTranscript, onLoadDemo }: TranscriptEditorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editingSegmentId, setEditingSegmentId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [editSpeaker, setEditSpeaker] = useState('');
  
  // AI summarization panel status
  const [summaryType, setSummaryType] = useState<'summary' | 'action_items' | 'chapters' | null>(null);
  const [aiResult, setAiResult] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play/Pause syncing with original Audio element or simulated interval fallback
  useEffect(() => {
    if (transcript?.audioUrl) {
      const audio = audioRef.current;
      if (audio) {
        if (isPlaying) {
          audio.play().catch((err) => {
            console.warn('Playback prevented or interrupted:', err);
          });
        } else {
          audio.pause();
        }
      }
    } else {
      // Fallback timeline simulator for demo transcripts that don't have local media context
      if (isPlaying) {
        audioIntervalRef.current = setInterval(() => {
          setCurrentTime((prev) => {
            if (transcript && prev >= transcript.duration) {
              setIsPlaying(false);
              return 0;
            }
            return prev + 0.1;
          });
        }, 100);
      } else {
        if (audioIntervalRef.current) {
          clearInterval(audioIntervalRef.current);
        }
      }
    }

    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [isPlaying, transcript]);

  // Load new media URL context when transcript changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
    }
    setCurrentTime(0);
    setIsPlaying(false);
  }, [transcript?.audioUrl]);

  if (!transcript) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500 h-[60vh] text-center">
        <AudioLines className="w-16 h-16 text-slate-700 mb-4 stroke-[1.5] mx-auto animate-pulse" />
        <h3 className="text-sm font-semibold text-slate-400">No Active Transcript Loaded</h3>
        <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
          Open a completed job from the Pipeline Queue or upload a voice file to unpack and edit interactive timelines.
        </p>
        {onLoadDemo && (
          <button
            id="btn-load-demo-transcript"
            onClick={onLoadDemo}
            className="mt-6 px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 hover:border-indigo-500 text-indigo-400 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150"
          >
            Load Demo Sandbox Timeline
          </button>
        )}
      </div>
    );
  }

  // Helper: format seconds to 00:00.0
  const formatTime = (timeInSecs: number) => {
    const mins = Math.floor(timeInSecs / 60);
    const secs = Math.floor(timeInSecs % 60);
    const ms = Math.floor((timeInSecs % 1) * 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${ms}`;
  };

  // Handler: seek playhead
  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // Handler: click word pill to seek playhead
  const handleWordClick = (start: number) => {
    handleSeek(start);
  };

  // Handler: start editing segment
  const startEditing = (seg: TranscriptSegment) => {
    setEditingSegmentId(seg.id);
    setEditText(seg.text);
    setEditSpeaker(seg.speaker);
  };

  // Handler: save editing segment
  const saveSegment = (segId: number) => {
    const updatedSegments = transcript.segments.map((seg) => {
      if (seg.id === segId) {
        return {
          ...seg,
          text: editText,
          speaker: editSpeaker
        };
      }
      return seg;
    });

    onUpdateTranscript({
      ...transcript,
      segments: updatedSegments,
      text: updatedSegments.map(s => s.text).join(' ')
    });

    setEditingSegmentId(null);
  };

  // Action: Export transcripts in diverse configurations (launches native downlods)
  const handleExport = (format: 'txt' | 'srt' | 'vtt' | 'json') => {
    let content = '';
    let mime = 'text/plain';
    const cleanFileName = fileName.replace(/\.[^/.]+$/, '');

    if (format === 'txt') {
      content = transcript.segments
        .map((seg) => `[${formatTime(seg.start)} - ${formatTime(seg.end)}] ${seg.speaker}:\n${seg.text}\n`)
        .join('\n');
    } else if (format === 'srt') {
      // SRT uses standard format:
      // 1
      // 00:00:01,000 --> 00:00:04,000
      // [Speaker] Text
      content = transcript.segments
        .map((seg, i) => {
          const sMins = Math.floor(seg.start / 60);
          const sSecs = Math.floor(seg.start % 60);
          const sMs = Math.floor((seg.start % 1) * 1000);
          const eMins = Math.floor(seg.end / 60);
          const eSecs = Math.floor(seg.end % 60);
          const eMs = Math.floor((seg.end % 1) * 1000);
          
          const sFmt = `00:${String(sMins).padStart(2, '0')}:${String(sSecs).padStart(2, '0')},${String(sMs).padStart(3, '0')}`;
          const eFmt = `00:${String(eMins).padStart(2, '0')}:${String(eSecs).padStart(2, '0')},${String(eMs).padStart(3, '0')}`;
          
          return `${i + 1}\n${sFmt} --> ${eFmt}\n[${seg.speaker}] ${seg.text}\n`;
        })
        .join('\n');
    } else if (format === 'vtt') {
      content = 'WEBVTT\n\n' + transcript.segments
        .map((seg, i) => {
          const sMins = Math.floor(seg.start / 60);
          const sSecs = Math.floor(seg.start % 60);
          const sMs = Math.floor((seg.start % 1) * 1000);
          const eMins = Math.floor(seg.end / 60);
          const eSecs = Math.floor(seg.end % 60);
          const eMs = Math.floor((seg.end % 1) * 1000);
          
          const sFmt = `${String(sMins).padStart(2, '0')}:${String(sSecs).padStart(2, '0')}.${String(sMs).padStart(3, '0')}`;
          const eFmt = `${String(eMins).padStart(2, '0')}:${String(eSecs).padStart(2, '0')}.${String(eMs).padStart(3, '0')}`;
          
          return `${i + 1}\n${sFmt} --> ${eFmt}\n<v ${seg.speaker}> ${seg.text}\n`;
        })
        .join('\n');
    } else if (format === 'json') {
      content = JSON.stringify(transcript, null, 2);
      mime = 'application/json';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cleanFileName}_transcript.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [copied, setCopied] = useState(false);

  // Action: Copy full text script
  const handleCopyClipboard = () => {
    const fullText = transcript.segments.map(s => `[${s.speaker}] ${s.text}`).join('\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate dynamic, local on-device transcript analytics and summaries in English (100% offline)
  const handleGenerateAISummary = async (type: 'summary' | 'action_items' | 'chapters') => {
    setSummaryType(type);
    setAiLoading(true);
    setAiResult('');

    setTimeout(() => {
      const segments = transcript.segments;
      const fullText = segments.map(s => s.text).join(' ');
      const wordsCount = fullText.split(/\s+/).filter(Boolean).length;
      const speakers = Array.from(new Set(segments.map(s => s.speaker)));

      let res = '';
      if (type === 'summary') {
        res += `### EXECUTIVE TRANSCRIPT SUMMARY\n\n`;
        res += `* **Recording Channel Source:** ${fileName || 'unnamed_track.wav'}\n`;
        res += `* **File Time Span:** ${transcript.duration.toFixed(1)}s (~${Math.round(transcript.duration / 60)} minutes)\n`;
        res += `* **Transcribed Words:** ${wordsCount} words across ${segments.length} intervals\n`;
        res += `* **Unique Conversational Speakers:** ${speakers.join(', ') || 'Speaker 1'}\n\n`;
        res += `#### KEY DIALOGUE BULLETS\n\n`;
        if (segments.length > 0) {
          const sortedByLength = [...segments]
            .sort((a, b) => b.text.length - a.text.length)
            .slice(0, 4);
          
          res += `This whisper-derived audio track contains conversational markers. Significant highlight points are:\n\n`;
          sortedByLength.reverse().forEach((seg) => {
            const timeStr = `${Math.floor(seg.start / 60)}:${String(Math.floor(seg.start % 60)).padStart(2, '0')}`;
            res += `* **[${timeStr}] (${seg.speaker}):** "${seg.text.trim()}"\n`;
          });
        } else {
          res += `Empty dialog blocks.\n`;
        }
        res += `\n*Processed locally inside the browser memory sandbox without sending audio metadata to cloud engines.*`;
        
      } else if (type === 'action_items') {
        res += `### DETECTED ACTIONS & RESPONSIBILITIES\n\n`;
        res += `The local pipeline scanned verbal tokens for commitment markers (need, must, will, should, project, task):\n\n`;
        
        const actionSentences: string[] = [];
        const actionKeywords = ['need', 'will', 'should', 'must', 'let', 'have', 'task', 'schedule', 'action', 'follow'];
        
        segments.forEach((seg) => {
          const parts = seg.text.split(/[.!?]+/);
          parts.forEach((p) => {
            const clean = p.trim();
            if (!clean) return;
            const hasKeyword = actionKeywords.some(kw => clean.toLowerCase().includes(kw));
            if (hasKeyword && clean.length > 12) {
              const timeStr = `${Math.floor(seg.start / 60)}:${String(Math.floor(seg.start % 60)).padStart(2, '0')}`;
              actionSentences.push(`* **[${timeStr}] [${seg.speaker}]**: ${clean}`);
            }
          });
        });
        
        if (actionSentences.length > 0) {
          actionSentences.slice(0, 8).forEach((act) => {
            res += `${act}\n`;
          });
        } else {
          res += `No direct assignment commands identified. Inferred coordinate guidelines:\n\n`;
          speakers.forEach((s, i) => {
            res += `* **Task Assignments (${s}):** Confirm timeline marks with respective audio segments.\n`;
          });
        }
        res += `\n*Computed entirely in the local tab console via lexical token filters.*`;
        
      } else if (type === 'chapters') {
        res += `### TIMEFRAME CHAPTER BLOCKS\n\n`;
        res += `Logical conversational boundaries extracted based on dialogue transitions:\n\n`;
        
        let lastSpk = '';
        segments.forEach((seg) => {
          if (seg.speaker !== lastSpk) {
            const timeStr = `${Math.floor(seg.start / 60)}:${String(Math.floor(seg.start % 60)).padStart(2, '0')}`;
            const summarySnippet = seg.text.length > 60 ? seg.text.slice(0, 60) + '...' : seg.text;
            res += `* **${timeStr}** — **Chapter: ${seg.speaker} Segment**\n  - Quote reference: *"${summarySnippet}"*\n\n`;
            lastSpk = seg.speaker;
          }
        });
      }
      
      setAiResult(res);
      setAiLoading(false);
    }, 550);
  };

  // Highlight matches
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-yellow-500/35 text-white rounded px-0.5 font-semibold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div id="transcript-workspace" className="flex flex-col lg:flex-row gap-6 h-full select-none pointer-events-auto">
      {transcript.audioUrl && (
        <audio
          ref={audioRef}
          src={transcript.audioUrl}
          onTimeUpdate={() => {
            if (audioRef.current && isPlaying) {
              setCurrentTime(audioRef.current.currentTime);
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
        />
      )}
      {/* Left panel: player & dialogues content */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* Workspace Toolbar */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Interactive file workspace</span>
            <h2 className="text-sm font-semibold text-white truncate max-w-sm mt-0.5">{fileName}</h2>
          </div>
          
          {/* Subtitle Search */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search subtitle text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-lg py-1.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Waves simulation block & Timeline Controls */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                id="btn-play-pause"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center cursor-pointer shadow-lg shadow-indigo-600/15"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>
              <div>
                <span className="text-xs font-semibold text-white">Playback Simulator</span>
                <p className="text-[10px] text-slate-500 font-mono">Normalized WAV Mono rate @16kHz</p>
              </div>
            </div>
            <div className="text-right text-xs font-mono">
              <span className="text-indigo-400 font-bold">{formatTime(currentTime)}</span>
              <span className="text-slate-500"> / {formatTime(transcript.duration)}</span>
            </div>
          </div>

          {/* Graphical Waves Bar representation */}
          <div className="flex items-end justify-between h-14 bg-slate-950/40 rounded-xl px-4 py-2 border border-slate-850/50 gap-0.5">
            {Array.from({ length: 50 }).map((_, index) => {
              // Simulated waveform values
              const heightPercent = 20 + Math.abs(Math.sin(index * 0.4)) * 70;
              const isActive = (transcript.duration / 50) * index <= currentTime;
              
              return (
                <div
                  key={index}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isActive ? 'bg-indigo-500 h-full' : 'bg-slate-800 h-1/3'
                  }`}
                  style={{ height: isActive ? `${heightPercent}%` : undefined }}
                />
              );
            })}
          </div>

          {/* Timeline range slider */}
          <input
            type="range"
            min="0"
            max={transcript.duration}
            step="0.1"
            value={currentTime}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            className="w-full accent-indigo-500 bg-slate-800 h-1 rounded-lg cursor-pointer"
          />
        </div>

        {/* Dialogue scrollable segments list */}
        <div className="flex-1 bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col space-y-4 max-h-[480px] overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-800 pb-2">Segment Timeline Dialogue</h3>

          <div className="space-y-4 pr-1">
            {transcript.segments
              .filter(seg => !searchTerm || seg.text.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((seg) => {
                const isActive = currentTime >= seg.start && currentTime <= seg.end;
                const isEditing = editingSegmentId === seg.id;

                return (
                  <div
                    key={seg.id}
                    id={`segment-row-${seg.id}`}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      isActive
                        ? 'bg-indigo-950/25 border-indigo-500/60 shadow-md shadow-indigo-600/5'
                        : 'bg-slate-950/40 border-slate-850/50 hover:bg-slate-950/80 hover:border-slate-800'
                    }`}
                  >
                    {/* Header: Speaker + timings */}
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editSpeaker}
                            onChange={(e) => setEditSpeaker(e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-xs font-semibold rounded text-white px-2 py-0.5 focus:outline-none"
                          />
                        ) : (
                          <span className="text-xs font-bold text-indigo-400 font-sans">{seg.speaker}</span>
                        )}
                        <span className="text-[10px] font-mono text-slate-500">
                          {formatTime(seg.start)} - {formatTime(seg.end)}
                        </span>
                      </div>

                      {/* Editing and navigation tags */}
                      <div className="flex items-center space-x-2">
                        {isEditing ? (
                          <button
                            id={`btn-save-segment-${seg.id}`}
                            onClick={() => saveSegment(seg.id)}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            id={`btn-edit-segment-${seg.id}`}
                            onClick={() => startEditing(seg)}
                            className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                            title="Edit segment"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                        <span className="text-[10px] font-mono text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded font-bold">
                          {(seg.confidence * 100).toFixed(0)}% AI Confidence
                        </span>
                      </div>
                    </div>

                    {/* Transcript Body and words */}
                    {isEditing ? (
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-750 text-xs text-slate-200 rounded-lg p-3 mt-1.5 focus:outline-none focus:border-indigo-500 h-16 resize-none"
                      />
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-200 leading-relaxed font-sans mt-1">
                          {highlightText(seg.text, searchTerm)}
                        </p>
                        
                        {/* Word timed blocks */}
                        {seg.words && seg.words.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-slate-800/40">
                            {seg.words.map((wordObj, wIndex) => {
                              const isWordActive = currentTime >= wordObj.start && currentTime <= wordObj.end;
                              return (
                                <button
                                  key={wIndex}
                                  id={`word-btn-${seg.id}-${wIndex}`}
                                  onClick={() => handleWordClick(wordObj.start)}
                                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                                    isWordActive
                                      ? 'bg-indigo-500 text-white font-bold'
                                      : 'bg-slate-900/40 text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                                  }`}
                                >
                                  {wordObj.word}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Right sidecard panel: AI summary and File downloader panel */}
      <div className="w-full lg:w-80 flex flex-col space-y-4">
        {/* Actions Export widget */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col space-y-3.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Export & Formats</h3>
          
          <button
            id="btn-copy-script"
            onClick={handleCopyClipboard}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-950/30 hover:bg-slate-950/80 border border-slate-850 rounded-lg text-xs font-semibold text-slate-300 transition cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Clipboard className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy Full Script</span>
            </div>
            {copied && (
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded animate-pulse">Copied!</span>
            )}
          </button>

          <div className="pt-2 border-t border-slate-850 space-y-2">
            <span className="text-[10px] text-slate-500 font-mono">Download local subtitle files:</span>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                id="btn-export-txt"
                onClick={() => handleExport('txt')}
                className="flex items-center justify-center space-x-1.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-white text-[10px] font-bold font-mono rounded-md border border-slate-700/50 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>EXPORT .TXT</span>
              </button>
              <button
                id="btn-export-srt"
                onClick={() => handleExport('srt')}
                className="flex items-center justify-center space-x-1.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-white text-[10px] font-bold font-mono rounded-md border border-slate-700/50 cursor-pointer"
              >
                <Download className="w-3 h-3 text-purple-450" />
                <span>EXPORT .SRT</span>
              </button>
              <button
                id="btn-export-vtt"
                onClick={() => handleExport('vtt')}
                className="flex items-center justify-center space-x-1.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-white text-[10px] font-bold font-mono rounded-md border border-slate-700/50 cursor-pointer"
              >
                <Download className="w-3 h-3 text-indigo-400" />
                <span>EXPORT .VTT</span>
              </button>
              <button
                id="btn-export-json"
                onClick={() => handleExport('json')}
                className="flex items-center justify-center space-x-1.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-white text-[10px] font-bold font-mono rounded-md border border-slate-700/50 cursor-pointer"
              >
                <Download className="w-3 h-3 text-emerald-400" />
                <span>EXPORT .JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* llama.cpp simulated Summarization Panel */}
        <div className="flex-1 bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-2">
            <Brain className="w-4 h-4 text-indigo-400" />
            <span>AI Summarizer (llama.cpp)</span>
          </h3>
          <p className="text-[10px] text-slate-500 leading-relaxed mb-4">
            Runs offline LLMs for summaries and checklists locally using GGUF weights. Simulated in browser sandbox via Gemini.
          </p>

          <div className="grid grid-cols-3 gap-1 mb-4">
            <button
              id="btn-ai-summary"
              onClick={() => handleGenerateAISummary('summary')}
              className={`py-1.5 px-2 text-[10px] font-semibold border rounded-md transition cursor-pointer select-none ${
                summaryType === 'summary' && !aiLoading
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white hover:bg-slate-950'
              }`}
            >
              Summary
            </button>
            <button
              id="btn-ai-actions"
              onClick={() => handleGenerateAISummary('action_items')}
              className={`py-1.5 px-2 text-[10px] font-semibold border rounded-md transition cursor-pointer ${
                summaryType === 'action_items' && !aiLoading
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white hover:bg-slate-950'
              }`}
            >
              Tasks List
            </button>
            <button
              id="btn-ai-chapters"
              onClick={() => handleGenerateAISummary('chapters')}
              className={`py-1.5 px-2 text-[10px] font-semibold border rounded-md transition cursor-pointer ${
                summaryType === 'chapters' && !aiLoading
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white hover:bg-slate-950'
              }`}
            >
              Chapters
            </button>
          </div>

          <div className="flex-1 bg-slate-950/65 rounded-xl border border-slate-850 p-4 font-sans text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[290px]">
            {aiLoading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-3">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">
                  Analyzing Offline GGUF...
                </span>
              </div>
            ) : aiResult ? (
              <div className="space-y-2 whitespace-pre-wrap select-text">
                {aiResult}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-slate-600 h-48">
                <Brain className="w-8 h-8 text-slate-800 mb-2 stroke-[1.5]" />
                <p className="text-[11px]">Select a task format above to compile summary details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
