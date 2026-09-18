import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import type { MemoryItem } from '../../types/config';
import { playChimeSound } from '../../utils/audio';

interface MemoryGalleryProps {
  memories: MemoryItem[];
}

export const MemoryGallery: React.FC<MemoryGalleryProps> = ({ memories }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<MemoryItem | null>(null);

  const currentMem = memories[currentIndex];

  const handleNext = () => {
    playChimeSound(550, 0.15);
    setCurrentIndex((prev) => (prev + 1) % memories.length);
  };

  const handlePrev = () => {
    playChimeSound(450, 0.15);
    setCurrentIndex((prev) => (prev - 1 + memories.length) % memories.length);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative px-6 py-20 bg-cream-warm text-[#360e12]">
      {/* Chapter Label (Matches Screenshot 3) */}
      <motion.p
        initial={{ y: 15, opacity: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-[11px] uppercase tracking-[0.25em] text-[#90443d] font-sans-clean font-semibold mb-3 text-center"
      >
        CHAPTER THREE — OUR MEMORIES
      </motion.p>

      {/* Main Title (Matches Screenshot 3) */}
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-editorial text-4xl sm:text-6xl font-normal text-[#360e12] tracking-tight leading-tight text-center max-w-xl mb-12"
      >
        The moments I keep returning to
      </motion.h2>

      {/* Main Photo Card Layout (Matches Screenshot 3) */}
      <div className="w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-3 rounded-2xl shadow-xl border border-[#e8ded1] overflow-hidden group"
          >
            {/* Memory Photo / Video Container */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-[#160c1c] flex items-center justify-center p-2 group rounded-xl">
              {currentMem.photoUrl.endsWith('.mp4') || currentMem.photoUrl.endsWith('.webm') ? (
                <video
                  src={currentMem.photoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  preload="auto"
                  className="max-h-full max-w-full w-auto object-contain rounded-lg shadow-md"
                />
              ) : (
                <>
                  <img
                    src={currentMem.photoUrl}
                    alt={currentMem.title}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full max-w-full w-auto object-contain rounded-lg group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={() => setSelectedPhoto(currentMem)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all"
                    title="View Full Photo"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Memory Details */}
            <div className="pt-5 pb-3 px-2">
              <p className="text-[10px] font-sans-clean uppercase tracking-[0.2em] font-semibold text-[#a35248] mb-1">
                {currentMem.date || 'SPECIAL MEMORY'}
              </p>
              <h3 className="font-editorial text-2xl sm:text-3xl text-[#360e12] font-normal leading-snug mb-2">
                {currentMem.title}
              </h3>
              <p className="text-xs sm:text-sm font-sans-clean font-light text-[#593438] leading-relaxed">
                "{currentMem.description}"
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation (Only if multiple memories) */}
        {memories.length > 1 && (
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handlePrev}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#d6c4b2] text-xs font-sans-clean font-medium text-[#360e12] hover:bg-[#ebdcd0] transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {memories.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    playChimeSound(500, 0.1);
                    setCurrentIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    currentIndex === idx ? 'w-6 bg-[#360e12]' : 'w-2 bg-[#d6c4b2]'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#360e12] text-white text-xs font-sans-clean font-medium hover:bg-[#4a141a] transition-all shadow-md"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-2 right-2 z-10 p-3 rounded-full bg-black/60 hover:bg-black text-white border border-white/20"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedPhoto.photoUrl}
              alt={selectedPhoto.title}
              className="max-h-[70vh] w-auto object-contain rounded-2xl border border-white/20 shadow-2xl mb-4"
            />
            <div className="text-center max-w-xl text-white">
              <h4 className="font-editorial text-2xl font-normal">{selectedPhoto.title}</h4>
              <p className="text-xs text-[#d88c80] mt-1 font-mono uppercase tracking-widest">{selectedPhoto.date}</p>
              <p className="text-sm text-white/80 mt-2 font-sans-clean leading-relaxed">
                {selectedPhoto.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
