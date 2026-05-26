/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import * as os from 'os';
import * as https from 'https';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f172a', // Tailwind slate-900
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Helper: Ensure directory exists
function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ----------------------------------------------------
// IPC Event Handlers (Local Pipeline Execution)
// ----------------------------------------------------

// 1. Fetch Local Hardware Configuration Specs
ipcMain.handle('get-hardware-specs', async () => {
  const cpus = os.cpus();
  const memoryGb = Math.round(os.totalmem() / (1024 * 1024 * 1024));
  const arch = os.arch();
  const platform = os.platform();

  let gpuType = 'CPU_ONLY';
  let hasGpu = false;

  if (platform === 'darwin') {
    // Check for Apple Silicon for Metal Acceleration
    const isAppleSilicon = arch === 'arm64';
    gpuType = isAppleSilicon ? 'Metal' : 'CPU_ONLY';
    hasGpu = isAppleSilicon;
  } else if (platform === 'win32') {
    // Check for CUDA SDK environments or environment variables
    const hasCuda = !!process.env.CUDA_PATH || !!process.env.CUDA_PATH_V11_0 || !!process.env.CUDA_PATH_V12_0;
    gpuType = hasCuda ? 'CUDA' : 'CPU_ONLY';
    hasGpu = hasCuda;
  } else if (platform === 'linux') {
    // Check for Vulkan graphics controllers or Nvidia drivers
    const hasNvidia = fs.existsSync('/proc/driver/nvidia/version');
    gpuType = hasNvidia ? 'CUDA' : 'Vulkan';
    hasGpu = hasNvidia;
  }

  return {
    cpus: cpus.length,
    cpuModel: cpus[0]?.model || 'Unknown CPU',
    memoryGb,
    platform,
    arch,
    gpuType,
    hasGpu
  };
});

// 2. Offline WAV Audio Extraction using bundled FFmpeg
ipcMain.handle('extract-audio', async (_, { inputPath, outputPath }) => {
  return new Promise((resolve, reject) => {
    ensureDir(path.dirname(outputPath));

    // Resolve bundled static FFmpeg binary based on Electron runtime packaging variables
    const isPackaged = app.isPackaged;
    const resourcesPath = isPackaged ? process.resourcesPath : path.join(__dirname, '..');
    
    let ffmpegName = 'ffmpeg';
    if (os.platform() === 'win32') {
      ffmpegName = 'ffmpeg.exe';
    }
    
    const ffmpegPath = path.join(resourcesPath, 'bin', os.platform(), ffmpegName);

    // Args to normalize to 16kHz mono PCM (required by standard GGML/Whisper.cpp)
    const ffmpegArgs = [
      '-y',
      '-i', inputPath,
      '-vn',
      '-acodec', 'pcm_s16le',
      '-ac', '1',
      '-ar', '16000',
      outputPath
    ];

    // Check if falling back to system ffmpeg is necessary during local testing
    const binaryToRun = fs.existsSync(ffmpegPath) ? ffmpegPath : 'ffmpeg';

    const ffmpeg = spawn(binaryToRun, ffmpegArgs);

    let errorOutput = '';

    ffmpeg.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, outputPath });
      } else {
        console.error('FFmpeg error output:', errorOutput);
        reject(new Error(`FFmpeg exited with error code ${code}. Error: ${errorOutput}`));
      }
    });

    ffmpeg.on('error', (err) => {
      reject(new Error(`Failed to start FFmpeg path ${ffmpegPath}: ${err.message}`));
    });
  });
});

// 3. Audio/Video File Selection via Native dialogs
ipcMain.handle('select-file', async () => {
  if (!mainWindow) return null;

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Media Files (Audio/Video)', extensions: ['mp3', 'wav', 'm4a', 'flac', 'mp4', 'mkv', 'mov'] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  const stats = fs.statSync(filePath);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(1);

  return {
    filePath,
    fileName: path.basename(filePath),
    fileSize: `${sizeMb} MB`,
    fileType: filePath.match(/\.(mp4|mkv|mov)$/i) ? 'video' : 'audio'
  };
});

// 4. Download GGML Model files directly from official Huggingface models repo
ipcMain.handle('download-model', async (event, { modelId }) => {
  const modelUrls: Record<string, string> = {
    'tiny': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny-q5_1.bin',
    'base': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base-q5_1.bin',
    'small': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small-q5_1.bin',
    'medium': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium-q5_0.bin',
    'large-v3': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-q5_0.bin'
  };

  const url = modelUrls[modelId];
  if (!url) {
    throw new Error(`Unsupported model ID: ${modelId}`);
  }

  const appDataPath = app.getPath('userData');
  const cacheDir = path.join(appDataPath, 'whisper-cache');
  ensureDir(cacheDir);

  const fileName = `ggml-${modelId}.bin`;
  const destinationPath = path.join(cacheDir, fileName);

  if (fs.existsSync(destinationPath)) {
    event.sender.send('download-progress', { modelId, progress: 100, completed: true, path: destinationPath });
    return destinationPath;
  }

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destinationPath);
    
    https.get(url, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Handle HTTP Direct Redirects (HuggingFace releases route through Cloudflare CDN endpoints)
        https.get(response.headers.location, handleDownloadStream).on('error', (err) => {
          fs.unlink(destinationPath, () => {});
          reject(err);
        });
      } else {
        handleDownloadStream(response);
      }
    }).on('error', (err) => {
      fs.unlink(destinationPath, () => {});
      reject(err);
    });

    function handleDownloadStream(resp: https.IncomingMessage) {
      const totalBytes = parseInt(resp.headers['content-length'] || '0', 10);
      let downloadedBytes = 0;

      resp.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        file.write(chunk);

        if (totalBytes > 0) {
          const progress = Math.round((downloadedBytes / totalBytes) * 100);
          event.sender.send('download-progress', { modelId, progress, completed: false });
        }
      });

      resp.on('end', () => {
        file.end();
        event.sender.send('download-progress', { modelId, progress: 100, completed: true, path: destinationPath });
        resolve(destinationPath);
      });

      resp.on('error', (err) => {
        file.close();
        fs.unlink(destinationPath, () => {});
        reject(err);
      });
    }
  });
});

// 5. Run Offline Local Whisper.cpp Spawner & Process progress signals
ipcMain.handle('transcribe-whisper', async (event, { audioWavPath, modelPath, settings }) => {
  return new Promise((resolve, reject) => {
    // Resolve bundled whisper compile-wrapper CLI binary
    const isPackaged = app.isPackaged;
    const resourcesPath = isPackaged ? process.resourcesPath : path.join(__dirname, '..');
    
    let whisperBinName = 'whisper-cli';
    if (os.platform() === 'win32') {
      whisperBinName = 'whisper-cli.exe';
    }
    const whisperPath = path.join(resourcesPath, 'bin', os.platform(), whisperBinName);

    // Formulate fully native arguments targeting whisper.cpp engine
    const whisperArgs = [
      '-m', modelPath,
      '-f', audioWavPath,
      '-t', String(settings.threads || 4),
      '-otxt', // Output text formats
      '-osrt', // Output SRT formats
      '-ovtt', // Output VTT formats
      '-oj',   // Output rich JSON including Word-Level timestamps and segment listings
      '--ml', '1', // Include sentence split constraints
      '--word-timestamps'
    ];

    if (settings.enableGpu) {
      if (settings.gpuType === 'CUDA' || settings.gpuType === 'Metal') {
        whisperArgs.push('--gpu-acceleration');
      }
    }

    const binaryToRun = fs.existsSync(whisperPath) ? whisperPath : 'whisper-cli';
    const whisperProcess = spawn(binaryToRun, whisperArgs);

    let logBuffer = '';
    let completedDataFile = `${audioWavPath}.json`;

    whisperProcess.stderr.on('data', (data) => {
      const output = data.toString();
      logBuffer += output;

      // Extract real-time percentage progress logs from whisper-stderr
      // Whisper.cpp progress loops print: "whisper_full: progress =  42%"
      const progressMatch = output.match(/progress\s*=\s*(\d+)%/i);
      if (progressMatch && progressMatch[1]) {
        const progressVal = parseInt(progressMatch[1], 10);
        event.sender.send('transcribe-progress', { progress: progressVal });
      }

      event.sender.send('engine-log', { source: 'Whisper.cpp', type: 'info', message: output.trim() });
    });

    whisperProcess.on('close', (code) => {
      if (code === 0) {
        // Read generated offline result JSON
        try {
          if (fs.existsSync(completedDataFile)) {
            const fileContent = fs.readFileSync(completedDataFile, 'utf-8');
            const data = JSON.parse(fileContent);
            
            // Cleanup temporary output files spawned by whisper.cpp CLI
            fs.unlink(completedDataFile, () => {});
            fs.unlink(`${audioWavPath}.txt`, () => {});
            fs.unlink(`${audioWavPath}.srt`, () => {});
            fs.unlink(`${audioWavPath}.vtt`, () => {});

            resolve({ success: true, data });
          } else {
            // Unquantized raw text fallback parse from log buffers
            resolve({ success: true, fallbackLogs: logBuffer });
          }
        } catch (ex: any) {
          reject(new Error(`Failed to parse whisper output payload: ${ex.message}`));
        }
      } else {
        reject(new Error(`Whisper engine crashed with error code ${code}. Logs: ${logBuffer}`));
      }
    });

    whisperProcess.on('error', (err) => {
      reject(new Error(`Engine startup error: ${err.message}`));
    });
  });
});
