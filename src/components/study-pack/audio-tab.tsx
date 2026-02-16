'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

interface AudioTabProps {
  audioUrl: string | null;
  summary: string;
}

export function AudioTab({ audioUrl, summary }: AudioTabProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleRestart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
  };

  const changePlaybackRate = () => {
    if (!audioRef.current) return;
    const rates = [1, 1.25, 1.5, 1.75, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    audioRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <Volume2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Audio is being generated...</p>
          <p className="text-sm text-muted-foreground mt-2">Please check back in a moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Listen to Summary
          </CardTitle>
          <CardDescription>
            Audio narration of your document summary
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <audio ref={audioRef} src={audioUrl} preload="metadata" />

          {/* Waveform Visualization Placeholder */}
          <div className="h-20 bg-muted rounded-lg flex items-center justify-center">
            <div className="flex items-end gap-1 h-12">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1 bg-primary rounded-full transition-all ${
                    isPlaying ? 'animate-pulse' : ''
                  }`}
                  style={{
                    height: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="icon" onClick={handleRestart}>
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button size="lg" onClick={togglePlay} className="h-14 w-14 rounded-full">
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </Button>

            <Button variant="outline" onClick={changePlaybackRate} className="min-w-[4rem]">
              {playbackRate}x
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Text */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{summary}</p>
        </CardContent>
      </Card>
    </div>
  );
}
