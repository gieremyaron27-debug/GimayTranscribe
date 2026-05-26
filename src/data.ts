/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WhisperModel, AppSettings, TranscriptData, LogEntry } from './types';

export const INITIAL_MODELS: WhisperModel[] = [
  {
    id: 'tiny',
    name: 'Whisper Tiny (Quantized)',
    size: '75 MB',
    ram: ' ~500 MB',
    vram: ' ~1.1 GB',
    description: 'Ultra-fast, lowest memory usage. Perfect for testing and CPU-intensive light systems.',
    quantized: true,
    status: 'downloaded'
  },
  {
    id: 'base',
    name: 'Whisper Base (Recommended for CPU)',
    size: '142 MB',
    ram: ' ~1 GB',
    vram: ' ~1.5 GB',
    description: 'Balanced speed and precision. Exceptionally fast on older hardware.',
    quantized: true,
    status: 'available'
  },
  {
    id: 'small',
    name: 'Whisper Small (Standard)',
    size: '466 MB',
    ram: ' ~2 GB',
    vram: ' ~2.2 GB',
    description: 'High accuracy with reasonable resource footprints. Good for general transcription.',
    quantized: true,
    status: 'available'
  },
  {
    id: 'medium',
    name: 'Whisper Medium (High Fidelity)',
    size: '1.5 GB',
    ram: ' ~5 GB',
    vram: ' ~5.0 GB',
    description: 'Incredible accuracy for compound sentences, dialects, and heavy accents.',
    quantized: true,
    status: 'available'
  },
  {
    id: 'large-v3',
    name: 'Whisper Large v3 (Studio Grade)',
    size: '3.1 GB',
    ram: ' ~8 GB',
    vram: ' ~8.4 GB',
    description: 'Peak AI transcription. Captures low-level murmurs, specialized terminology, and rare languages.',
    quantized: true,
    status: 'not-downloaded'
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  modelPath: 'C:\\Users\\User\\.cache\\whisper\\models',
  threads: 4,
  enableGpu: true,
  gpuType: 'Metal', // Safe default representing typical modern laptop, dynamically updated in frontend logs
  flashAttention: true,
  vadThreshold: 0.5,
  enableDiarization: true,
  diarizationSpeakers: 0, // Auto
  hotfolderPath: '',
  autoExportFormat: 'none',
  autoExportPath: '',
  engine: 'whispercpp',
  transformersDevice: 'webgpu',
  transformersQuantized: true,
  chunkLength: 30
};

// High-fidelity preloaded sample transcript (Meeting Audio)
export const SAMPLE_TRANSCRIPT_1: TranscriptData = {
  duration: 142.5,
  language: 'English',
  text: 'Alright, let\'s get this product sync started. I wanted to review the latest design concepts for our local Whisper app. We need to make sure the user interface communicates that this is a 100% offline, private solution. Julia, any updates on the GPU acceleration and whisper.cpp integration? Yeah, so regarding Whisper.cpp—we have successfully compiled the Metal kernels for macOS and optimized CUDA bindings for Windows. Our local runs have achieved up to 12x transcription speed multipliers on Mac Studio devices. The CPU footprint is down by 45% due to aggressive GGML quantization techniques. That is incredible. Will we be able to run diarization on the client? Yes, we are parsing speaker segments using local energy thresholds and voice pitch clustering. It runs as a sidecar process in Node.js, so the frontend UI stays completely buttery smooth. Excelent work. Let\'s prioritize getting the subtitle formats SRT and VTT exporting correctly for launch.',
  segments: [
    {
      id: 1,
      seek: 0,
      start: 0.0,
      end: 5.4,
      speaker: 'Speaker 1 (Product Manager)',
      confidence: 0.98,
      text: "Alright, let's get this product sync started. I wanted to review the latest design concepts.",
      words: [
        { word: "Alright,", start: 0.0, end: 0.8, confidence: 0.99 },
        { word: "let's", start: 0.8, end: 1.1, confidence: 0.99 },
        { word: "get", start: 1.1, end: 1.3, confidence: 0.98 },
        { word: "this", start: 1.3, end: 1.5, confidence: 0.98 },
        { word: "product", start: 1.5, end: 1.9, confidence: 0.99 },
        { word: "sync", start: 1.9, end: 2.2, confidence: 0.97 },
        { word: "started.", start: 2.2, end: 2.7, confidence: 0.99 },
        { word: "I", start: 2.8, end: 3.1, confidence: 0.99 },
        { word: "wanted", start: 3.1, end: 3.5, confidence: 0.98 },
        { word: "to", start: 3.5, end: 3.7, confidence: 0.99 },
        { word: "review", start: 3.7, end: 4.1, confidence: 0.99 },
        { word: "the", start: 4.1, end: 4.3, confidence: 0.99 },
        { word: "latest", start: 4.3, end: 4.7, confidence: 0.98 },
        { word: "design", start: 4.7, end: 5.1, confidence: 0.99 },
        { word: "concepts.", start: 5.1, end: 5.4, confidence: 0.99 }
      ]
    },
    {
      id: 2,
      seek: 0,
      start: 5.8,
      end: 11.2,
      speaker: 'Speaker 1 (Product Manager)',
      confidence: 0.95,
      text: "We need to make sure the user interface communicates that this is a 100% offline, private solution.",
      words: [
        { word: "We", start: 5.8, end: 6.0, confidence: 0.96 },
        { word: "need", start: 6.0, end: 6.3, confidence: 0.98 },
        { word: "to", start: 6.3, end: 6.5, confidence: 0.99 },
        { word: "make", start: 6.5, end: 6.8, confidence: 0.99 },
        { word: "sure", start: 6.8, end: 7.1, confidence: 0.99 },
        { word: "the", start: 7.1, end: 7.3, confidence: 0.99 },
        { word: "user", start: 7.3, end: 7.6, confidence: 0.97 },
        { word: "interface", start: 7.6, end: 8.1, confidence: 0.98 },
        { word: "communicates", start: 8.1, end: 8.8, confidence: 0.94 },
        { word: "that", start: 8.8, end: 9.0, confidence: 0.99 },
        { word: "this", start: 9.0, end: 9.2, confidence: 0.99 },
        { word: "is", start: 9.2, end: 9.4, confidence: 0.99 },
        { word: "a", start: 9.4, end: 9.5, confidence: 0.99 },
        { word: "100%", start: 9.5, end: 9.9, confidence: 0.99 },
        { word: "offline,", start: 9.9, end: 10.4, confidence: 0.99 },
        { word: "private", start: 10.4, end: 10.8, confidence: 0.98 },
        { word: "solution.", start: 10.8, end: 11.2, confidence: 0.99 }
      ]
    },
    {
      id: 3,
      seek: 0,
      start: 11.6,
      end: 15.9,
      speaker: 'Speaker 1 (Product Manager)',
      confidence: 0.97,
      text: "Julia, any updates on the GPU acceleration and whisper.cpp integration?",
      words: [
        { word: "Julia,", start: 11.6, end: 12.1, confidence: 0.99 },
        { word: "any", start: 12.1, end: 12.4, confidence: 0.98 },
        { word: "updates", start: 12.4, end: 12.9, confidence: 0.99 },
        { word: "on", start: 12.9, end: 13.1, confidence: 0.99 },
        { word: "the", start: 13.1, end: 13.3, confidence: 0.99 },
        { word: "GPU", start: 13.3, end: 13.8, confidence: 0.96 },
        { word: "acceleration", start: 13.8, end: 14.5, confidence: 0.99 },
        { word: "and", start: 14.5, end: 14.7, confidence: 0.99 },
        { word: "whisper.cpp", start: 14.7, end: 15.4, confidence: 0.93 },
        { word: "integration?", start: 15.4, end: 15.9, confidence: 0.98 }
      ]
    },
    {
      id: 4,
      seek: 0,
      start: 16.5,
      end: 22.8,
      speaker: 'Speaker 2 (Lead AI Engineer)',
      confidence: 0.96,
      text: "Yeah, so regarding Whisper.cpp—we have successfully compiled the Metal kernels for macOS...",
      words: [
        { word: "Yeah,", start: 16.5, end: 16.9, confidence: 0.97 },
        { word: "so", start: 16.9, end: 17.1, confidence: 0.99 },
        { word: "regarding", start: 17.1, end: 17.6, confidence: 0.98 },
        { word: "Whisper.cpp—", start: 17.6, end: 18.3, confidence: 0.94 },
        { word: "we", start: 18.3, end: 18.5, confidence: 0.99 },
        { word: "have", start: 18.5, end: 18.7, confidence: 0.99 },
        { word: "successfully", start: 18.7, end: 19.3, confidence: 0.99 },
        { word: "compiled", start: 19.3, end: 19.8, confidence: 0.98 },
        { word: "the", start: 19.8, end: 20.0, confidence: 0.99 },
        { word: "Metal", start: 20.0, end: 20.4, confidence: 0.99 },
        { word: "kernels", start: 20.4, end: 20.9, confidence: 0.98 },
        { word: "for", start: 20.9, end: 21.1, confidence: 0.99 },
        { word: "macOS", start: 21.1, end: 21.7, confidence: 0.99 },
        { word: "optimized", start: 21.7, end: 22.2, confidence: 0.91 },
        { word: "CUDA", start: 22.2, end: 22.5, confidence: 0.99 },
        { word: "bindings", start: 22.5, end: 22.8, confidence: 0.97 }
      ]
    },
    {
      id: 5,
      seek: 0,
      start: 22.9,
      end: 28.5,
      speaker: 'Speaker 2 (Lead AI Engineer)',
      confidence: 0.94,
      text: "Our local runs have achieved up to 12x transcription speed multipliers on Mac Studio devices.",
      words: [
        { word: "Our", start: 22.9, end: 23.2, confidence: 0.95 },
        { word: "local", start: 23.2, end: 23.5, confidence: 0.98 },
        { word: "runs", start: 23.5, end: 23.8, confidence: 0.99 },
        { word: "have", start: 23.8, end: 24.0, confidence: 0.99 },
        { word: "achieved", start: 24.0, end: 24.4, confidence: 0.99 },
        { word: "up", start: 24.4, end: 24.6, confidence: 0.99 },
        { word: "to", start: 24.6, end: 24.8, confidence: 0.99 },
        { word: "12x", start: 24.8, end: 25.3, confidence: 0.97 },
        { word: "transcription", start: 25.3, end: 26.1, confidence: 0.99 },
        { word: "speed", start: 26.1, end: 26.4, confidence: 0.99 },
        { word: "multipliers", start: 26.4, end: 27.1, confidence: 0.92 },
        { word: "on", start: 27.1, end: 27.3, confidence: 0.99 },
        { word: "Mac", start: 27.3, end: 27.6, confidence: 0.99 },
        { word: "Studio", start: 27.6, end: 28.1, confidence: 0.99 },
        { word: "devices.", start: 28.1, end: 28.5, confidence: 0.99 }
      ]
    },
    {
      id: 6,
      seek: 0,
      start: 28.6,
      end: 33.1,
      speaker: 'Speaker 2 (Lead AI Engineer)',
      confidence: 0.97,
      text: "The CPU footprint is down by 45% due to aggressive GGML quantization techniques.",
      words: [
        { word: "The", start: 28.6, end: 28.8, confidence: 0.99 },
        { word: "CPU", start: 28.8, end: 29.2, confidence: 0.99 },
        { word: "footprint", start: 29.2, end: 29.8, confidence: 0.99 },
        { word: "is", start: 29.8, end: 30.0, confidence: 0.99 },
        { word: "down", start: 30.0, end: 30.3, confidence: 0.99 },
        { word: "by", start: 30.3, end: 30.5, confidence: 0.99 },
        { word: "45%", start: 30.5, end: 31.1, confidence: 0.99 },
        { word: "due", start: 31.1, end: 31.3, confidence: 0.99 },
        { word: "to", start: 31.3, end: 31.5, confidence: 0.99 },
        { word: "aggressive", start: 31.5, end: 32.1, confidence: 0.98 },
        { word: "GGML", start: 32.1, end: 32.5, confidence: 0.94 },
        { word: "quantization", start: 32.5, end: 33.1, confidence: 0.98 },
        { word: "techniques.", start: 33.1, end: 33.1, confidence: 0.99 }
      ]
    },
    {
      id: 7,
      seek: 0,
      start: 33.5,
      end: 36.4,
      speaker: 'Speaker 1 (Product Manager)',
      confidence: 0.99,
      text: "That is incredible. Will we be able to run diarization on the client?",
      words: [
        { word: "That", start: 33.5, end: 33.8, confidence: 0.99 },
        { word: "is", start: 33.8, end: 34.0, confidence: 0.99 },
        { word: "incredible.", start: 34.0, end: 34.5, confidence: 0.99 },
        { word: "Will", start: 34.6, end: 34.9, confidence: 0.99 },
        { word: "we", start: 34.9, end: 35.1, confidence: 0.99 },
        { word: "be", start: 35.1, end: 35.3, confidence: 0.99 },
        { word: "able", start: 35.3, end: 35.5, confidence: 0.99 },
        { word: "to", start: 35.5, end: 35.7, confidence: 0.99 },
        { word: "run", start: 35.7, end: 35.9, confidence: 0.99 },
        { word: "diarization", start: 35.9, end: 36.2, confidence: 0.98 },
        { word: "on", start: 36.2, end: 36.3, confidence: 0.99 },
        { word: "the", start: 36.3, end: 36.4, confidence: 0.99 },
        { word: "client?", start: 36.4, end: 36.4, confidence: 0.99 }
      ]
    },
    {
      id: 8,
      seek: 0,
      start: 37.0,
      end: 42.8,
      speaker: 'Speaker 2 (Lead AI Engineer)',
      confidence: 0.95,
      text: "Yes, we are parsing speaker segments using local energy thresholds and pitch clustering.",
      words: [
        { word: "Yes,", start: 37.0, end: 37.5, confidence: 0.99 },
        { word: "we", start: 37.5, end: 37.7, confidence: 0.99 },
        { word: "are", start: 37.7, end: 37.9, confidence: 0.99 },
        { word: "parsing", start: 37.9, end: 38.3, confidence: 0.98 },
        { word: "speaker", start: 38.3, end: 38.7, confidence: 0.98 },
        { word: "segments", start: 38.7, end: 39.2, confidence: 0.99 },
        { word: "using", start: 39.2, end: 39.5, confidence: 0.99 },
        { word: "local", start: 39.5, end: 39.8, confidence: 0.99 },
        { word: "energy", start: 39.8, end: 40.2, confidence: 0.97 },
        { word: "thresholds", start: 40.2, end: 40.7, confidence: 0.98 },
        { word: "and", start: 40.7, end: 40.9, confidence: 0.99 },
        { word: "pitch", start: 40.9, end: 41.3, confidence: 0.92 },
        { word: "clustering.", start: 41.3, end: 42.8, confidence: 0.96 }
      ]
    },
    {
      id: 9,
      seek: 0,
      start: 43.0,
      end: 46.8,
      speaker: 'Speaker 2 (Lead AI Engineer)',
      confidence: 0.94,
      text: "It runs as a sidecar process in Node.js, so the frontend UI stays completely buttery smooth.",
      words: [
        { word: "It", start: 43.0, end: 43.2, confidence: 0.99 },
        { word: "runs", start: 43.2, end: 43.5, confidence: 0.99 },
        { word: "as", start: 43.5, end: 43.7, confidence: 0.99 },
        { word: "a", start: 43.7, end: 43.8, confidence: 0.99 },
        { word: "sidecar", start: 43.8, end: 44.3, confidence: 0.91 },
        { word: "process", start: 44.3, end: 44.7, confidence: 0.99 },
        { word: "in", start: 44.7, end: 44.9, confidence: 0.99 },
        { word: "Node.js,", start: 44.9, end: 45.4, confidence: 0.96 },
        { word: "so", start: 45.4, end: 45.6, confidence: 0.99 },
        { word: "the", start: 45.6, end: 45.8, confidence: 0.99 },
        { word: "frontend", start: 45.8, end: 46.2, confidence: 0.99 },
        { word: "UI", start: 46.2, end: 46.4, confidence: 0.99 },
        { word: "stays", start: 46.4, end: 46.8, confidence: 0.98 },
        { word: "completely", start: 46.8, end: 47.1, confidence: 0.99 },
        { word: "buttery", start: 47.1, end: 47.5, confidence: 0.95 },
        { word: "smooth.", start: 47.5, end: 47.8, confidence: 0.99 }
      ]
    },
    {
      id: 10,
      seek: 0,
      start: 47.5,
      end: 52.8,
      speaker: 'Speaker 1 (Product Manager)',
      confidence: 0.98,
      text: "Excellent work. Let's prioritize getting the subtitle formats SRT and VTT exporting correctly for launch.",
      words: [
        { word: "Excellent", start: 47.5, end: 48.0, confidence: 0.99 },
        { word: "work.", start: 48.0, end: 48.3, confidence: 0.99 },
        { word: "Let's", start: 48.4, end: 48.7, confidence: 0.99 },
        { word: "prioritize", start: 48.7, end: 49.3, confidence: 0.98 },
        { word: "getting", start: 49.3, end: 49.6, confidence: 0.99 },
        { word: "the", start: 49.6, end: 49.8, confidence: 0.99 },
        { word: "subtitle", start: 49.8, end: 50.3, confidence: 0.99 },
        { word: "formats", start: 50.3, end: 50.7, confidence: 0.99 },
        { word: "SRT", start: 50.7, end: 51.1, confidence: 0.97 },
        { word: "and", start: 51.1, end: 51.3, confidence: 0.99 },
        { word: "VTT", start: 51.3, end: 51.7, confidence: 0.96 },
        { word: "exporting", start: 51.7, end: 52.2, confidence: 0.99 },
        { word: "correctly", start: 52.2, end: 52.6, confidence: 0.99 },
        { word: "for", start: 52.6, end: 52.7, confidence: 0.99 },
        { word: "launch.", start: 52.7, end: 52.8, confidence: 0.99 }
      ]
    }
  ]
};

// Realistic engine logs for Whisper.cpp initialization and transcription
export const SAMPLE_LOGS: LogEntry[] = [
  {
    id: 'log-1',
    timestamp: '06:23:40',
    source: 'System',
    type: 'info',
    message: 'Initializing Offline Whisper Audio/Video Pipeline...'
  },
  {
    id: 'log-2',
    timestamp: '06:23:40',
    source: 'GPU',
    type: 'success',
    message: 'Enabling local hardware acceleration: Apple Metal API detected & verified successfully'
  },
  {
    id: 'log-3',
    timestamp: '06:23:41',
    source: 'GPU',
    type: 'info',
    message: 'GGML Apple Silicon Metal backend initialized: unified memory pool sized at 16.0 GB RAM'
  },
  {
    id: 'log-4',
    timestamp: '06:23:41',
    source: 'System',
    type: 'info',
    message: 'Whisper local model cache folder resolved at path: /Users/user/.cache/whisper/models'
  },
  {
    id: 'log-5',
    timestamp: '06:23:41',
    source: 'Whisper.cpp',
    type: 'info',
    message: 'Loading quantized GGML model file: ggml-base-q5_1.bin (Size: 142 Megabytes)'
  },
  {
    id: 'log-6',
    timestamp: '06:23:42',
    source: 'Whisper.cpp',
    type: 'success',
    message: 'Whisper model base-q5_1 loaded. magic=0x67676d6c, vocabSize=51864, n_text_state=512, n_text_head=8'
  },
  {
    id: 'log-7',
    timestamp: '06:23:42',
    source: 'System',
    type: 'info',
    message: 'Offline audio watches active. Drag high-definition media files over app frames to queue transcription'
  }
];

// Packaging Instructions metadata
export const PACKAGING_GUIDES = {
  windows: {
    title: 'Windows Packaging Config (.exe)',
    description: 'Build native Windows double-clickable setup installers bundled with full offline dependencies, including static whisper.cpp binaries and FFmpeg.',
    cli: 'npm run dist:win',
    configFile: `// electron-builder.json5
{
  "appId": "com.whisper.offline.transcribe",
  "productName": "WhisperOffline",
  "directories": {
    "output": "dist-desktop"
  },
  "win": {
    "target": ["nsis"],
    "icon": "assets/icon.ico",
    "requestedExecutionLevel": "asInvoker"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": "always",
    "createStartMenuShortcut": true,
    "shortcutName": "Whisper Offline AI"
  },
  "extraResources": [
    {
      "from": "bin/win32/ffmpeg.exe",
      "to": "bin/ffmpeg.exe"
    },
    {
      "from": "bin/win32/whisper-cli.exe",
      "to": "bin/whisper-cli.exe"
    }
  ]
}`
  },
  mac: {
    title: 'macOS Packaging Config (.dmg)',
    description: 'Build premium Apple-signed disk images supporting both hardware-accelerated Apple Silicon ARM64 chips (Metal GPU) and Intel Core chips x64.',
    cli: 'npm run dist:mac',
    configFile: `// electron-builder.json5
{
  "appId": "com.whisper.offline.transcribe",
  "productName": "WhisperOffline",
  "directories": {
    "output": "dist-desktop"
  },
  "mac": {
    "target": ["dmg", "zip"],
    "icon": "assets/icon.icns",
    "category": "public.app-category.productivity",
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "build/entitlements.mac.plist",
    "entitlementsInherit": "build/entitlements.mac.inherit.plist"
  },
  "dmg": {
    "background": "assets/dmg-background.png",
    "iconSize": 120,
    "contents": [
      {
        "x": 440,
        "y": 240,
        "type": "link",
        "path": "/Applications"
      },
      {
        "x": 160,
        "y": 240,
        "type": "file"
      }
    ]
  },
  "extraResources": [
    {
      "from": "bin/darwin/ffmpeg",
      "to": "bin/ffmpeg"
    },
    {
      "from": "bin/darwin/whisper-cli",
      "to": "bin/whisper-cli"
    }
  ]
}`
  },
  linux: {
    title: 'Linux AppImage Configurations',
    description: 'Distribute universal Linux single-binary packages compiling automatically against static whisper.cpp bindings, optimizing Vulkan hooks.',
    cli: 'npm run dist:linux',
    configFile: `// electron-builder.json5
{
  "appId": "com.whisper.offline.transcribe",
  "productName": "WhisperOffline",
  "directories": {
    "output": "dist-desktop"
  },
  "linux": {
    "target": ["AppImage", "deb", "rpm"],
    "icon": "assets/icons",
    "category": "Office;Utility;"
  },
  "extraResources": [
    {
      "from": "bin/linux/ffmpeg",
      "to": "bin/ffmpeg"
    },
    {
      "from": "bin/linux/whisper-cli",
      "to": "bin/whisper-cli"
    }
  ]
}`
  }
};
