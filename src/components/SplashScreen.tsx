import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'initial' | 'writing' | 'tagline' | 'fading'>('initial');
  const [drawnLetters, setDrawnLetters] = useState<string>('');

  const fullWord = 'Brainbuxx';

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    // Phase 1: Clean initial display
    const timer1 = setTimeout(() => {
      setPhase('writing');
    }, 400);

    return () => clearTimeout(timer1);
  }, [onComplete]);

  // Smooth letter-by-letter cursive writing sequence
  useEffect(() => {
    if (phase !== 'writing') return;

    let index = 0;
    const interval = setInterval(() => {
      index++;
      setDrawnLetters(fullWord.slice(0, index));

      if (index >= fullWord.length) {
        clearInterval(interval);
        // After writing is done, show tagline smoothly
        setTimeout(() => {
          setPhase('tagline');
        }, 450);
      }
    }, 240); // Deliberately slow, natural writing rhythm (approx 2.2 seconds total for Brainbuxx)

    return () => clearInterval(interval);
  }, [phase]);

  // Phase transition to fade out
  useEffect(() => {
    if (phase === 'tagline') {
      const timer = setTimeout(() => {
        setPhase('fading');
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (phase === 'fading') {
      const timer = setTimeout(() => {
        onComplete();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-700 select-none ${
        phase === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Brainbuxx AI loading animation"
    >
      {/* Skip button in top corner for instant access */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-700 bg-neutral-50 hover:bg-neutral-100 rounded-full border border-neutral-200/60 transition-colors"
      >
        <span>Skip intro</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      <div className="flex flex-col items-center justify-center max-w-md px-6 text-center">
        {/* Brainbuxx Minimal Emblem */}
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center shadow-md shadow-neutral-200">
            <svg
              className="w-9 h-9 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a4 4 0 0 0-4 4v1H7a5 5 0 0 0-5 5c0 2.2 1.4 4 3.4 4.7.2 2.5 2.1 4.3 4.6 4.3h4a4 4 0 0 0 4-4v-1h1a5 5 0 0 0 5-5c0-2.2-1.4-4-3.4-4.7-.2-2.5-2.1-4.3-4.6-4.3h-1V6a4 4 0 0 0-4-4Z" />
              <path d="M9 12h6" />
              <path d="M12 9v6" />
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white" />
        </div>

        {/* Handwritten Cursive "Brainbuxx" Representation */}
        <div className="relative h-20 flex items-center justify-center">
          {/* Elegant SVG cursive stroke layer & cursive text */}
          <div className="relative flex items-center justify-center">
            <span
              style={{
                fontFamily: "'Alex Brush', cursive, sans-serif",
                letterSpacing: '0.04em',
              }}
              className="text-5xl md:text-6xl text-neutral-900 tracking-wide font-normal transition-all"
            >
              {drawnLetters}
              {phase === 'writing' && (
                <span className="inline-block w-1.5 h-8 bg-blue-600/80 rounded-full ml-1 animate-pulse align-middle" />
              )}
            </span>
          </div>
        </div>

        {/* Tagline: "Think Clearly. Create Freely." */}
        <div
          className={`mt-4 transition-all duration-700 ease-out transform ${
            phase === 'tagline' || phase === 'fading'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2'
          }`}
        >
          <p className="text-sm md:text-base font-normal tracking-wide text-neutral-500 font-sans">
            Think Clearly. Create Freely.
          </p>
          <div className="mt-3 flex flex-col items-center justify-center gap-1">
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Context-Aware Conversational Intelligence</span>
            </div>
            <span className="text-[11px] text-neutral-400 font-sans tracking-wide">
              Developed by VHS Science and Innovation
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
