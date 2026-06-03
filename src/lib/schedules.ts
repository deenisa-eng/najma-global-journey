import { supabase } from "@/lib/supabase";
import { UMRAH_DEPARTURES, HAJJ_PACKAGE } from "@/data/packages";

export type UmrahDeparture = {
  id: string;
  label: string;
  depart: string; // ISO
  ret: string; // ISO
  seatsLeft: number;
};

export type HajjPackage = typeof HAJJ_PACKAGE;

export async function getUmrahDepartures(): Promise<UmrahDeparture[]> {
  try {
    const { data, error } = await supabase.from("umrah_departures").select("*").order("depart", { ascending: true });
    if (error) throw error;
    if (!data) throw new Error("no data");
    return data as UmrahDeparture[];
  } catch (err) {
    // fallback to local static data
    return UMRAH_DEPARTURES.map((d) => ({ id: d.id, label: d.label, depart: d.depart, ret: d.ret, seatsLeft: d.seatsLeft }));
  }
}

export async function upsertUmrahDeparture(dep: Partial<UmrahDeparture> & { id?: string }) {
  const payload = { id: dep.id ?? `u-${Date.now()}`, label: dep.label ?? "New", depart: dep.depart ?? new Date().toISOString().split("T")[0], ret: dep.ret ?? new Date().toISOString().split("T")[0], seatsLeft: dep.seatsLeft ?? 0 };
  try {
    const { data, error } = await supabase.from("umrah_departures").upsert(payload, { onConflict: "id" }).select().maybeSingle();
    if (error) throw error;
    return data as UmrahDeparture;
  } catch (err) {
    return payload as UmrahDeparture;
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

export async function getHajjPackage(): Promise<HajjPackage> {
  try {
    const { data, error } = await supabase.from("hajj_package").select("*").maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("no data");
    return data as HajjPackage;
  } catch (err) {
    return HAJJ_PACKAGE;
  }
}

export async function upsertHajjPackage(pkg: Partial<HajjPackage>) {
  const payload = { ...HAJJ_PACKAGE, ...pkg } as HajjPackage;
  try {
    const { data, error } = await supabase.from("hajj_package").upsert(payload, { onConflict: "id" }).select().maybeSingle();
    if (error) throw error;
    return data as HajjPackage;
  } catch (err) {
    return payload;
  }
}
