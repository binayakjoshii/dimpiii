export interface MemoryItem {
  id: string;
  title: string;
  date: string;
  location?: string;
  photoUrl: string;
  description: string;
  tag?: string;
}

export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  description: string;
  photoUrl?: string;
  iconName: 'heart' | 'message' | 'camera' | 'star' | 'smile' | 'gift' | 'sparkles';
  highlight?: boolean;
}

export interface LoveReason {
  id: number;
  reason: string;
  category?: string;
  icon?: string;
}

export interface LoveLetterConfig {
  sender: string;
  recipient: string;
  date: string;
  title: string;
  paragraphs: string[];
  signature: string;
  postscript?: string;
}

export interface SongConfig {
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string; // URL to mp3 or streaming audio file
  lyricsExcerpt?: string[];
  personalNote: string;
}

export interface LoveVoucher {
  id: string;
  title: string;
  description: string;
  icon: string;
  expiry: string;
}

export interface FinalSurpriseConfig {
  title: string;
  subtitle: string;
  giftBoxTitle: string;
  surpriseTitle: string;
  surpriseMessage: string;
  photoUrl: string;
  videoUrl?: string;
  vouchers: LoveVoucher[];
}

export interface BirthdayGiftConfig {
  recipientName: string;
  partnerName: string;
  birthdayDate: string; // e.g. "2026-09-20"
  openingScreen: {
    title: string;
    subtitle: string;
    buttonText: string;
  };
  birthdayReveal: {
    greeting: string;
    subtitle: string;
    quote: string;
  };
  memories: MemoryItem[];
  timeline: TimelineItem[];
  reasons: LoveReason[];
  loveLetter: LoveLetterConfig;
  music: SongConfig;
  finalSurprise: FinalSurpriseConfig;
}
