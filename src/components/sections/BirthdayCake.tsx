import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Mic, Sparkles, CheckCircle2 } from 'lucide-react';
import { playFanfareSound, playChimeSound } from '../../utils/audio';

interface BirthdayCakeProps {
  recipientName: string;
}

export const BirthdayCake: React.FC<BirthdayCakeProps> = ({ recipientName }) => {
  const [isBlownOut, setIsBlownOut] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [micDenied, setMicDenied] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Microphone Blow Detection Setup
  const startMicDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setIsListeningMic(true);
      setMicDenied(false);

      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkBlow = () => {
        if (isBlownOut) return;
        analyser.getByteFrequencyData(dataArray);

        // Calculate average volume / energy level across frequencies
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;

        // High frequency blowing sound threshold
        if (average > 55) {
          triggerBlowOut();
          stopMic();
          return;
        }

        requestAnimationFrame(checkBlow);
      };

      checkBlow();
    } catch {
      setMicDenied(true);
      setIsListeningMic(false);
    }
  };

  const stopMic = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsListeningMic(false);
  };

  const triggerBlowOut = () => {
    if (isBlownOut) return;
    playFanfareSound();
    setIsBlownOut(true);

    // Confetti burst
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#d88c80', '#faf5ed', '#360e12', '#ffffff'],
    });
  };

  useEffect(() => {
    return () => {
      stopMic();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative px-6 py-24 bg-cream-warm text-[#360e12]">
      {/* Chapter Label */}
      <motion.p
        initial={{ y: 15, opacity: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-[11px] uppercase tracking-[0.25em] text-[#90443d] font-sans-clean font-semibold mb-3 text-center"
      >
        CHAPTER TWO — MAKE A WISH
      </motion.p>

      {/* Main Title */}
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-editorial text-4xl sm:text-6xl font-normal text-[#360e12] tracking-tight leading-tight text-center max-w-xl mb-2"
      >
        Blow out the candle, {recipientName}
      </motion.h2>

      <p className="text-xs sm:text-sm font-sans-clean text-[#593438] text-center mb-10 max-w-md font-light">
        {isBlownOut
          ? 'Your birthday wish has been made! ✨'
          : 'Blow into your microphone or tap the candle flame to blow it out.'}
      </p>

      {/* Birthday Cake Artwork */}
      <div className="relative my-8 flex flex-col items-center">
        {/* Candle & Flame */}
        <div className="relative flex flex-col items-center cursor-pointer group" onClick={triggerBlowOut}>
          {/* Flame Container */}
          <AnimatePresence>
            {!isBlownOut ? (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: [1, 1.15, 1], rotate: [-2, 2, -2] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                className="relative mb-1"
                title="Tap to blow out candle"
              >
                {/* Glowing Aura */}
                <div className="absolute -inset-2 rounded-full bg-amber-400/40 blur-md animate-pulse" />
                {/* SVG Flame */}
                <svg width="24" height="36" viewBox="0 0 24 36" fill="none" className="relative z-10 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">
                  <path
                    d="M12 0C12 0 24 14 24 24C24 30.6274 18.6274 36 12 36C5.37258 36 0 30.6274 0 24C0 14 12 0 12 0Z"
                    fill="url(#flameGrad)"
                  />
                  <path
                    d="M12 10C12 10 18 18 18 24C18 27.3137 15.3137 30 12 30C8.68629 30 6 27.3137 6 24C6 18 12 10 12 10Z"
                    fill="#FFF"
                    opacity="0.9"
                  />
                  <defs>
                    <linearGradient id="flameGrad" x1="12" y1="0" x2="12" y2="36" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#F59E0B" />
                      <stop offset="0.6" stopColor="#EF4444" />
                      <stop offset="1" stopColor="#D97706" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            ) : (
              /* Smoke Wisps after candle is blown out */
              <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 0.8, 0], y: -30 }}
                transition={{ duration: 2, repeat: 2 }}
                className="h-8 flex flex-col items-center mb-1"
              >
                <div className="w-1.5 h-6 bg-gray-400/40 rounded-full blur-[1px]" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Candle Stick */}
          <div className="w-4 h-16 bg-gradient-to-r from-[#d88c80] via-[#faf5ed] to-[#d88c80] rounded-t-sm shadow-md border-x border-[#360e12]/20 relative z-10" />
        </div>

        {/* 2-Tiered Birthday Cake */}
        <div className="w-48 sm:w-56 flex flex-col items-center -mt-1">
          {/* Top Tier */}
          <div className="w-36 sm:w-44 h-16 bg-gradient-to-b from-[#ffffff] to-[#faf5ed] rounded-t-xl border-t-4 border-[#360e12] relative flex items-center justify-center shadow-md">
            {/* Frosting Drips */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-[#360e12] rounded-b-lg opacity-90" />
            <div className="text-[10px] font-sans-clean font-semibold uppercase tracking-widest text-[#90443d] mt-3">
              FOR {recipientName.toUpperCase()}
            </div>
          </div>

          {/* Bottom Tier */}
          <div className="w-48 sm:w-56 h-20 bg-gradient-to-b from-[#360e12] to-[#260a0e] rounded-t-2xl rounded-b-lg border-t-4 border-[#d88c80] relative flex items-center justify-center shadow-xl">
            <div className="text-xs font-serif-heading italic text-[#faf5ed]/80">
              Happy Birthday ✨
            </div>
          </div>

          {/* Plate Stand */}
          <div className="w-56 sm:w-64 h-3 bg-[#d6c4b2] rounded-full shadow-lg border-t border-white/40 mt-0.5" />
        </div>
      </div>

      {/* Mic Detection Controls & Manual Fallback Button */}
      <div className="mt-8 flex flex-col items-center gap-3">
        {!isBlownOut ? (
          <>
            {!isListeningMic ? (
              <button
                onClick={() => {
                  playChimeSound(600, 0.2);
                  startMicDetection();
                }}
                className="btn-bordered-pill px-6 py-2.5 text-xs text-[#360e12] border-[#360e12]/30 hover:bg-[#360e12]/10 flex items-center gap-2"
              >
                <Mic className="w-4 h-4 text-[#90443d]" />
                <span>Enable Microphone To Blow</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-[#90443d] font-sans-clean font-medium animate-pulse">
                <Mic className="w-4 h-4 text-emerald-600" />
                <span>Microphone Active — Blow into your mic now!</span>
              </div>
            )}

            {/* Tap Blow Fallback Button */}
            <button
              onClick={() => {
                playChimeSound(700, 0.2);
                triggerBlowOut();
              }}
              className="bg-[#360e12] text-white px-8 py-3 rounded-full text-xs font-sans-clean font-semibold tracking-wider hover:bg-[#4a141a] transition-all shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#d88c80]" />
              <span>Tap Here To Blow Candle 🕯️</span>
            </button>

            {micDenied && (
              <p className="text-[11px] text-[#90443d]/80 font-sans-clean">
                (Microphone permission not granted — tap the button above to blow out the candle!)
              </p>
            )}
          </>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-600/30 text-emerald-800 text-xs font-sans-clean font-semibold shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Candle Blown Out! Wish Recorded ✨</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};
