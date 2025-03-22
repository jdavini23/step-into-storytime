'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume, VolumeX } from 'lucide-react';

interface AmbientSoundPlayerProps {
  setting: string;
  isEnabled?: boolean;
}

export default function AmbientSoundPlayer({ 
  setting, 
  isEnabled = false 
}: AmbientSoundPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [audioSrc, setAudioSrc] = useState('');
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio source based on setting
  useEffect(() => {
    // This would be replaced with actual audio files
    // For now, we're using placeholder URLs
    const audioMap: Record<string, string> = {
      underwater: '/sounds/underwater-ambient.mp3',
      ocean: '/sounds/ocean-waves.mp3',
      space: '/sounds/space-ambient.mp3',
      forest: '/sounds/forest-ambient.mp3',
      jungle: '/sounds/jungle-ambient.mp3',
      castle: '/sounds/medieval-ambient.mp3',
      default: '/sounds/soft-ambient.mp3'
    };
    
    // Find matching sound or use default
    const lowerSetting = setting.toLowerCase();
    let selectedSound = 'default';
    
    Object.keys(audioMap).forEach(key => {
      if (lowerSetting.includes(key)) {
        selectedSound = key;
      }
    });
    
    setAudioSrc(audioMap[selectedSound]);
    setAudioError(false); // Reset error state when changing audio source
  }, [setting]);
  
  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && audioRef.current) {
        // Pause audio when tab is not visible
        audioRef.current.pause();
        setPlaying(false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Update audio element volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current || audioError) return;
    
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      // Handle Safari requiring user interaction
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlaying(true);
          })
          .catch(error => {
            console.error("Audio play failed:", error);
            setAudioError(true);
            setPlaying(false);
          });
      } else {
        setPlaying(true);
      }
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };
  
  // Handle audio errors
  const handleAudioError = () => {
    console.error("Error loading audio file:", audioSrc);
    setAudioError(true);
    setPlaying(false);
  };
  
  if (!isEnabled) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-slate-800 rounded-full shadow-lg p-2 z-50 flex items-center space-x-2">
      <button
        onClick={togglePlay}
        className={`w-10 h-10 flex items-center justify-center rounded-full ${
          audioError 
            ? "bg-red-100 text-red-600 cursor-not-allowed" 
            : "bg-violet-100 text-violet-600 hover:bg-violet-200"
        } transition-colors`}
        aria-label={playing ? "Pause ambient sound" : "Play ambient sound"}
        disabled={audioError}
        title={audioError ? "Audio file not available" : ""}
      >
        {playing ? <VolumeX className="h-5 w-5" /> : <Volume className="h-5 w-5" />}
      </button>
      
      {playing && (
        <div className="px-2 flex items-center space-x-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 accent-violet-600"
            aria-label="Volume control"
          />
          <span className="text-xs text-slate-500 w-6 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}
      
      {/* Hidden audio element */}
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          loop
          onEnded={() => setPlaying(false)}
          onError={handleAudioError}
          className="hidden"
        />
      )}
    </div>
  );
}
