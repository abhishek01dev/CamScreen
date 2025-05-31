
"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { generateFilename } from '@/ai/flows/filenameGenerator';
import { useToast } from '@/hooks/use-toast';

type RecordingState = 'idle' | 'capturing' | 'recording' | 'stopped' | 'error';

export interface UseMediaRecorderReturn {
  recordingState: RecordingState;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  downloadRecording: () => void;
  screenStream: MediaStream | null;
  webcamStream: MediaStream | null;
  errorMessage: string | null;
  suggestedFilename: string;
  setSuggestedFilename: React.Dispatch<React.SetStateAction<string>>;
  recordingTopic: string;
  setRecordingTopic: (topic: string) => void;
}

export function useMediaRecorder(): UseMediaRecorderReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [suggestedFilename, setSuggestedFilename] = useState<string>('');
  
  const [_recordingTopic, _setRecordingTopic] = useState<string>('');
  const recordingTopicRef = useRef(_recordingTopic);

  const setRecordingTopic = useCallback((topic: string) => {
    recordingTopicRef.current = topic;
    _setRecordingTopic(topic);
  }, []);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();

  const cleanupStreams = useCallback(() => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
  }, [screenStream, webcamStream]);

  const startRecording = async () => {
    setRecordingState('capturing');
    setErrorMessage(null);
    recordedChunksRef.current = [];
    setSuggestedFilename(''); // Clear previous suggestion
    // recordingTopic is intentionally not cleared here, user might want to reuse it if they restart quickly. 
    // It can be cleared in the UI component if desired.

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" } as MediaTrackConstraints,
        audio: false 
      });
      setScreenStream(displayStream);

      const userStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 360 } },
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      setWebcamStream(userStream);

      const combinedStream = new MediaStream();
      displayStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
      userStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
      userStream.getAudioTracks().forEach(track => combinedStream.addTrack(track));

      mediaRecorderRef.current = new MediaRecorder(combinedStream, { mimeType: 'video/webm; codecs=vp9,opus' });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        setRecordingState('stopped');
        try {
          const filename = await generateFilename({ topic: recordingTopicRef.current });
          setSuggestedFilename(filename);
        } catch (aiError) {
          console.error("Error generating filename:", aiError);
          const fallbackDate = new Date().toISOString().replace(/[:.]/g, '-');
          setSuggestedFilename(`recording-${fallbackDate}.webm`);
          toast({ title: "AI Error", description: "Could not generate filename from AI, using default.", variant: "destructive" });
        }
      };
      
      displayStream.getVideoTracks()[0].onended = () => {
        // Use a local variable for recordingState to ensure the latest value within this closure
        const currentRecordingState = mediaRecorderRef.current?.state;
        if (currentRecordingState === 'recording') {
           stopRecording(); 
        }
      };

      mediaRecorderRef.current.start();
      setRecordingState('recording');
      toast({ title: "Recording Started", description: "Screen and webcam are being recorded." });

    } catch (err) {
      console.error("Error starting recording:", err);
      const typedError = err as Error;
      let friendlyMessage = "Failed to start recording. Ensure permissions are granted and the page is served over HTTPS or localhost.";
      if (typedError.name === "NotAllowedError") {
        friendlyMessage = "Permission to access screen or camera/microphone was denied. Grant permissions and try again. Ensure HTTPS or localhost.";
      } else if (typedError.name === "NotFoundError") {
         friendlyMessage = "No camera or microphone found. Ensure they are connected and enabled.";
      } else if (typedError.message.includes("Permissions policy")) {
        friendlyMessage = "Screen capture is disallowed by permissions policy (HTTPS/iframe 'allow'). Check browser console.";
      }
      setErrorMessage(friendlyMessage);
      setRecordingState('error');
      cleanupStreams();
      toast({ title: "Recording Error", description: friendlyMessage, variant: "destructive" });
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    // cleanupStreams is called when tracks end or mediaRecorder.onstop implicitly handles it
    // For tracks ending:
    // - Screen stream: onended listener calls stopRecording, which stops mediaRecorder, then onstop handles cleanup via setScreenStream(null) etc.
    // - Webcam stream: manually stopped in cleanupStreams.

    // Check current state before calling cleanupStreams to avoid race conditions or double-stops
    // if onended listener already triggered this path.
    const currentScreenStream = screenStream;
    const currentWebcamStream = webcamStream;
    
    if (currentScreenStream || currentWebcamStream) {
        cleanupStreams();
    }

    if (recordingState === 'recording') { 
        setRecordingState('stopped'); // Ensure state transition if not done by onstop
    }
    toast({ title: "Recording Stopped", description: "Processing video..." });
  }, [cleanupStreams, recordingState, screenStream, webcamStream]);


  const downloadRecording = () => {
    if (recordedChunksRef.current.length === 0) {
      setErrorMessage("No video data recorded.");
      toast({ title: "Download Error", description: "No video data to download.", variant: "destructive" });
      return;
    }
    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = suggestedFilename || `recording-${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setRecordingState('idle'); 
    recordedChunksRef.current = []; 
    // setRecordingTopic(''); // Optionally clear topic after download
    toast({ title: "Download Started", description: `Downloading ${a.download}` });
  };
  
  useEffect(() => {
    // Ensure recordingTopicRef is updated when _recordingTopic changes
    recordingTopicRef.current = _recordingTopic;
  }, [_recordingTopic]);

  return {
    recordingState,
    startRecording,
    stopRecording,
    downloadRecording,
    screenStream,
    webcamStream,
    errorMessage,
    suggestedFilename,
    setSuggestedFilename,
    recordingTopic: _recordingTopic,
    setRecordingTopic,
  };
}
