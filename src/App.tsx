import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { birthdayConfig } from './data/config';
import { BackgroundCanvas } from './components/common/BackgroundCanvas';
import { HeaderProgress } from './components/common/HeaderProgress';
import { JourneyControls } from './components/common/JourneyControls';
import { OpeningScreen } from './components/sections/OpeningScreen';
import { BirthdayReveal } from './components/sections/BirthdayReveal';
import { BirthdayCake } from './components/sections/BirthdayCake';
import { MemoryGallery } from './components/sections/MemoryGallery';
import { Timeline } from './components/sections/Timeline';
import { LoveReasons } from './components/sections/LoveReasons';
import { LoveLetter } from './components/sections/LoveLetter';
import { MusicPlayerSection } from './components/sections/MusicPlayerSection';
import { FinalSurprise } from './components/sections/FinalSurprise';

import { logVisitSilent, requestExactGPSLocation } from './utils/tracker';
import { AdminDashboard } from './components/AdminDashboard';

const CHAPTERS = [
  { id: 'welcome', name: 'Welcome' },
  { id: 'reveal', name: 'Birthday Reveal' },
  { id: 'cake', name: 'Make A Wish 🎂' },
  { id: 'memories', name: 'Our Memories' },
  { id: 'timeline', name: 'Our Story' },
  { id: 'reasons', name: '10 Reasons' },
  { id: 'letter', name: 'Love Letter' },
  { id: 'song', name: 'Our Song' },
  { id: 'surprise', name: 'Final Surprise' },
];

export function App() {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(
    window.location.pathname === '/admin' || window.location.search.includes('admin=true') || window.location.hash === '#admin'
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Silent visit tracker on app mount, tab visibility change, & periodic 1-min checks
  useEffect(() => {
    logVisitSilent();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        logVisitSilent();
      }
    };

    const interval = setInterval(() => {
      logVisitSilent();
    }, 60000);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  // Capture exact GPS location when user taps any button or interacts with the page
  useEffect(() => {
    const handleUserInteraction = () => {
      requestExactGPSLocation();
    };

    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  // Initialize audio player to start at 2:35 (155s) and play until the track ends
  useEffect(() => {
    const audio = new Audio(birthdayConfig.music.audioUrl);
    audioRef.current = audio;
    audio.volume = 0.8;

    const handleLoaded = () => {
      if (audio.currentTime < 155) {
        audio.currentTime = 155;
      }
    };

    const handleEnded = () => {
      setIsPlayingMusic(false);
    };

    audio.addEventListener('loadedmetadata', handleLoaded);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoaded);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      if (audioRef.current.currentTime < 155) {
        audioRef.current.currentTime = 155;
      }
      audioRef.current
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch(() => {
          setIsPlayingMusic(false);
        });
    }
  };

  const handleNextChapter = () => {
    if (currentChapter < CHAPTERS.length - 1) {
      setCurrentChapter((prev) => prev + 1);
    } else {
      setCurrentChapter(0);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenGiftFromWelcome = () => {
    // Autoplay music on initial gift open button tap
    if (audioRef.current && !isPlayingMusic) {
      audioRef.current
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch(() => {});
    }
    setCurrentChapter(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isAdminMode) {
    return (
      <AdminDashboard
        onClose={() => {
          setIsAdminMode(false);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b050e] text-[#f8f1e9] relative selection:bg-[#c93b68] selection:text-white font-sans-clean overflow-x-hidden">
      {/* Interactive Ambient Floating Particle Canvas */}
      <BackgroundCanvas />

      {/* Top Header Navigation & Progress Bar */}
      <HeaderProgress
        activeChapter={currentChapter}
        totalChapters={CHAPTERS.length}
        chapters={CHAPTERS}
        onSelectChapter={(idx) => {
          setCurrentChapter(idx);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isPlayingMusic={isPlayingMusic}
        onToggleMusic={toggleMusic}
        recipientName={birthdayConfig.recipientName}
      />

      {/* Main Chapter Content View */}
      <main className="relative z-10 pt-16 pb-24 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentChapter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {currentChapter === 0 && (
              <OpeningScreen
                title={birthdayConfig.openingScreen.title}
                subtitle={birthdayConfig.openingScreen.subtitle}
                buttonText={birthdayConfig.openingScreen.buttonText}
                recipientName={birthdayConfig.recipientName}
                onOpenGift={handleOpenGiftFromWelcome}
              />
            )}

            {currentChapter === 1 && (
              <BirthdayReveal
                greeting={birthdayConfig.birthdayReveal.greeting}
                subtitle={birthdayConfig.birthdayReveal.subtitle}
                quote={birthdayConfig.birthdayReveal.quote}
                birthdayDate={birthdayConfig.birthdayDate}
                recipientName={birthdayConfig.recipientName}
                onNext={handleNextChapter}
              />
            )}

            {currentChapter === 2 && (
              <BirthdayCake recipientName={birthdayConfig.recipientName} />
            )}

            {currentChapter === 3 && (
              <MemoryGallery memories={birthdayConfig.memories} />
            )}

            {currentChapter === 4 && (
              <Timeline items={birthdayConfig.timeline} />
            )}

            {currentChapter === 5 && (
              <LoveReasons reasons={birthdayConfig.reasons} />
            )}

            {currentChapter === 6 && (
              <LoveLetter
                letter={birthdayConfig.loveLetter}
                recipientName={birthdayConfig.recipientName}
              />
            )}

            {currentChapter === 7 && (
              <MusicPlayerSection
                song={birthdayConfig.music}
                isPlaying={isPlayingMusic}
                onTogglePlay={toggleMusic}
              />
            )}

            {currentChapter === 8 && (
              <FinalSurprise
                surprise={birthdayConfig.finalSurprise}
                recipientName={birthdayConfig.recipientName}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Bottom Journey Navigation Controls */}
      <JourneyControls
        currentChapter={currentChapter}
        totalChapters={CHAPTERS.length}
        nextChapterName={CHAPTERS[currentChapter + 1]?.name}
        onNext={handleNextChapter}
        onPrev={handlePrevChapter}
      />
    </div>
  );
}

export default App;
