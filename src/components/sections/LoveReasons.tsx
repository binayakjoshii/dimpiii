import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LoveReason } from '../../types/config';
import { playPopSound } from '../../utils/audio';

interface LoveReasonsProps {
  reasons: LoveReason[];
}

export const LoveReasons: React.FC<LoveReasonsProps> = ({ reasons }) => {
  const [selectedId, setSelectedId] = useState<number>(1);

  const activeReason = reasons.find((r) => r.id === selectedId) || reasons[0];

  const handleSelect = (id: number) => {
    playPopSound();
    setSelectedId(id);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative px-6 py-24 bg-cream-warm text-[#360e12]">
      {/* Chapter Label (Matches Screenshot 5) */}
      <motion.p
        initial={{ y: 15, opacity: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-[11px] uppercase tracking-[0.25em] text-[#90443d] font-sans-clean font-semibold mb-3 text-center"
      >
        CHAPTER FIVE — 10 REASONS
      </motion.p>

      {/* Main Title (Matches Screenshot 5) */}
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-editorial text-4xl sm:text-6xl font-normal text-[#360e12] tracking-tight leading-tight text-center max-w-xl mb-12"
      >
        A few of the infinite reasons
      </motion.h2>

      {/* Circular Grid 01-10 (Matches Screenshot 5) */}
      <div className="grid grid-cols-5 gap-3 sm:gap-4 max-w-sm sm:max-w-md mx-auto mb-12">
        {reasons.slice(0, 10).map((item) => {
          const isSelected = selectedId === item.id;
          const formattedNum = item.id < 10 ? `0${item.id}` : `${item.id}`;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`circle-num-btn ${isSelected ? 'active' : ''}`}
            >
              {formattedNum}
            </button>
          );
        })}
      </div>

      {/* Divider Line (Matches Screenshot 5) */}
      <div className="w-full max-w-xl mx-auto border-b border-[#e2cbb8] mb-12" />

      {/* Active Reason Display (Matches Screenshot 5) */}
      <div className="w-full max-w-xl mx-auto text-left min-h-[160px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeReason.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
          >
            <p className="text-[11px] uppercase tracking-[0.2em] font-sans-clean font-semibold text-[#a35248] mb-4">
              REASON {activeReason.id < 10 ? `0${activeReason.id}` : activeReason.id}
            </p>
            <p className="font-editorial text-3xl sm:text-5xl text-[#360e12] font-normal leading-[1.25]">
              "{activeReason.reason}"
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
