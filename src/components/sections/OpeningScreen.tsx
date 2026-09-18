import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Gift } from 'lucide-react';
import { playChimeSound } from '../../utils/audio';

interface OpeningScreenProps {
  title: string;
  subtitle: string;
  buttonText: string;
  recipientName: string;
  onOpenGift: () => void;
}

export const OpeningScreen: React.FC<OpeningScreenProps> = ({
  title,
  subtitle,
  buttonText,
  onOpenGift,
}) => {
  const handleStart = () => {
    playChimeSound(600, 0.4);
    onOpenGift();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-6 text-center z-10 py-16 bg-burgundy-dark">
      {/* Top Thin Circle with Heart Icon (Matches Screenshot 1) */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-10"
      >
        <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mx-auto">
          <Heart className="w-6 h-6 text-white/80 stroke-[1.5]" />
        </div>
      </motion.div>

      {/* Uppercase Category Subtitle */}
      <motion.p
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-[11px] uppercase tracking-[0.25em] text-rose-copper font-sans-clean font-semibold mb-6"
      >
        FOR ONE VERY SPECIAL PERSON
      </motion.p>

      {/* High-Contrast Luxury Serif Headline */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="font-editorial text-4xl sm:text-6xl md:text-7xl font-normal text-[#faf5ed] tracking-tight leading-[1.15] max-w-2xl mb-6"
      >
        {title}
      </motion.h1>

      {/* Subtitle Message */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="text-sm sm:text-base text-[#faf5ed]/70 max-w-md font-sans-clean font-light leading-relaxed mb-12"
      >
        {subtitle}
      </motion.p>

      {/* Cream Pill Button (Matches Screenshot 1) */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <button
          onClick={handleStart}
          className="btn-cream-pill inline-flex items-center gap-3 px-8 py-4 text-xs sm:text-sm font-semibold tracking-wider shadow-2xl"
        >
          <Gift className="w-4 h-4 text-[#2b0c10]" />
          <span>{buttonText}</span>
        </button>
      </motion.div>
    </div>
  );
};
