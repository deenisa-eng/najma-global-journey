import { BookingType } from "@/data/packages";

export interface AutomationRequest {
  type: BookingType;
  packageMeta?: {
    departDate?: string;
    returnDate?: string;
  };
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
}

export interface AutomationResponse {
  automated: boolean;
  status: "quoted" | "pending" | "manual" | "error";
  message?: string;
  offer?: {
    id: string;
    price?: { total?: string; currency?: string };
  } | null;
  error?: string;
}

export async function automateBooking(payload: AutomationRequest): Promise<AutomationResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const endpoint = `${supabaseUrl}/functions/v1/amadeus-booking`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || "Amadeus automation request failed");
  }

  return data as AutomationResponse;
}
