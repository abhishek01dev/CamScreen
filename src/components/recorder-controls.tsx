
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleDot, Square, Download, AlertTriangle, Loader2, Info } from 'lucide-react';
import type { UseMediaRecorderReturn } from '@/hooks/use-media-recorder';

type RecorderControlsProps = Pick<
  UseMediaRecorderReturn,
  'recordingState' | 
  'startRecording' | 
  'stopRecording' | 
  'downloadRecording' | 
  'errorMessage' | 
  'suggestedFilename' | 
  'setSuggestedFilename' |
  'recordingTopic' |
  'setRecordingTopic'
>;

const RecorderControls: React.FC<RecorderControlsProps> = ({
  recordingState,
  startRecording,
  stopRecording,
  downloadRecording,
  errorMessage,
  suggestedFilename,
  setSuggestedFilename,
  recordingTopic,
  setRecordingTopic,
}) => {
  const handleStartRecording = () => {
    // Topic is already in the hook via its state, updated by the input's onChange
    startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleDownload = () => {
    downloadRecording();
  };

  return (
    <Card className="w-full mt-6 shadow-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive flex items-center gap-2 animate-fade-in">
            <AlertTriangle className="h-5 w-5" />
            <p>{errorMessage}</p>
          </div>
        )}

        {(recordingState === 'idle' || recordingState === 'stopped' || recordingState === 'error') && (
          <div className="space-y-2 animate-fade-in">
            <Label htmlFor="recordingTopic" className="text-sm font-medium">
              Recording Topic (Optional - for AI filename)
            </Label>
            <Input 
              id="recordingTopic"
              type="text"
              placeholder="E.g., Weekly project update"
              value={recordingTopic}
              onChange={(e) => setRecordingTopic(e.target.value)}
              className="mt-1"
              disabled={recordingState === 'capturing' || recordingState === 'recording'}
            />
          </div>
        )}

        {recordingState === 'idle' && (
          <Button onClick={handleStartRecording} size="lg" className="w-full animate-fade-in">
            <CircleDot className="mr-2 h-5 w-5" /> Start Recording
          </Button>
        )}

        {recordingState === 'capturing' && (
          <Button size="lg" className="w-full" disabled>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Initializing...
          </Button>
        )}

        {recordingState === 'recording' && (
          <Button onClick={handleStopRecording} variant="destructive" size="lg" className="w-full animate-fade-in">
            <Square className="mr-2 h-5 w-5" /> Stop Recording
          </Button>
        )}

        {recordingState === 'stopped' && (
          <div className="space-y-4 animate-slide-up">
            <div>
              <Label htmlFor="filename" className="text-sm font-medium">Suggested Filename</Label>
              <Input 
                id="filename" 
                type="text" 
                value={suggestedFilename} 
                onChange={(e) => setSuggestedFilename(e.target.value)} 
                className="mt-1"
                aria-describedby="filename-hint"
              />
              {suggestedFilename.startsWith("recording-") && (
                 <p id="filename-hint" className="mt-1 text-xs text-muted-foreground flex items-center">
                    <Info className="h-3 w-3 mr-1" />
                    AI suggestion failed or no topic given. You can edit the name.
                 </p>
              )}
            </div>
            <Button onClick={handleDownload} size="lg" className="w-full bg-accent hover:bg-accent/90">
              <Download className="mr-2 h-5 w-5" /> Download Recording
            </Button>
            <Button 
              onClick={() => {
                setRecordingTopic(''); // Clear topic for new recording
                handleStartRecording();
              }} 
              size="lg" 
              variant="outline" 
              className="w-full"
            >
             <CircleDot className="mr-2 h-5 w-5" /> Record Again
            </Button>
          </div>
        )}
         {recordingState === 'error' && (
           <Button 
            onClick={() => {
                // Keep topic as user might want to retry with it
                handleStartRecording();
            }}  
            size="lg" 
            className="w-full animate-fade-in"
          >
            <CircleDot className="mr-2 h-5 w-5" /> Try Recording Again
          </Button>
         )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>Recordings are saved locally to your computer in .webm format. AI-suggested filenames use your provided topic.</p>
      </CardFooter>
    </Card>
  );
};

export default RecorderControls;
