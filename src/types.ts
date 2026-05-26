/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TranscriptSegment {
  id: number;
  seek: number;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
  speaker: string;
  confidence: number;
  words?: WordTimestamp[];
}

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

export interface TranscriptData {
  text: string;
  segments: TranscriptSegment[];
  language: string;
  duration: number; // in seconds
  audioUrl?: string; // Optional URL/Blob URL to original audio file for playback
}

export interface WhisperModel {
  id: string; // 'tiny', 'base', 'small', 'medium', 'large-v3'
  name: string;
  size: string; // e.g. "75 MB"
  ram: string;  // e.g. " ~500 MB"
  vram: string; // e.g. " ~1 GB"
  description: string;
  quantized: boolean;
  status: 'available' | 'downloaded' | 'downloading' | 'not-downloaded';
  progress?: number; // 0 to 100
}

export interface TranscriptionJob {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string; // 'audio' | 'video'
  filePath: string;
  status: 'queued' | 'extracting' | 'transcribing' | 'completed' | 'paused' | 'failed';
  progress: number; // percentage
  speed?: string; // e.g. "3.5x Realtime"
  eta?: string; // e.g. "00:45"
  model: string;
  language: string;
  error?: string;
  transcript?: TranscriptData;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  source: 'FFmpeg' | 'Whisper.cpp' | 'System' | 'GPU';
  type: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface AppSettings {
  modelPath: string;
  threads: number;
  enableGpu: boolean;
  gpuType: 'CUDA' | 'Metal' | 'Vulkan' | 'CPU_ONLY';
  flashAttention: boolean;
  vadThreshold: number; // 0.0 to 1.0 (0 means disabled)
  enableDiarization: boolean;
  diarizationSpeakers: number; // auto = 0
  hotfolderPath: string;
  autoExportFormat: 'none' | 'txt' | 'srt' | 'vtt' | 'json';
  autoExportPath: string;
  engine: 'auto' | 'whispercpp' | 'transformers' | 'gemini';
  transformersDevice: 'webgpu' | 'cpu' | 'wasm';
  transformersQuantized: boolean;
  chunkLength: number;
}
