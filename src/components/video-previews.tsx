"use client";

import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface VideoPreviewsProps {
  screenStream: MediaStream | null;
  webcamStream: MediaStream | null;
  isRecording: boolean;
}

const VideoPreviews: React.FC<VideoPreviewsProps> = ({ screenStream, webcamStream, isRecording }) => {
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const webcamVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  useEffect(() => {
    if (webcamVideoRef.current && webcamStream) {
      webcamVideoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream]);

  if (!isRecording && !screenStream && !webcamStream) {
    return (
      <Card className="w-full aspect-video bg-muted flex items-center justify-center animate-fade-in">
        <CardContent className="p-0">
          <p className="text-muted-foreground">Press "Start Recording" to begin</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="relative w-full animate-fade-in">
      <Card className="w-full overflow-hidden shadow-lg">
        <video
          ref={screenVideoRef}
          autoPlay
          playsInline
          muted // Screen share audio is usually system audio, mute preview to avoid feedback
          className="w-full aspect-video object-contain bg-slate-900"
          data-ai-hint="screen share interface"
        />
      </Card>
      {webcamStream && (
        <Card className="absolute bottom-4 right-4 w-1/4 max-w-[240px] min-w-[160px] aspect-video overflow-hidden shadow-xl border-2 border-primary animate-slide-up rounded-lg">
           <video
            ref={webcamVideoRef}
            autoPlay
            playsInline
            muted // User hears their own mic through OS, mute preview
            className="w-full h-full object-cover"
            data-ai-hint="webcam person"
          />
        </Card>
      )}
    </div>
  );
};

export default VideoPreviews;
