import { supabase } from "@/lib/supabase";

export type UmrahDeparture = {
  id: string;
  label: string;
  depart: string; // ISO
  ret: string; // ISO
  seatsLeft: number;
  departureCity: string;
};

export type TravelDeparture = UmrahDeparture;
export type BusinessDeparture = UmrahDeparture;

export type HajjPackage = {
  id: string;
  title: string;
  departDate: string;
  returnDate: string;
  departRoute: string;
  returnRoute: string;
  price: number;
  seatsLeft: number;
  inclusions?: string[];
};

export type TierService = "umrah" | "travel";

export type PackageTier = {
  id: string;
  service: TierService;
  tier: "Economy" | "Luxury" | "Premium" | string;
  stars: number;
  price: number;
  duration: string;
  totalSeats: number;
  seatsBooked: number;
  highlights: string[];
  isFeatured: boolean;
  imageUrl?: string;
  description?: string;
};

export type Scholarship = {
  id: string;
  title: string;
  institution: string;
  location: string;
  amount: string;
  deadline: string;
  duration: string;
  highlights: string[];
  isFeatured: boolean;
  imageUrl?: string;
  link?: string;
  description?: string;
};

export type MedicalAffiliation = {
  id: string;
  name: string;
  location: string;
  specialties: string[];
  description?: string;
  imageUrl?: string;
  link?: string;
  isFeatured: boolean;
};

export type UmrahTier = PackageTier;

function normalizeUmrahDeparture(row: any): UmrahDeparture {
  return {
    id: row.id,
    label: row.label,
    depart: row.depart,
    ret: row.ret,
    seatsLeft: Number.isFinite(row.seatsLeft)
      ? row.seatsLeft
      : Number.isFinite(row.seatsleft)
      ? row.seatsleft
      : 0,
    departureCity: row.departure_city || row.departureCity || 'Kano (KAN)',
  };
}

function normalizePackageTier(row: any): PackageTier {
  return {
    id: row.id,
    service: row.service || "umrah",
    tier: row.tier,
    stars: row.stars,
    price: Number(row.price),
    duration: row.duration,
    totalSeats: row.total_seats,
    seatsBooked: row.seats_booked || 0,
    highlights: row.highlights || [],
    isFeatured: row.is_featured || false,
    imageUrl: row.image_url,
    description: row.description,
  };
}

function normalizeScholarship(row: any): Scholarship {
  return {
    id: row.id,
    title: row.title,
    institution: row.institution,
    location: row.location,
    amount: row.amount,
    deadline: row.deadline,
    duration: row.duration,
    highlights: row.highlights || [],
    isFeatured: row.is_featured || false,
    imageUrl: row.image_url,
    link: row.link,
    description: row.description,
  };
}

function normalizeMedicalAffiliation(row: any): MedicalAffiliation {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    specialties: row.specialties || [],
    description: row.description,
    imageUrl: row.image_url,
    link: row.link,
    isFeatured: row.is_featured || false,
  };
}

export async function getScholarships(): Promise<Scholarship[]> {
  const { data, error } = await supabase.from("scholarships").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  if (!data) return [];
  return (data as any[]).map(normalizeScholarship);
}

export async function upsertScholarship(s: Partial<Scholarship> & { id: string }) {
  const payload = {
    id: s.id,
    title: s.title,
    institution: s.institution,
    location: s.location,
    amount: s.amount,
    deadline: s.deadline,
    duration: s.duration,
    highlights: s.highlights,
    is_featured: s.isFeatured,
    image_url: s.imageUrl,
    link: s.link,
    description: s.description,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("scholarships").upsert(payload, { onConflict: "id" }).select().single();
  if (error) throw error;
  return normalizeScholarship(data);
}

export async function deleteScholarship(id: string) {
  const { error } = await supabase.from("scholarships").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function getMedicalAffiliations(): Promise<MedicalAffiliation[]> {
  const { data, error } = await supabase.from("medical_affiliations").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  if (!data) return [];
  return (data as any[]).map(normalizeMedicalAffiliation);
}

export async function upsertMedicalAffiliation(m: Partial<MedicalAffiliation> & { id: string }) {
  const payload = {
    id: m.id,
    name: m.name,
    location: m.location,
    specialties: m.specialties,
    description: m.description,
    image_url: m.imageUrl,
    link: m.link,
    is_featured: m.isFeatured,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("medical_affiliations").upsert(payload, { onConflict: "id" }).select().single();
  if (error) throw error;
  return normalizeMedicalAffiliation(data);
}

export async function deleteMedicalAffiliation(id: string) {
  const { error } = await supabase.from("medical_affiliations").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function getPackageTiers(service: TierService): Promise<PackageTier[]> {
  const { data, error } = await supabase.from("umrah_tiers").select("*").eq("service", service).order("price", { ascending: false });
  if (error) throw error;
  if (!data) return [];
  return (data as any[]).map(normalizePackageTier);
}

export async function upsertPackageTier(tier: Partial<PackageTier> & { id: string }) {
  const payload = {
    id: tier.id,
    service: tier.service || "umrah",
    tier: tier.tier,
    stars: tier.stars,
    price: tier.price,
    duration: tier.duration,
    total_seats: tier.totalSeats,
    seats_booked: tier.seatsBooked,
    highlights: tier.highlights,
    is_featured: tier.isFeatured,
    image_url: tier.imageUrl,
    description: tier.description,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("umrah_tiers").upsert(payload, { onConflict: "id" }).select().single();
  if (error) throw error;
  return normalizePackageTier(data);
}

export async function getUmrahTiers(): Promise<UmrahTier[]> {
  return getPackageTiers("umrah");
}

export async function upsertUmrahTier(tier: Partial<UmrahTier> & { id: string }) {
  return upsertPackageTier({ ...tier, service: tier.service ?? "umrah" });
}

export async function getUmrahDepartures(): Promise<UmrahDeparture[]> {
  const { data, error } = await supabase.from("umrah_departures").select("*").order("depart", { ascending: true });
  if (error) throw error;
  if (!data) return [];
  return (data as any[]).map(normalizeUmrahDeparture);
}

export async function getTravelDepartures(): Promise<TravelDeparture[]> {
  const { data, error } = await supabase.from("travel_departures").select("*").order("depart", { ascending: true });
  if (error) throw error;
  if (!data) return [];
  return (data as any[]).map(normalizeUmrahDeparture);
}

export async function getBusinessDepartures(): Promise<BusinessDeparture[]> {
  const { data, error } = await supabase.from("business_departures").select("*").order("depart", { ascending: true });
  if (error) throw error;
  if (!data) return [];
  return (data as any[]).map(normalizeUmrahDeparture);
}

export async function upsertUmrahDeparture(dep: Partial<UmrahDeparture> & { id?: string }) {
  const seatsLeft = Number(dep.seatsLeft ?? (dep as any).seatsleft ?? 0);
  const payload = {
    id: dep.id ?? `u-${Date.now()}`,
    label: dep.label ?? "New",
    depart: dep.depart ?? new Date().toISOString().split("T")[0],
    ret: dep.ret ?? new Date().toISOString().split("T")[0],
    seatsleft: Number.isFinite(seatsLeft) ? seatsLeft : 0,
    departure_city: dep.departureCity ?? "Kano (KAN)",
  };
  try {
    const { data, error } = await supabase.from("umrah_departures").upsert(payload, { onConflict: "id" }).select().maybeSingle();
    if (error) throw error;
    return normalizeUmrahDeparture(data);
  } catch (err) {
    return { ...payload, seatsLeft: payload.seatsleft, departureCity: payload.departure_city } as UmrahDeparture;
  }
}

export async function upsertTravelDeparture(dep: Partial<TravelDeparture> & { id?: string }) {
  const seatsLeft = Number(dep.seatsLeft ?? (dep as any).seatsleft ?? 0);
  const payload = {
    id: dep.id ?? `t-${Date.now()}`,
    label: dep.label ?? "New",
    depart: dep.depart ?? new Date().toISOString().split("T")[0],
    ret: dep.ret ?? new Date().toISOString().split("T")[0],
    seatsleft: Number.isFinite(seatsLeft) ? seatsLeft : 0,
    departure_city: dep.departureCity ?? "Lagos (LOS)",
  };
  try {
    const { data, error } = await supabase.from("travel_departures").upsert(payload, { onConflict: "id" }).select().maybeSingle();
    if (error) throw error;
    return normalizeUmrahDeparture(data);
  } catch (err) {
    return { ...payload, seatsLeft: payload.seatsleft, departureCity: payload.departure_city } as TravelDeparture;
  }
}

export async function upsertBusinessDeparture(dep: Partial<BusinessDeparture> & { id?: string }) {
  const seatsLeft = Number(dep.seatsLeft ?? (dep as any).seatsleft ?? 0);
  const payload = {
    id: dep.id ?? `b-${Date.now()}`,
    label: dep.label ?? "New",
    depart: dep.depart ?? new Date().toISOString().split("T")[0],
    ret: dep.ret ?? new Date().toISOString().split("T")[0],
    seatsleft: Number.isFinite(seatsLeft) ? seatsLeft : 0,
    departure_city: dep.departureCity ?? "Lagos (LOS)",
  };
  try {
    const { data, error } = await supabase.from("business_departures").upsert(payload, { onConflict: "id" }).select().maybeSingle();
    if (error) throw error;
    return normalizeUmrahDeparture(data);
  } catch (err) {
    return { ...payload, seatsLeft: payload.seatsleft, departureCity: payload.departure_city } as BusinessDeparture;
  }
}

export async function deleteUmrahDeparture(id: string) {
  try {
    const { error } = await supabase.from("umrah_departures").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    return false;
  }
}

export async function deleteTravelDeparture(id: string) {
  try {
    const { error } = await supabase.from("travel_departures").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    return false;
  }
}

export async function deleteBusinessDeparture(id: string) {
  try {
    const { error } = await supabase.from("business_departures").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    return false;
  }
}

export async function getHajjPackage(): Promise<HajjPackage | null> {
  try {
    const { data, error } = await supabase.from("hajj_package").select("*").maybeSingle();
    if (error) throw error;
    return data as HajjPackage;
  } catch (err) {
    return null;
  }
}

export async function upsertHajjPackage(pkg: Partial<HajjPackage>) {
  const payload = { ...pkg };
  if (!payload.id) payload.id = "hajj-default";
  
  try {
    const { data, error } = await supabase.from("hajj_package").upsert(payload, { onConflict: "id" }).select().maybeSingle();
    if (error) throw error;
    return data as HajjPackage;
  } catch (err) {
    throw err;
  }
}
