import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, RefreshCw } from 'lucide-react';
import type { LoveLetterConfig } from '../../types/config';
import { playEnvelopeSound, playChimeSound } from '../../utils/audio';

interface LoveLetterProps {
  letter: LoveLetterConfig;
  recipientName: string;
}

export const LoveLetter: React.FC<LoveLetterProps> = ({ letter, recipientName }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenEnvelope = () => {
    playEnvelopeSound();
    setIsOpen(true);
  };

  const handleReseal = () => {
    playChimeSound(400, 0.2);
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative px-6 py-24 bg-[#2b0c10] text-[#faf5ed]">
      {/* Chapter Label */}
      <motion.p
        initial={{ y: 15, opacity: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-[11px] uppercase tracking-[0.25em] text-rose-copper font-sans-clean font-semibold mb-3 text-center"
      >
        CHAPTER SIX — A LETTER FOR DIMPI
      </motion.p>

      {/* Main Title */}
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-editorial text-4xl sm:text-6xl font-normal text-[#faf5ed] tracking-tight leading-tight text-center max-w-xl mb-12"
      >
        A letter for {recipientName}
      </motion.h2>

      <div className="w-full max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          {!isOpen ? (
            /* CLOSED ENVELOPE */
            <motion.div
              key="closed-envelope"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={handleOpenEnvelope}
              className="bg-[#1e080b] p-10 sm:p-14 text-center cursor-pointer border border-rose-copper/30 rounded-2xl shadow-2xl relative overflow-hidden group max-w-md mx-auto"
            >
              <div className="w-16 h-16 rounded-full border border-rose-copper/40 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 text-rose-copper" />
              </div>

              <p className="text-[10px] uppercase font-sans-clean tracking-[0.25em] text-rose-copper font-semibold mb-2">
                PERSONAL & CONFIDENTIAL
              </p>

              <h3 className="font-editorial text-3xl text-[#faf5ed] font-normal mb-2">
                To {recipientName}
              </h3>
              <p className="text-xs text-[#faf5ed]/60 font-sans-clean font-light mb-8">
                Tap to unseal and read your letter
              </p>

              <button className="btn-bordered-pill px-6 py-2.5 text-xs font-sans-clean tracking-wider">
                Unseal Letter
              </button>
            </motion.div>
          ) : (
            /* OPENED LETTER ON CREAM PARCHMENT */
            <motion.div
              key="opened-letter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-cream-warm text-[#360e12] rounded-2xl p-8 sm:p-12 shadow-2xl border border-[#e2cbb8] relative overflow-hidden text-left"
            >
              <div className="flex items-center justify-between border-b border-[#e2cbb8] pb-4 mb-6">
                <p className="text-[10px] uppercase font-sans-clean tracking-[0.2em] font-semibold text-[#a35248]">
                  DATE: {letter.date}
                </p>

                <button
                  onClick={handleReseal}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#360e12]/10 hover:bg-[#360e12]/20 text-[#360e12] text-xs font-sans-clean font-medium transition-all"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reseal</span>
                </button>
              </div>

              <h3 className="font-editorial text-3xl sm:text-4xl text-[#360e12] font-normal mb-6">
                {letter.title}
              </h3>

              <div className="space-y-4 font-sans-clean text-sm sm:text-base text-[#360e12]/90 leading-relaxed font-light">
                {letter.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-[#e2cbb8] flex flex-col items-end">
                <p className="font-script-rose text-3xl text-[#90443d]">{letter.signature}</p>
                <p className="font-editorial text-xl font-normal text-[#360e12] mt-1">
                  {letter.sender}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
