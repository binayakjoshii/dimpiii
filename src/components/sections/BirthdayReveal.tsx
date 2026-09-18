import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { playChimeSound } from '../../utils/audio';

interface BirthdayRevealProps {
  greeting: string;
  subtitle: string;
  quote: string; // "Dimpi"
  birthdayDate: string;
  recipientName: string;
  onNext?: () => void;
}

export const BirthdayReveal: React.FC<BirthdayRevealProps> = ({
  subtitle,
  recipientName,
  onNext,
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-6 text-center z-10 py-16 bg-burgundy-dark">
      {/* Category Subtitle */}
      <motion.p
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-[11px] uppercase tracking-[0.25em] text-rose-copper font-sans-clean font-semibold mb-6"
      >
        TODAY, AND EVERY DAY
      </motion.p>

      {/* Main Title Matching Screenshot 2: Happy Birthday, Dimpi */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="font-editorial text-5xl sm:text-7xl md:text-8xl font-normal text-[#faf5ed] tracking-tight leading-tight">
          Happy
        </h2>
        <h2 className="font-editorial text-5xl sm:text-7xl md:text-8xl font-normal text-[#faf5ed] tracking-tight leading-tight">
          Birthday,
        </h2>
        <h3 className="font-script-rose text-6xl sm:text-8xl md:text-9xl text-rose-copper mt-1 leading-none font-normal">
          {recipientName}
        </h3>
      </motion.div>

      {/* Subtitle Message Matching Screenshot 2 */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="text-sm sm:text-base md:text-lg text-[#faf5ed]/80 max-w-md font-sans-clean font-light leading-relaxed mb-12"
      >
        {subtitle}
      </motion.p>

      {/* Begin Our Story Button (Matches Screenshot 2) */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <button
          onClick={() => {
            playChimeSound(650, 0.2);
            if (onNext) onNext();
          }}
          className="btn-bordered-pill px-8 py-3.5 text-xs sm:text-sm font-sans-clean tracking-wider flex items-center gap-2"
        >
          <span>Begin our story</span>
          <ArrowDown className="w-4 h-4 text-rose-copper" />
        </button>
      </motion.div>
    </div>
  );
};
