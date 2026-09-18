import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Gift, CheckCircle } from 'lucide-react';
import type { FinalSurpriseConfig } from '../../types/config';
import { playFanfareSound, playChimeSound } from '../../utils/audio';

interface FinalSurpriseProps {
  surprise: FinalSurpriseConfig;
  recipientName: string;
}

export const FinalSurprise: React.FC<FinalSurpriseProps> = ({ surprise, recipientName }) => {
  const [isOpened, setIsOpened] = useState(false);
  const [redeemedVouchers, setRedeemedVouchers] = useState<string[]>([]);

  const handleOpenGiftBox = () => {
    playFanfareSound();
    setIsOpened(true);

    const count = 180;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#d88c80', '#faf5ed', '#360e12', '#ffffff'],
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  };

  const toggleRedeemVoucher = (id: string) => {
    playChimeSound(650, 0.2);
    if (redeemedVouchers.includes(id)) {
      setRedeemedVouchers(redeemedVouchers.filter((v) => v !== id));
    } else {
      setRedeemedVouchers([...redeemedVouchers, id]);
    }
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
        CHAPTER EIGHT — FINAL SURPRISE
      </motion.p>

      {/* Main Title */}
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-editorial text-4xl sm:text-6xl font-normal text-[#faf5ed] tracking-tight leading-tight text-center max-w-xl mb-12"
      >
        {surprise.title}
      </motion.h2>

      <div className="w-full max-w-xl mx-auto text-center">
        <AnimatePresence mode="wait">
          {!isOpened ? (
            /* UNOPENED GIFT BOX */
            <motion.div
              key="unopened-gift"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={handleOpenGiftBox}
              className="bg-[#1e080b] p-10 sm:p-14 border border-rose-copper/30 rounded-2xl shadow-2xl cursor-pointer group max-w-md mx-auto"
            >
              <div className="w-20 h-20 rounded-full border border-rose-copper/40 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Gift className="w-8 h-8 text-rose-copper" />
              </div>

              <h3 className="font-editorial text-2xl text-[#faf5ed] font-normal mb-2">
                {surprise.giftBoxTitle}
              </h3>
              <p className="text-xs text-[#faf5ed]/60 font-sans-clean mb-8">
                Tap to unwrap your final gift
              </p>

              <button className="btn-cream-pill px-8 py-3 text-xs tracking-wider">
                UNWRAP GIFT 🎁
              </button>
            </motion.div>
          ) : (
            /* OPENED SURPRISE */
            <motion.div
              key="opened-surprise"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#1e080b] p-8 sm:p-12 border border-rose-copper/40 rounded-2xl shadow-2xl text-center"
            >
              <p className="text-[10px] uppercase font-sans-clean tracking-[0.25em] text-rose-copper font-semibold mb-2">
                HAPPY BIRTHDAY {recipientName.toUpperCase()}!
              </p>

              <h3 className="font-editorial text-4xl sm:text-5xl font-normal text-[#faf5ed] mb-4">
                {surprise.surpriseTitle}
              </h3>

              <p className="text-sm sm:text-base text-[#faf5ed]/80 font-sans-clean font-light leading-relaxed mb-8">
                "{surprise.surpriseMessage}"
              </p>

              {/* Final Message Card */}
              <div className="mt-8 pt-8 border-t border-white/10 text-left">
                <div className={`grid gap-4 ${surprise.vouchers.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 sm:grid-cols-3'}`}>
                  {surprise.vouchers.map((v) => {
                    const isRedeemed = redeemedVouchers.includes(v.id);

                    return (
                      <div
                        key={v.id}
                        onClick={() => toggleRedeemVoucher(v.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isRedeemed
                            ? 'bg-[#360e12] border-rose-copper shadow-md'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono text-rose-copper font-bold">
                            {v.expiry}
                          </span>
                          {isRedeemed && <CheckCircle className="w-4 h-4 text-rose-copper" />}
                        </div>
                        <h5 className="font-editorial text-lg text-white mb-1">{v.title}</h5>
                        <p className="text-xs text-white/70 font-sans-clean leading-relaxed">
                          {v.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
