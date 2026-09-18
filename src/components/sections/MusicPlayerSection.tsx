import React from 'react';
import { motion } from 'framer-motion';
import type { SongConfig } from '../../types/config';

interface MusicPlayerSectionProps {
  song: SongConfig;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const MusicPlayerSection: React.FC<MusicPlayerSectionProps> = ({
  song,
}) => {

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative px-6 py-24 bg-cream-warm text-[#360e12]">
      {/* Chapter Label */}
      <motion.p
        initial={{ y: 15, opacity: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-[11px] uppercase tracking-[0.25em] text-[#90443d] font-sans-clean font-semibold mb-3 text-center"
      >
        CHAPTER SEVEN — OUR SONG
      </motion.p>

      {/* Main Title */}
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-editorial text-4xl sm:text-6xl font-normal text-[#360e12] tracking-tight leading-tight text-center max-w-xl mb-12"
      >
        Our Song
      </motion.h2>

      {/* Video & Music Player Card */}
      <div className="w-full max-w-lg mx-auto bg-white p-4 sm:p-6 rounded-2xl border border-[#e8ded1] shadow-xl text-center">
        {/* Video Player Container */}
        <div className="relative w-full aspect-[4/3] sm:aspect-video rounded-xl overflow-hidden shadow-lg border border-[#e2cbb8] bg-black mb-6 group">
          <video
            src="/dimpi_video.mp4"
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="auto"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>

        <p className="text-[10px] font-sans-clean uppercase tracking-[0.2em] font-semibold text-[#a35248] mb-1">
          {song.album || "DIMPI'S EDITION"}
        </p>

        <h3 className="font-editorial text-3xl font-normal text-[#360e12] mb-1">
          {song.title}
        </h3>
        <p className="text-xs font-sans-clean text-[#593438] mb-4">{song.artist}</p>

        {song.personalNote && (
          <p className="text-xs sm:text-sm text-[#593438]/90 font-sans-clean font-light italic mt-4 pt-4 border-t border-[#e2cbb8]">
            "{song.personalNote}"
          </p>
        )}
      </div>
    </div>
  );
};
