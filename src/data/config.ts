import type { BirthdayGiftConfig } from '../types/config';

/**
 * CENTRALIZED BIRTHDAY CONFIGURATION FOR DIMPI & BINAYAK
 * Edit any text, dates, photos, memories, reasons, letter, song or surprise details below!
 */
export const birthdayConfig: BirthdayGiftConfig = {
  recipientName: "Dimpi",
  partnerName: "Binayak",
  birthdayDate: "Today",
  
  openingScreen: {
    title: "I made something special for you...",
    subtitle: "A little corner of the internet, made only for you.",
    buttonText: "OPEN YOUR GIFT",
  },

  birthdayReveal: {
    greeting: "Happy Birthday,",
    subtitle: "Today is a celebration of the light you bring into every room — and every corner of my life.",
    quote: "Dimpi", // Displayed in script typography below "Happy Birthday,"
  },

  memories: [
    {
      id: "mem-1",
      title: "A moment I keep returning to",
      date: "SPECIAL MEMORY",
      location: "With Dimpi",
      photoUrl: "/dimpi_video_2.mp4",
      description: "A cute little moment captured that always brings a warm smile to my heart.",
      tag: "Memory 01"
    }
  ],

  timeline: [
    {
      id: "tl-1",
      date: "01",
      title: "The day we met",
      subtitle: "Happiest day of my life",
      description: "Happiest day of my life",
      photoUrl: "/pic1.jpeg",
      iconName: "sparkles",
      highlight: true
    },
    {
      id: "tl-2",
      date: "02",
      title: "Our first real conversation",
      subtitle: "After our first date ended",
      description: "That unforgettable conversation we had right after our very first date ended.",
      iconName: "message"
    },
    {
      id: "tl-3",
      date: "03",
      title: "Our first photograph",
      subtitle: "A memory captured",
      description: "You were saying 'isko post karo na karoooo naaa' hehe you were so cute!",
      photoUrl: "/pic2.jpeg",
      iconName: "camera"
    },
    {
      id: "tl-4",
      date: "04",
      title: "Today",
      subtitle: "Happy Birthday, Dimpi",
      description: "Celebrating you today, Dimpi—wishing you peace, genuine happiness, and all the warm smiles in the world.",
      iconName: "star",
      highlight: true
    }
  ],

  reasons: [
    { id: 1, reason: "Your eyes are too pretty to ever forget them.", category: "REASON 01" },
    { id: 2, reason: "Your smile lights up my entire day.", category: "REASON 02" },
    { id: 3, reason: "The way you talk calms my mind.", category: "REASON 03" },
    { id: 4, reason: "The way you make me feel special heals my inner child.", category: "REASON 04" },
    { id: 5, reason: "You are cute in every single possible way.", category: "REASON 05" },
    { id: 6, reason: "They say the moon is the prettiest... I say I got my own moon in the form of you.", category: "REASON 06" },
    { id: 7, reason: "Your presence brings warmth to every quiet moment.", category: "REASON 07" },
    { id: 8, reason: "The gentle kindness you show in everything you do.", category: "REASON 08" },
    { id: 9, reason: "Knowing you has made my world so much brighter.", category: "REASON 09" },
    { id: 10, reason: "Simply because you are Dimpi—one of a kind.", category: "REASON 10" }
  ],

  loveLetter: {
    sender: "Binayak",
    recipient: "Dimpi",
    date: "Today",
    title: "Dear Dimpi,",
    paragraphs: [
      "hiee dimpi i hope youre fine and good i made this while we were all good and happie but yeah anyways i still wanted to complete this and send it to you",
      "so yea i have been coding all by myself for few days because you know how i am when i am in love but yeah most importantly i want you to be safe good and happie as always",
      "i hope when things get better you can simply remember there was one guy who was there with you and who trusted you that youll get better soon , stay in touch and yes god bless you stay safe and take care of yourself always and if someday you feel like not good then just give me a call hopefully !! yea thats it"
    ],
    signature: "Binayak",
    postscript: "P.S. Scroll down to check out the rest of the chapters."
  },

  music: {
    title: "Meri Maya Fula Jasti",
    artist: "Nepali Song",
    album: "Dimpi's Edition",
    coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=800&auto=format&fit=crop",
    audioUrl: "/meri_maya.mp3",
    lyricsExcerpt: [
      "Meri Maya Fula Jasti...",
      "Steps along the way..."
    ],
    personalNote: "Timi ful thiyeu mero"
  },

  finalSurprise: {
    title: "A Final Surprise For Dimpi",
    subtitle: "FOREVER & ALWAYS",
    giftBoxTitle: "Tap to unwrap your final message 🎁",
    surpriseTitle: "Happy Birthday, Dimpi! ✨",
    surpriseMessage: "Thank you for being such an unforgettable part of my life. I will always cherish every laugh, every conversation, and all the plans we made together.",
    photoUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000&auto=format&fit=crop",
    vouchers: [
      {
        id: "v-1",
        title: "✨ Precious Memories & Future Wishes",
        description: "I will remember all the things we planned to do and all those precious memories we made.",
        icon: "Sparkles",
        expiry: "FOREVER & ALWAYS"
      }
    ]
  }
};
