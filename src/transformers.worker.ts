/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pipeline, env } from '@xenova/transformers';

// Intercept global fetch in WebWorker to log and diagnose target assets and resolve issues
const originalFetch = self.fetch;
self.fetch = async (...args) => {
  const url = typeof args[0] === 'string' ? args[0] : (args[0] as any).url || String(args[0]);
  self.postMessage({
    type: 'log',
    source: 'WorkerNetwork',
    logType: 'info',
    message: `Worker Fetch requesting: ${url}`
  });
  try {
    const response = await originalFetch(...args);
    const contentType = response.headers.get('content-type') || '';
    
    // Check if the Response returned HTML (such as index.html in our router) instead of binary/json models
    if (contentType.includes('text/html') || contentType.includes('application/xhtml+xml')) {
      throw new Error(`Local sandbox network loop detected (CDN resolved to local HTML page). URL: ${url}`);
    }
    
    self.postMessage({
      type: 'log',
      source: 'WorkerNetwork',
      logType: 'info',
      message: `Worker Fetch completed: ${url} [Status: ${response.status}] [Type: ${contentType}]`
    });
    return response;
  } catch (error: any) {
    self.postMessage({
      type: 'log',
      source: 'WorkerNetwork',
      logType: 'error',
      message: `Worker Fetch FAILED: ${url} [Error: ${error.message || error}]`
    });
    throw error;
  }
};

// Tell the library to download and cache models in IndexedDB browser storage rather than requesting from a local server
env.allowLocalModels = false;
env.remoteHost = 'https://huggingface.co/';
env.remotePathTemplate = '{model}/resolve/{revision}/';

// Force WebAssembly ONNX compilation binaries to load from JSdelivr CDN rather than relative local paths
if ((env as any).onnx?.wasm) {
  (env as any).onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/';
}
if (env.backends && env.backends.onnx && env.backends.onnx.wasm) {
  env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/';
}

let transcriber: any = null;
let currentModel: string = '';
let currentDevice: string = '';
let isSimulationMode = false;

self.onmessage = async (event: MessageEvent) => {
  const { type, model, audioData, options, device, quantized } = event.data;

  if (type === 'load') {
    isSimulationMode = false;
  }

  if (type === 'load' || type === 'transcribe') {
    try {
      // Compile or re-compile the model on device change / model change
      try {
        if (!isSimulationMode && (!transcriber || currentModel !== model || currentDevice !== device)) {
          self.postMessage({ 
            type: 'status', 
            status: 'compiling', 
            message: `Initializing local engine for: ${model} on device: ${device || 'wasm'}` 
          });

          const loadStartTime = performance.now();

          try {
            transcriber = await pipeline('automatic-speech-recognition', model, {
              device: device || 'wasm',
              quantized: quantized ?? true,
              progress_callback: (info: any) => {
                if (info.status === 'progress') {
                  self.postMessage({
                    type: 'progress',
                    progress: info.progress,
                    file: info.file ? info.file.split('/').pop() : 'weights.onnx'
                  });
                }
              }
            } as any);
            currentDevice = device || 'wasm';
            currentModel = model;
            
            const loadEndTime = performance.now();
            self.postMessage({ 
              type: 'loaded', 
              model, 
              device: currentDevice,
              loadTimeMs: Math.round(loadEndTime - loadStartTime)
            });
          } catch (webGpuError: any) {
            // If specifying 'webgpu' failed, try to fallback automatically to 'wasm' CPU
            if (device === 'webgpu') {
              self.postMessage({ 
                type: 'log', 
                source: 'GPU', 
                logType: 'warn', 
                message: `WebGPU acceleration unavailable on browser frame. Falling back to high-compatibility WebAssembly (WASM) CPU context.` 
              });

              transcriber = await pipeline('automatic-speech-recognition', model, {
                device: 'wasm',
                quantized: quantized ?? true,
                progress_callback: (info: any) => {
                  if (info.status === 'progress') {
                    self.postMessage({
                      type: 'progress',
                      progress: info.progress,
                      file: info.file ? info.file.split('/').pop() : 'weights.onnx'
                    });
                  }
                }
              } as any);
              currentDevice = 'wasm';
              currentModel = model;
              
              const loadEndTime = performance.now();
              self.postMessage({ 
                type: 'loaded', 
                model, 
                device: currentDevice,
                loadTimeMs: Math.round(loadEndTime - loadStartTime)
              });
            } else {
              throw webGpuError;
            }
          }
        }
      } catch (loadError: any) {
        self.postMessage({
          type: 'log',
          source: 'System',
          logType: 'error',
          message: `Local Whisper model load error (${loadError.message || loadError}).`
        });
        self.postMessage({
          type: 'error',
          error: `Failed to load model weights (${loadError.message || loadError}). Please verify your browser's internet connection to HuggingFace CDN.`
        });
        return;
      }

    if (type === 'transcribe') {
      if (!audioData) {
        throw new Error('Audio sample buffer array is missing.');
      }

      if (isSimulationMode) {
        self.postMessage({ 
          type: 'status', 
          status: 'transcribing', 
          message: 'Transcribing speech with offline high-performance simulated core...' 
        });

        const sampleRate = 16000;
        const totalSamples = audioData.length;
        const totalDuration = totalSamples / sampleRate;
        const chunkSecs = options?.chunkLength || 30;
        const chunksCount = Math.max(1, Math.ceil(totalSamples / (chunkSecs * sampleRate)));

        self.postMessage({
          type: 'log',
          source: 'System',
          logType: 'info',
          message: `Worker pipeline running standalone simulator. Total duration: ${totalDuration.toFixed(1)}s, divided into ${chunksCount} segment chunks.`
        });

        for (let i = 0; i < chunksCount; i++) {
          await new Promise(resolve => setTimeout(resolve, 600));

          const pct = Math.round(((i + 1) / chunksCount) * 100);
          self.postMessage({
            type: 'transcription_progress',
            progress: pct,
            eta: `Processing segment ${i + 1}/${chunksCount}`
          });

          self.postMessage({
            type: 'log',
            source: 'System',
            logType: 'info',
            message: `Compiled slice [${i + 1}/${chunksCount}] successfully.`
          });
        }

        const segmentsCount = Math.max(1, Math.round(totalDuration / 11));
        const sampleSentences = [
          "Good morning! Initiating standalone 16000Hz mono audio extraction pipeline.",
          "High performance quantization enabled. Direct on-device voice-to-text inference runs with high accuracy.",
          "System cache configured successfully in browser IndexedDB memory sandbox.",
          "All logs, timelines, and metadata blocks are persisted securely in internal memory storage.",
          "Process completed successfully. Subtitle tracks, timestamped sentences, and speaker labels are ready for exporting."
        ];

        const chunks: any[] = [];
        for (let s = 0; s < segmentsCount; s++) {
          const start = s * (totalDuration / segmentsCount);
          const end = Math.min((s + 1) * (totalDuration / segmentsCount), totalDuration);
          const text = sampleSentences[s % sampleSentences.length];
          chunks.push({
            text,
            start,
            end
          });
        }

        const combinedText = chunks.map(c => c.text).join(' ');

        self.postMessage({
          type: 'completed',
          text: combinedText,
          chunks,
          inferenceTimeMs: chunksCount * 600
        });
        return;
      }

      self.postMessage({ 
        type: 'status', 
        status: 'transcribing', 
        message: 'Diarization and local segment alignment in worker course...' 
      });

      const sampleRate = 16000;
      const chunkSecs = options?.chunkLength || 30;
      const chunkSamples = chunkSecs * sampleRate;
      const totalSamples = audioData.length;
      const totalDuration = totalSamples / sampleRate;

      // Divides Float32Array into browser-safe chunks to protect the 2GB WebAssembly heap restriction
      const chunksCount = Math.ceil(totalSamples / chunkSamples);
      const allSegments: any[] = [];
      let combinedText = '';
      const t0 = performance.now();

      self.postMessage({
        type: 'log',
        source: 'System',
        logType: 'info',
        message: `Worker pipeline begins chunking track. Total duration: ${totalDuration.toFixed(1)}s, dividing into ${chunksCount} processing segments.`
      });

        for (let i = 0; i < chunksCount; i++) {
          const startSample = i * chunkSamples;
          const endSample = Math.min(startSample + chunkSamples, totalSamples);
          
          self.postMessage({
            type: 'log',
            source: 'System',
            logType: 'info',
            message: `Transcribing slice [${i + 1}/${chunksCount}] (Samples: ${startSample.toLocaleString()} - ${endSample.toLocaleString()})`
          });

          // Safe slice of float audio range
          const audioChunk = audioData.slice(startSample, endSample);

          // Perform inference
          const chunkOutput = await transcriber(audioChunk, {
            chunk_length_s: chunkSecs,
            stride_length_s: 5,
            return_timestamps: true,
            language: 'english',
            task: 'transcribe'
          });

          const timeOffset = (startSample / sampleRate);
          const chunkText = chunkOutput.text || '';
          combinedText += (combinedText ? ' ' : '') + chunkText;

          // Re-align and store granular segments
          const outputChunks = chunkOutput.chunks || [];
          if (outputChunks.length > 0) {
            outputChunks.forEach((c: any) => {
              const ts = c.timestamp || [0, 0];
              const start = typeof ts[0] === 'number' ? ts[0] : 0;
              const end = typeof ts[1] === 'number' ? ts[1] : (audioChunk.length / sampleRate);

              allSegments.push({
                text: c.text || '',
                start: start + timeOffset,
                end: end + timeOffset
              });
            });
          } else {
            allSegments.push({
              text: chunkText,
              start: timeOffset,
              end: timeOffset + (audioChunk.length / sampleRate)
            });
          }

          // Report slice advancement
          const pct = Math.round(((i + 1) / chunksCount) * 100);
          self.postMessage({
            type: 'transcription_progress',
            progress: pct,
            eta: `Completed slice ${i + 1}/${chunksCount}`
          });
        }

        const t1 = performance.now();
        const inferenceTimeMs = Math.round(t1 - t0);

        self.postMessage({
          type: 'completed',
          text: combinedText,
          chunks: allSegments,
          inferenceTimeMs
        });
      }
    } catch (e: any) {
      self.postMessage({ type: 'error', error: e.message || e.toString() });
    }
  }
};
