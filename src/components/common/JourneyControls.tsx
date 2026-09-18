import React from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { playChimeSound } from '../../utils/audio';

interface JourneyControlsProps {
  currentChapter: number;
  totalChapters: number;
  nextChapterName?: string;
  onNext: () => void;
  onPrev: () => void;
}

export const JourneyControls: React.FC<JourneyControlsProps> = ({
  currentChapter,
  totalChapters,
  nextChapterName,
  onNext,
  onPrev,
}) => {
  if (currentChapter === 0) return null; // Opening screen has its own main button

  return (
    <div className="fixed bottom-4 left-0 right-0 z-30 px-4 pointer-events-none">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3 pointer-events-auto bg-[#160c1c]/90 backdrop-blur-xl border border-[#f4d068]/25 p-2 rounded-full shadow-2xl shadow-black/80">
        {/* Previous Button */}
        <button
          onClick={() => {
            playChimeSound(400, 0.15);
            onPrev();
          }}
          disabled={currentChapter === 0}
          className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/80 disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Previous Chapter"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Center Chapter Info & Next Prompt */}
        <div className="flex-1 text-center px-2">
          <p className="text-[10px] uppercase font-mono tracking-widest text-[#f4d068]/80">
            Chapter {currentChapter + 1} of {totalChapters}
          </p>
          <p className="text-xs font-serif-romantic font-semibold text-white truncate">
            {nextChapterName ? `Next: ${nextChapterName}` : 'Final Chapter'}
          </p>
        </div>

        {/* Next Chapter Button */}
        <button
          onClick={() => {
            playChimeSound(700, 0.2);
            onNext();
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#9e2a2b] via-[#d81e5b] to-[#f4d068] text-white text-xs font-bold shadow-lg shadow-[#9e2a2b]/50 hover:brightness-110 active:scale-95 transition-all"
        >
          <span>{currentChapter === totalChapters - 1 ? 'Replay Journey' : 'Continue'}</span>
          {currentChapter === totalChapters - 1 ? (
            <Sparkles className="w-4 h-4 text-[#f4d068]" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
