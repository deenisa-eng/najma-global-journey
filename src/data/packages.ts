// Shared mock data + helpers

export type BookingType = "study" | "hajj" | "umrah";

export interface UmrahDeparture {
  id: string;
  depart: string; // ISO
  ret: string;    // ISO
  label: string;  // e.g. "January 2026"
  seatsLeft: number;
}

export const HAJJ_PACKAGE = {
  id: "hajj-2026",
  title: "Hajj 2026 — Premium Pilgrimage",
  departDate: "2026-05-10",
  returnDate: "2026-06-10",
  departRoute: "Kano → Madinah",
  returnRoute: "Jeddah → Kano",
  price: 1_900_000,
  seatsLeft: 18,
  inclusions: [
    "Return airfare (Kano · Madinah · Jeddah · Kano)",
    "Visa processing & documentation",
    "Madinah & Makkah accommodation",
    "Daily ground transport",
    "Experienced guide & ihram support",
    "All meals included",
  ],
};

export const UMRAH_PRICE = 3_000_000;
export const UMRAH_INCLUSIONS = [
  "Umrah Visa",
  "Return Air Ticket (Kano ↔ Jeddah)",
  "Ground Transport in Saudi Arabia",
  "Premium Accommodation (Makkah & Madinah)",
];

export const UMRAH_DEPARTURES: UmrahDeparture[] = [
  { id: "u-jan", label: "January 2026", depart: "2026-01-15", ret: "2026-01-29", seatsLeft: 12 },
  { id: "u-feb", label: "February 2026", depart: "2026-02-12", ret: "2026-02-26", seatsLeft: 9 },
  { id: "u-mar", label: "March 2026 (Ramadan)", depart: "2026-03-05", ret: "2026-03-22", seatsLeft: 4 },
  { id: "u-apr", label: "April 2026", depart: "2026-04-09", ret: "2026-04-23", seatsLeft: 14 },
  { id: "u-jul", label: "July 2026", depart: "2026-07-16", ret: "2026-07-30", seatsLeft: 16 },
  { id: "u-oct", label: "October 2026", depart: "2026-10-08", ret: "2026-10-22", seatsLeft: 18 },
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
