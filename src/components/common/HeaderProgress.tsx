import React, { useState } from 'react';
import { Music, Volume2, VolumeX, List, X, Sparkles } from 'lucide-react';
import { playChimeSound } from '../../utils/audio';

interface HeaderProgressProps {
  activeChapter: number;
  totalChapters: number;
  chapters: { id: string; name: string }[];
  onSelectChapter: (index: number) => void;
  isPlayingMusic: boolean;
  onToggleMusic: () => void;
  recipientName: string;
}

export const HeaderProgress: React.FC<HeaderProgressProps> = ({
  activeChapter,
  totalChapters,
  chapters,
  onSelectChapter,
  isPlayingMusic,
  onToggleMusic,
  recipientName,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const progressPercent = Math.min(Math.round(((activeChapter + 1) / totalChapters) * 100), 100);

  return (
    <>
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 px-4 py-3 bg-[#150507]/80 backdrop-blur-md border-b border-white/5 transition-all">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Left: Recipient Name */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-widest text-rose-copper uppercase bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {recipientName}'s Birthday ✨
            </span>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                playChimeSound(600, 0.2);
                onToggleMusic();
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-sans-clean font-medium transition-all ${
                isPlayingMusic
                  ? 'bg-rose-copper text-[#2b0c10] font-semibold'
                  : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isPlayingMusic ? 'Music On ♪' : 'Music Off'}</span>
              {isPlayingMusic ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-50" />}
            </button>

            <button
              onClick={() => {
                playChimeSound(450, 0.15);
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 transition-all"
              title="Chapters Menu"
            >
              {isMenuOpen ? <X className="w-4 h-4 text-rose-copper" /> : <List className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Top Slim Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden">
          <div
            className="h-full bg-rose-copper transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Chapters Overlay Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1e080b] border border-rose-copper/30 rounded-2xl p-6 shadow-2xl relative text-[#faf5ed]">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-white/60 hover:text-white rounded-full bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-editorial text-2xl font-normal mb-1">
              Dimpi's Birthday Chapters
            </h3>
            <p className="text-xs text-white/60 mb-6 font-sans-clean">
              Select any section to jump directly to that part.
            </p>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {chapters.map((chap, idx) => (
                <button
                  key={chap.id}
                  onClick={() => {
                    playChimeSound(500 + idx * 50, 0.2);
                    onSelectChapter(idx);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all ${
                    activeChapter === idx
                      ? 'bg-rose-copper text-[#2b0c10] font-semibold shadow-lg'
                      : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold">{idx + 1}</span>
                    <span className="text-sm font-sans-clean">{chap.name}</span>
                  </div>
                  {activeChapter === idx && <Sparkles className="w-4 h-4 text-[#2b0c10]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
