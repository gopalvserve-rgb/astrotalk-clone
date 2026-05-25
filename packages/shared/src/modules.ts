// =====================================================================
//  Module registry — every feature in the platform lives here.
//  Admin can toggle each module per tenant. When disabled:
//   • UI is hidden
//   • API routes return 403
//   • Wallet is not deducted
// =====================================================================

export type ModuleKey =
  | "chat_with_astrologer"
  | "call_with_astrologer"
  | "video_call"
  | "ai_kundali_reading"
  | "ai_astrology"
  | "ai_numerology"
  | "ai_vastu"
  | "ai_business_name"
  | "face_reading"
  | "palm_reading"
  | "tarot_reading"
  | "meditation_mantra"
  | "book_pooja"
  | "live_darshan"
  | "live_shop"
  | "sewa"
  | "yatra_booking"
  | "panchang"
  | "free_kundli"
  | "kundli_matching"
  | "compatibility"
  | "calculators"
  | "horoscope"
  | "wallet"
  | "session_history"
  | "blog"
  | "pandit_management";

export type DashboardTab = "astrology" | "numerology" | "vastu";

export interface ModuleMeta {
  key: ModuleKey;
  label: string;
  description: string;
  tab: DashboardTab | "shared";
  icon: string;
  defaultOn: boolean;
  route?: string;
  apiPrefix?: string;
}

export const MODULES: Record<ModuleKey, ModuleMeta> = {
  // ---------- Consultation ----------
  chat_with_astrologer: {
    key: "chat_with_astrologer",
    label: "Chat with Astrologer",
    description: "Per-minute chat with real or AI astrologers",
    tab: "astrology", icon: "💬", defaultOn: true,
    route: "/chat-with-astrologer", apiPrefix: "/api/chat",
  },
  call_with_astrologer: {
    key: "call_with_astrologer",
    label: "Call with Astrologer",
    description: "Voice calls with astrologers",
    tab: "astrology", icon: "📞", defaultOn: true,
    route: "/talk-to-astrologer", apiPrefix: "/api/call",
  },
  video_call: {
    key: "video_call",
    label: "Video Call",
    description: "Video consultation",
    tab: "astrology", icon: "🎥", defaultOn: false,
  },

  // ---------- AI features ----------
  ai_kundali_reading: {
    key: "ai_kundali_reading",
    label: "AI Kundali Reading",
    description: "AI-generated Vedic kundali reading", tab: "astrology",
    icon: "📜", defaultOn: true, route: "/ai/kundali",
  },
  ai_astrology: {
    key: "ai_astrology", label: "AI Astrology Chat",
    description: "Fallback AI astrologer", tab: "astrology",
    icon: "🤖", defaultOn: true, route: "/ai/astrology",
  },
  ai_numerology: {
    key: "ai_numerology", label: "AI Numerology",
    description: "AI-generated numerology reports", tab: "numerology",
    icon: "🔢", defaultOn: true, route: "/ai/numerology",
  },
  ai_vastu: {
    key: "ai_vastu", label: "AI Vastu Consultation",
    description: "AI-generated Vastu analysis", tab: "vastu",
    icon: "🏠", defaultOn: true, route: "/ai/vastu",
  },
  ai_business_name: {
    key: "ai_business_name", label: "Business / Baby Name AI",
    description: "Generate auspicious names", tab: "numerology",
    icon: "✨", defaultOn: true, route: "/ai/name-generator",
  },
  face_reading: {
    key: "face_reading", label: "Face Reading",
    description: "Upload selfie → AI face reading (Gemini Vision)",
    tab: "astrology", icon: "👤", defaultOn: true, route: "/face-reading",
  },
  palm_reading: {
    key: "palm_reading", label: "Palm Reading",
    description: "Upload palm photo → AI palm reading",
    tab: "astrology", icon: "🖐", defaultOn: true, route: "/palm-reading",
  },
  tarot_reading: {
    key: "tarot_reading", label: "Tarot Reading",
    description: "Tarot card draw + AI interpretation",
    tab: "astrology", icon: "🃏", defaultOn: true, route: "/tarot",
  },

  // ---------- Free tools / calculators ----------
  free_kundli: {
    key: "free_kundli", label: "Free Kundli",
    description: "Generate free Vedic birth chart", tab: "astrology",
    icon: "🔮", defaultOn: true, route: "/free-kundli",
  },
  kundli_matching: {
    key: "kundli_matching", label: "Kundli Matching",
    description: "36-guna match-making", tab: "astrology",
    icon: "💞", defaultOn: true, route: "/matchmaking",
  },
  compatibility: {
    key: "compatibility", label: "Compatibility",
    description: "Zodiac compatibility checker", tab: "astrology",
    icon: "♈", defaultOn: true, route: "/compatibility",
  },
  calculators: {
    key: "calculators", label: "Calculators",
    description: "Numerology, vastu, muhurat, dasha calculators",
    tab: "shared", icon: "🧮", defaultOn: true, route: "/calculators",
  },
  panchang: {
    key: "panchang", label: "Panchang & Muhurat",
    description: "Daily panchang + shubh muhurat", tab: "astrology",
    icon: "📅", defaultOn: true, route: "/panchang",
  },
  horoscope: {
    key: "horoscope", label: "Horoscopes",
    description: "Daily/weekly/monthly/yearly horoscopes",
    tab: "astrology", icon: "🌟", defaultOn: true, route: "/horoscope",
  },

  // ---------- Lifestyle ----------
  meditation_mantra: {
    key: "meditation_mantra", label: "Meditation & Mantra",
    description: "Guided meditations + mantra library",
    tab: "shared", icon: "🕉", defaultOn: true, route: "/meditation",
  },
  book_pooja: {
    key: "book_pooja", label: "Book a Pooja",
    description: "Schedule pooja with a pandit", tab: "shared",
    icon: "🪔", defaultOn: true, route: "/pooja",
  },
  live_darshan: {
    key: "live_darshan", label: "Live Darshan",
    description: "Live temple streams + uploaded streams",
    tab: "shared", icon: "📺", defaultOn: true, route: "/darshan",
  },
  live_shop: {
    key: "live_shop", label: "Live Shop",
    description: "Gemstones, yantras, rudraksha, etc.",
    tab: "shared", icon: "🛍", defaultOn: true, route: "/shop",
  },
  sewa: {
    key: "sewa", label: "Sewa",
    description: "Ann daan, pashu sewa, mandir, vastra donations",
    tab: "shared", icon: "🤲", defaultOn: true, route: "/sewa",
  },
  yatra_booking: {
    key: "yatra_booking", label: "Yatra Booking",
    description: "Pilgrim yatra bookings", tab: "shared",
    icon: "🛕", defaultOn: true, route: "/yatra",
  },

  // ---------- Platform ----------
  wallet: {
    key: "wallet", label: "Wallet",
    description: "Recharge + transaction history (Cashfree)",
    tab: "shared", icon: "💰", defaultOn: true, route: "/wallet",
  },
  session_history: {
    key: "session_history", label: "Session History",
    description: "User's past consultations + reports",
    tab: "shared", icon: "🗂", defaultOn: true, route: "/history",
  },
  blog: {
    key: "blog", label: "Blog & Articles",
    description: "Astrology / numerology / vastu articles",
    tab: "shared", icon: "📰", defaultOn: true, route: "/blog",
  },
  pandit_management: {
    key: "pandit_management", label: "Pandit Management (admin)",
    description: "Admin can add real + AI pandits", tab: "shared",
    icon: "🧑‍🦳", defaultOn: true,
  },
};

export const MODULE_KEYS = Object.keys(MODULES) as ModuleKey[];

export function modulesByTab(tab: DashboardTab): ModuleMeta[] {
  return Object.values(MODULES).filter((m) => m.tab === tab || m.tab === "shared");
}
