"use client";

import React from "react";
import VideoPreviews from "@/components/video-previews";
import RecorderControls from "@/components/recorder-controls";
import { useMediaRecorder } from "@/hooks/use-media-recorder";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Github, ScreenShare } from "lucide-react";

export default function HomePage() {
  const {
    recordingState,
    startRecording,
    stopRecording,
    downloadRecording,
    screenStream,
    webcamStream,
    errorMessage,
    suggestedFilename,
    setSuggestedFilename,
    recordingTopic,
    setRecordingTopic,
  } = useMediaRecorder();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-body">
      <header className="w-full max-w-4xl mb-8 text-center">
        <div className="flex items-center justify-center mb-2">
          <ScreenShare className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold ml-3 font-headline tracking-tight">
            CamScreen
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Your simple solution for screen and webcam recording. Capture, create,
          and share with CamScreen.
        </p>
      </header>

      <main className="w-full max-w-4xl">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">
              Live Preview
            </CardTitle>
            <CardDescription>
              {recordingState === "recording"
                ? "You are currently recording."
                : "Your screen and webcam preview will appear here when you start."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VideoPreviews
              screenStream={screenStream}
              webcamStream={webcamStream}
              isRecording={
                recordingState === "recording" || recordingState === "capturing"
              }
            />
          </CardContent>
        </Card>

        <RecorderControls
          recordingState={recordingState}
          startRecording={startRecording}
          stopRecording={stopRecording}
          downloadRecording={downloadRecording}
          errorMessage={errorMessage}
          suggestedFilename={suggestedFilename}
          setSuggestedFilename={setSuggestedFilename}
          recordingTopic={recordingTopic}
          setRecordingTopic={setRecordingTopic}
        />
      </main>

      <footer className="w-full max-w-4xl mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} CamScreen. All rights reserved.</p>
        <a
          href="https://github.com/abhishek01dev/CamScreen"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-primary transition-colors mt-2"
        >
          <Github className="h-4 w-4" />
          View on GitHub (abhishek01dev)
        </a>
      </footer>
    </div>
  );
}
