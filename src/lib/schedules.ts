import { supabase } from "@/lib/supabase";

export type UmrahDeparture = {
  id: string;
  label: string;
  depart: string; // ISO
  ret: string; // ISO
  seatsLeft: number;
};

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
  };
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

export async function upsertUmrahDeparture(dep: Partial<UmrahDeparture> & { id?: string }) {
  const seatsLeft = Number(dep.seatsLeft ?? (dep as any).seatsleft ?? 0);
  const payload = {
    id: dep.id ?? `u-${Date.now()}`,
    label: dep.label ?? "New",
    depart: dep.depart ?? new Date().toISOString().split("T")[0],
    ret: dep.ret ?? new Date().toISOString().split("T")[0],
    seatsleft: Number.isFinite(seatsLeft) ? seatsLeft : 0,
  };
  try {
    const { data, error } = await supabase.from("umrah_departures").upsert(payload, { onConflict: "id" }).select().maybeSingle();
    if (error) throw error;
    return normalizeUmrahDeparture(data);
  } catch (err) {
    return { ...payload, seatsLeft: payload.seatsleft } as UmrahDeparture;
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
