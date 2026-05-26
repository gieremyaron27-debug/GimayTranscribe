# WhisperOffline: Cross-Platform offline AI Speech-to-Text Desktop Applet

WhisperOffline is a premium, secure, **100% offline local transcription and subtitle editing desktop application** powered by **Electron, React (TypeScript), and whisper.cpp**. It is designed to run completely isolated from cloud networks, ensuring pristine privacy for sensitive audio and video files.

---

## 🎨 System Architecture Overview

```
                          [ ELECTRON DESKTOP FRAMEWATER ]
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼ (IPC bridge)                                                    ▼ (IPC bridge)
┌───────────────────────────────┐                                 ┌──────────────────────────────┐
│       FFmpeg Sidecar          │                                 │     whisper.cpp Engine       │
│ • Local Audio Extraction      │                                 │ • GGML Quantized weights     │
│ • S16LE Mono WAV @ 16kHz      │                                 │ • Multi-threaded GPU inference│
└───────────────────────────────┘                                 └──────────────────────────────┘
                                         ▲
                                         │ (Web Preview Environment Only)
                                         ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│             WEB VIEW SIMULATOR (Vite + Express Proxy to server-side Gemini)                    │
│ • Simulates GPU deallocations, model caches, logs, and queue processing.                       │
│ • Performs live transcriptions of small files using Gemini 3.5 Flash server-side.              │
│ • Includes rich, fully loaded responsive interview templates to interact with out of the box!  │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

*   **Offline First Engine**: Runs fully locally with no network telemetry, SaaS connections, or external API requirements.
*   **GGML Model Manager**: Download and cache Whisper models locally. Switch seamlessly between *Tiny, Base, Small, Medium, and Large-v3* models directly in the interface.
*   **Media Pipeline Extraction**: Drag-and-drop video or audio files directly. A bundler sidecar command using `FFmpeg` automatically extracts and normalizes video tracks to 16kHz mono PCM formats.
*   **Aesthetic Subtitle Editor**: Highlight timed rows, edit speaker designations, and modify paragraphs. Click individual word text pills to jump playback directly to that word’s timestamp.
*   **Search and Highlights**: Live search matches phrases and highlights queries instantly across paragraphs.
*   **Advanced Subtitle Exports**: Single-click downloads for **TXT, SRT, VTT, and JSON** formatting schemas.
*   **VAD & Speaker Diarization**: Filter out silence using voice activity thresholds, and group transcripts by speaker identities automatically.
*   **Local GGUF LLM Summarizer**: Synthesize action items, chapters, and digests offline using llama.cpp (simulated via server-side Gemini in this web preview sandbox).

---

## 📁 Repository Directory Structure

```
├── electron/
│   ├── main.ts            # Native Electron Main Process (executes FFmpeg and Whisper CLI)
│   ├── preload.ts         # Secure contextBridge IPC Channel Interface definitions
│   └── tsconfig.json      # TypeScript compiler specs for Electron targets
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx               # Main side tabs navigation bar
│   │   ├── ModelManager.tsx          # Local GGML model downloads and RAM/VRAM meters
│   │   ├── QueueList.tsx             # Dropzone panel and active batch job lists
│   │   ├── TranscriptEditor.tsx      # Subtitle segment editor, export actions, and AI summaries
│   │   ├── SettingsPanel.tsx         # Thread sliders, GPU toggles, and hardware specs
│   │   ├── PackagingInstructions.tsx # Build scripts and compile configs for multiple OS's
│   │   └── LogView.tsx               # Diagnostic logs terminal console
│   ├── App.tsx            # Primary React Application component (flows and state controls)
│   ├── types.ts           # Shared TypeScript models and interface contracts
│   ├── data.ts            # Const data, preloaded interview templates, packaging guides
│   ├── index.css          # Core styles using Tailwind utility classes
│   └── main.tsx           # React bootstrap entrypoint
├── server.ts              # Express API Server (handles web preview assets and Gemini API proxies)
├── metadata.json          # Google AI Studio configurations
├── package.json           # Packaging dependency list and compiling scripts
└── README.md              # Technical guidelines and user manuals
```

---

## 🛠️ Workstation Compilation Guides

### Prerequisites

You need [Node.js](https://nodejs.org/) (v18+) and [npm](https://www.npmjs.com/) installed. You must also download and place static executable binaries for `ffmpeg` and `whisper-cli` inside your desktop project folder:
*   **Windows**: `bin/win32/ffmpeg.exe` and `bin/win32/whisper-cli.exe`
*   **macOS**: `bin/darwin/ffmpeg` and `bin/darwin/whisper-cli`
*   **Linux**: `bin/linux/ffmpeg` and `bin/linux/whisper-cli`

### Installation

1.  Clone the repository and install all dependencies:
    ```bash
    npm install
    ```
2.  Boot the application locally in development mode:
    ```bash
    # Runs the React frontend and Electron window simultaneously
    npm run electron:dev
    ```

---

## 📦 Creating Desktop Installers

To pack the application into ready-to-test installer bundles for distribution across operating systems, run the platform-specific electron-builder commands:

| Target Platform | Package Format | Build Command | Output Folder |
| :--- | :--- | :--- | :--- |
| **macOS** | `.dmg` (Apple Disk Image) | `npm run dist:mac` | `dist-desktop/` |
| **Windows**| `.exe` (NSIS Installer) | `npm run dist:win` | `dist-desktop/` |
| **Linux**  | `.AppImage` (Universal Linux) | `npm run dist:linux`| `dist-desktop/` |

---

## 🧠 GPU Acceleration & Thread Tuning

Adjust physical allocations inside the **Settings & Debug** panel to optimize inference speeds:
*   **Inference Threads**: Typically, allocate equivalent virtual cores matching your physical CPU performance cores structure (usually 4 to 8 threads).
*   **VAD Threshold**: Adjust Voice Activity Detection bounds. Higher values filter out more background murmurings.
*   **GPU Accelerators**:
    *   **Apple Silicon (M1/M2/M3)**: Metal GPU kernels are executed natively when compiled, utilizing lightning-fast Unified Memory lanes.
    *   **NVIDIA Systems**: CUDA cores are utilized. Make sure CUDA path variables (`CUDA_PATH`) are recognized inside Windows Environment environments.
    *   **Vulkan/OpenCL**: Dynamically fallback for compatible integrated chipsets.
