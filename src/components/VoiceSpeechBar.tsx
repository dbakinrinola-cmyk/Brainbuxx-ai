import React from 'react';
import { Volume2, Pause, Play, Square } from 'lucide-react';

interface VoiceSpeechBarProps {
  isSpeaking: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export const VoiceSpeechBar: React.FC<VoiceSpeechBarProps> = ({
  isSpeaking,
  isPaused,
  onPause,
  onResume,
  onStop,
}) => {
  if (!isSpeaking && !isPaused) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2 bg-neutral-900/95 dark:bg-neutral-800/95 text-white rounded-full shadow-xl border border-neutral-700/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-blue-400 animate-pulse" />
        <span className="text-xs font-medium tracking-tight">
          {isPaused ? 'Speech Paused' : 'Reading response aloud'}
        </span>
      </div>

      <div className="h-3 w-px bg-neutral-700" />

      <div className="flex items-center gap-1.5">
        {isPaused ? (
          <button
            onClick={onResume}
            className="p-1 rounded-full hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
            title="Resume speaking"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>
        ) : (
          <button
            onClick={onPause}
            className="p-1 rounded-full hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
            title="Pause speech"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
          </button>
        )}

        <button
          onClick={onStop}
          className="p-1 rounded-full hover:bg-neutral-800 text-neutral-300 hover:text-red-400 transition-colors"
          title="Stop speech"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
        </button>
      </div>
    </div>
  );
};
