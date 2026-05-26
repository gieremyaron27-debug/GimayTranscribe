/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { contextBridge, ipcRenderer } from 'electron';

// Expose secure API channels to the client React compiler context
contextBridge.exposeInMainWorld('electronAPI', {
  getHardwareSpecs: () => ipcRenderer.invoke('get-hardware-specs'),
  selectFile: () => ipcRenderer.invoke('select-file'),
  extractAudio: (args: { inputPath: string; outputPath: string }) => 
    ipcRenderer.invoke('extract-audio', args),
  downloadModel: (args: { modelId: string }) => 
    ipcRenderer.invoke('download-model', args),
  transcribeWhisper: (args: { audioWavPath: string; modelPath: string; settings: any }) => 
    ipcRenderer.invoke('transcribe-whisper', args),
    
  // Subscriptions to stream real-time logs and progress increments
  onDownloadProgress: (callback: (data: any) => void) => {
    ipcRenderer.on('download-progress', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('download-progress');
  },
  onTranscribeProgress: (callback: (data: any) => void) => {
    ipcRenderer.on('transcribe-progress', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('transcribe-progress');
  },
  onEngineLog: (callback: (data: any) => void) => {
    ipcRenderer.on('engine-log', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('engine-log');
  }
});
