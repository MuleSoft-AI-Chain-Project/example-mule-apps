// VoiceRecorder.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { LLMSettings } from "@/types/types";

interface VoiceRecorderProps {
  onRecordingComplete: (result: import("@/types/types").QueryResult) => void;
  isRecording: boolean;
  onRecordingStop: () => void;
  maxDuration: number;
  llmSettings: LLMSettings;
  storeName?: string;
  rag: boolean;
}

interface RecordingError extends Error {
  name: "PermissionDeniedError" | "RecordingError";
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  isRecording,
  onRecordingStop,
  maxDuration = 30,
  llmSettings,
  storeName,
  rag,
}) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

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
      handleRecordingError(error as RecordingError);
    }
  };

  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      audioChunksRef.current.push(event.data);
    }
  };

  const handleRecordingStop = async (stream: MediaStream) => {
    console.log("Recording stopped");
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: mediaRecorderRef.current?.mimeType,
      });

      try {
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");
        formData.append("storeName", storeName || "");

        const response = await fetch("/api/upload-audio", {
          method: "POST",
          body: formData,
          headers: {
            "X-LLM-Settings": JSON.stringify(llmSettings),
            "X-RAG": rag.toString(),
          },
        });

        const result = await response.json();

        if (result.success) {
          const audioData = result.queryStoreResponse.audio;
          const decodedAudio = atob(audioData);
          const audioArray = new Uint8Array(decodedAudio.length);
          for (let i = 0; i < decodedAudio.length; i++) {
            audioArray[i] = decodedAudio.charCodeAt(i);
          }

          const audioContext = new AudioContext();
          const audioBuffer = await audioContext.decodeAudioData(
            audioArray.buffer
          );
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContext.destination);
          source.start(0);

          await onRecordingComplete(result.queryStoreResponse);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error("Error processing recording:", error);
        throw error;
      }
    }

    stream.getTracks().forEach((track) => track.stop());
  };

  const handleRecordingError = (error: RecordingError) => {
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
  }, [isRecording, onRecordingComplete, onRecordingStop, maxDuration]);

  return (
    <>
      {permissionDenied && (
        <div className="text-red-500 text-sm">
          Microphone access denied. Please enable it in your browser settings.
        </div>
      )}
    </>
  );
};

export default VoiceRecorder;
