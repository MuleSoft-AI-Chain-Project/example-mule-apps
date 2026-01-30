import React, { useEffect, useRef, useState } from "react";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { getApiUrl } from "../config/api";

export default function VoiceRecorder({
  onRecordingComplete,
  isRecording,
  onRecordingStop,
  maxDuration = 30,
  llmSettings,
  storeName,
  rag
}) {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timeoutRef = useRef(null);
  const ffmpegRef = useRef(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  // Load FFmpeg on component mount
  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const ffmpeg = new FFmpeg();
        ffmpegRef.current = ffmpeg;
        
        // Load FFmpeg core
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        
        setFfmpegLoaded(true);
        console.log('FFmpeg loaded successfully');
      } catch (error) {
        console.error('Failed to load FFmpeg:', error);
      }
    };
    
    loadFFmpeg();
  }, []);

  const startRecording = async () => {
    console.log("Recording started");
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.onstop = () => handleRecordingStop(stream);

      mediaRecorder.start(500);
      startRecordingTimeout();
    } catch (error) {
      handleRecordingError(error);
    }
  };

  const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
      audioChunksRef.current.push(event.data);
    }
  };

  const handleRecordingStop = async (stream) => {
    console.log("Recording stopped");
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: mediaRecorderRef.current?.mimeType,
      });

      try {
        // Check if FFmpeg is loaded
        if (!ffmpegLoaded || !ffmpegRef.current) {
          throw new Error('FFmpeg not loaded yet. Please try again.');
        }

        const ffmpeg = ffmpegRef.current;
        
        // Determine input format
        const inputFormat = audioBlob.type.includes('webm') ? 'webm' : 'mp4';
        const inputFileName = `input.${inputFormat}`;
        const outputFileName = 'output.mp3';
        
        console.log(`Converting ${inputFormat} to MP3...`);
        
        // Write input file to FFmpeg virtual filesystem
        await ffmpeg.writeFile(inputFileName, await fetchFile(audioBlob));
        
        // Convert to MP3 with 128kbps bitrate
        await ffmpeg.exec([
          '-i', inputFileName,
          '-codec:a', 'libmp3lame',
          '-b:a', '128k',
          outputFileName
        ]);
        
        // Read the output MP3 file
        const mp3Data = await ffmpeg.readFile(outputFileName);
        const mp3Blob = new Blob([mp3Data.buffer], { type: 'audio/mpeg' });
        
        console.log(`Conversion complete. MP3 size: ${(mp3Blob.size / 1024).toFixed(2)} KB`);
        
        // Clean up FFmpeg virtual filesystem
        await ffmpeg.deleteFile(inputFileName);
        await ffmpeg.deleteFile(outputFileName);
        
        // Create FormData with MP3 file
        const formData = new FormData();
        formData.append('audio', mp3Blob, 'recording.mp3');
        if (storeName) {
          formData.append('storeName', storeName);
        }

        // Send to /query endpoint with voice flag
        const response = await fetch(getApiUrl('queryStore'), {
          method: "POST",
          headers: {
            "X-Llm-Type": llmSettings.llmType,
            "X-Llm-Model": llmSettings.modelName,
            "X-Temperature": llmSettings.temperature.toString(),
            "X-Max-Tokens": llmSettings.maxToken.toString(),
            "X-Input-Limit": llmSettings.inputLimit.toString(),
            "X-Chat-Memory": llmSettings.chatMemory.toString(),
            "X-Max-Messages": llmSettings.maxMessages.toString(),
            "X-Toxicity-Detection": llmSettings.toxicityDetection.toString(),
            "X-Grounded": llmSettings.grounded.toString(),
            "X-Pre-Decoration": llmSettings.preDecoration,
            "X-Post-Decoration": llmSettings.postDecoration,
            "X-Rag": Boolean(storeName).toString(),
            "X-MCP": llmSettings.enableMcpServers.toString(),
            "voice": "true",
          },
          body: formData,
        });

        const result = await response.json();

        // Check if there's audio in the response to play back
        if (result.audio) {
          const decodedAudio = atob(result.audio);
          const audioArray = new Uint8Array(decodedAudio.length);
          for (let i = 0; i < decodedAudio.length; i++) {
            audioArray[i] = decodedAudio.charCodeAt(i);
          }

          const audioContext = new AudioContext();
          const audioBuffer = await audioContext.decodeAudioData(audioArray.buffer);
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContext.destination);
          source.start(0);
        }

        await onRecordingComplete(result);
      } catch (error) {
        console.error("Error processing recording:", error);
        throw error;
      }
    }

    stream.getTracks().forEach((track) => track.stop());
  };

  const handleRecordingError = (error) => {
    console.error("Recording error:", error.name);
    setPermissionDenied(error.name === "PermissionDeniedError");
    onRecordingStop();
  };

  const startRecordingTimeout = () => {
    timeoutRef.current = setTimeout(() => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    }, maxDuration * 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      onRecordingStop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }

    return () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isRecording]);

  return (
    <>
      {!ffmpegLoaded && (
        <div className="text-yellow-500 text-sm mb-2">
          Loading audio processor...
        </div>
      )}
      {permissionDenied && (
        <div className="text-red-500 text-sm">
          Microphone access denied. Please enable it in your browser settings.
        </div>
      )}
    </>
  );
}

