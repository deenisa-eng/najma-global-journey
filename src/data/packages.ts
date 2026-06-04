// Shared types + helpers

export type BookingType = "study" | "hajj" | "umrah" | "medical" | "travel";

export interface UmrahDeparture {
  id: string;
  depart: string; // ISO
  ret: string;    // ISO
  label: string;  // e.g. "January 2026"
  seatsLeft: number;
}

export const UMRAH_PRICE = 3_000_000;
export const UMRAH_INCLUSIONS = [
  "Umrah Visa",
  "Return Air Ticket (Kano ↔ Jeddah)",
  "Ground Transport in Saudi Arabia",
  "Premium Accommodation (Makkah & Madinah)",
];

export interface UmrahTier {
  id: string;
  tier: "Economy" | "Luxury" | "Premium";
  stars: 4 | 5;
  price: number;
  duration: string;
  totalSeats: number;
  seatsBooked: number;
  highlights: string[];
}

export const UMRAH_TIERS: UmrahTier[] = [
  {
    id: "premium",
    tier: "Premium",
    stars: 5,
    price: 5_500_000,
    duration: "14 Days Makkah & Madinah",
    totalSeats: 15,
    seatsBooked: 3,
    highlights: ["Haram-facing 5★ hotels", "Direct Kano → Jeddah", "Private VIP transfers", "Dedicated scholar"],
  },
  {
    id: "luxury",
    tier: "Luxury",
    stars: 5,
    price: 3_800_000,
    duration: "14 Days Makkah & Madinah",
    totalSeats: 50,
    seatsBooked: 14,
    highlights: ["5★ within 400m of Haram", "Visa & ticketing", "Shared ground transport", "Group scholar"],
  },
  {
    id: "economy",
    tier: "Economy",
    stars: 4,
    price: 3_000_000,
    duration: "14 Days Makkah & Madinah",
    totalSeats: 185,
    seatsBooked: 69,
    highlights: ["4★ central hotels", "Visa processing", "Group transfers", "All meals included"],
  },
];

export const COURSES = [
  { name: "Medicine & Surgery", desc: "Top-ranked medical schools across Europe & Asia", icon: "🩺" },
  { name: "Dentistry", desc: "Accredited dental programs with global recognition", icon: "🦷" },
  { name: "Nursing", desc: "BSc & MSc nursing with NMC-aligned curriculum", icon: "💉" },
  { name: "Physiotherapy", desc: "Hands-on clinical training & internships", icon: "🦴" },
  { name: "Computer Science", desc: "Industry-aligned CS at world-class universities", icon: "💻" },
  { name: "Artificial Intelligence", desc: "Cutting-edge AI & machine learning programs", icon: "🤖" },
  { name: "Engineering", desc: "Mechanical, Civil, Electrical & beyond", icon: "⚙️" },
  { name: "Business Administration", desc: "BBA & MBA from globally recognised schools", icon: "📈" },
  { name: "Economics", desc: "Quantitative & applied economics programs", icon: "💹" },
];

export const COUNTRIES = [
  "United Kingdom", "Canada", "United States", "Germany", "Cyprus", "Turkey",
  "Malaysia", "UAE", "Hungary", "Russia", "China", "Egypt",
];

export const formatNGN = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "long", year: "numeric" });

// Local-storage backed bookings (mock backend)
export interface Booking {
  id: string;
  type: BookingType;
  packageLabel: string;
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
  amount: number;
  createdAt: string;
  status: "pending" | "confirmed";
}

const KEY = "najma_bookings_v1";

export const getBookings = (): Booking[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
};

export const saveBooking = (b: Omit<Booking, "id" | "createdAt" | "status">): Booking => {
  const full: Booking = {
    ...b,
    id: `NJM-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  const all = getBookings();
  all.unshift(full);
  localStorage.setItem(KEY, JSON.stringify(all));
  return full;
};

export const deleteBooking = (id: string) => {
  const all = getBookings().filter((b) => b.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
};

export const updateBookingStatus = (id: string, status: Booking["status"]) => {
  const all = getBookings().map((b) => (b.id === id ? { ...b, status } : b));
  localStorage.setItem(KEY, JSON.stringify(all));
};
