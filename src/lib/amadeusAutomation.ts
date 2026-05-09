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
  const res = await fetch("/api/amadeus-booking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || "Amadeus automation request failed");
  }

  return data as AutomationResponse;
}
