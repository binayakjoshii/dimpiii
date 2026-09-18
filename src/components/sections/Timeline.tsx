import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import type { TimelineItem } from '../../types/config';
import { playChimeSound } from '../../utils/audio';

interface TimelineProps {
  items: TimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);

  const toggleItem = (id: string) => {
    playChimeSound(600, 0.15);
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative px-6 py-24 bg-[#2b0c10] text-[#faf5ed]">
      {/* Chapter Label (Matches Screenshot 4) */}
      <motion.p
        initial={{ y: 15, opacity: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-[11px] uppercase tracking-[0.25em] text-rose-copper font-sans-clean font-semibold mb-3 text-center"
      >
        CHAPTER FOUR — OUR STORY
      </motion.p>

      {/* Main Title (Matches Screenshot 4) */}
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-editorial text-4xl sm:text-6xl font-normal text-[#faf5ed] tracking-tight leading-tight text-center max-w-xl mb-16"
      >
        How we became us
      </motion.h2>

      {/* Accordion List (Matches Screenshot 4) */}
      <div className="w-full max-w-xl mx-auto divide-y divide-white/10">
        {items.map((item, index) => {
          const isOpen = openId === item.id;
          const formattedNum = (index + 1) < 10 ? `0${index + 1}` : `${index + 1}`;

          return (
            <div key={item.id} className="py-6 transition-colors">
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-6">
                  {/* Number 01, 02 */}
                  <span className="font-editorial text-lg sm:text-xl text-rose-copper/80 group-hover:text-rose-copper transition-colors">
                    {formattedNum}
                  </span>

                  {/* Title */}
                  <h3 className="font-editorial text-2xl sm:text-3xl text-[#faf5ed] font-normal group-hover:text-rose-copper transition-colors">
                    {item.title}
                  </h3>
                </div>

                {/* Plus / Cross Icon */}
                <div className="text-white/60 group-hover:text-white transition-colors ml-4">
                  {isOpen ? <X className="w-5 h-5 text-rose-copper" /> : <Plus className="w-5 h-5 text-white/50" />}
                </div>
              </button>

              {/* Accordion Expanded Content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 pl-12 pr-4 space-y-3">
                      <p className="text-sm sm:text-base font-sans-clean font-light text-[#faf5ed]/80 leading-relaxed">
                        {item.description}
                      </p>
                      {item.photoUrl && (
                        <div className="rounded-xl overflow-hidden border border-white/20 shadow-lg mt-3 bg-black/40 p-1 flex justify-center">
                          <img
                            src={item.photoUrl}
                            alt={item.title}
                            loading="lazy"
                            decoding="async"
                            className="max-h-64 sm:max-h-72 w-auto max-w-full object-contain rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
