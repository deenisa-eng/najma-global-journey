const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
};

const AMADEUS_BASE = Deno.env.get("AMADEUS_ENV") === "production"
  ? "https://api.amadeus.com"
  : "https://test.api.amadeus.com";

async function getAccessToken() {
  const clientId = Deno.env.get("AMADEUS_CLIENT_ID");
  const clientSecret = Deno.env.get("AMADEUS_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    return null;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const tokenRes = await fetch(`${AMADEUS_BASE}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    const detail = tokenData?.error_description || tokenData?.errors?.[0]?.detail || "Could not fetch token";
    throw new Error(`Amadeus auth failed: ${detail}`);
  }

  return tokenData.access_token;
}

function getTripParams(type: string, packageMeta?: { departDate?: string; returnDate?: string }) {
  if (type === "hajj") {
    return {
      originLocationCode: "KAN",
      destinationLocationCode: "MED",
      departureDate: packageMeta?.departDate || "2026-05-10",
      returnDate: packageMeta?.returnDate || "2026-06-10",
      adults: "1",
      currencyCode: "NGN",
      max: "3",
    };
  }

  if (type === "umrah") {
    return {
      originLocationCode: "KAN",
      destinationLocationCode: "JED",
      departureDate: packageMeta?.departDate,
      returnDate: packageMeta?.returnDate,
      adults: "1",
      currencyCode: "NGN",
      max: "3",
    };
  }

  return null;
}

async function searchFlightOffer(accessToken: string, query: Record<string, string | undefined>) {
  const url = new URL(`${AMADEUS_BASE}/v2/shopping/flight-offers`);
  Object.entries(query).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, String(value));
  });

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await res.json();
  if (!res.ok) {
    const detail = data?.errors?.[0]?.detail || "Unable to fetch flight offers";
    throw new Error(`Flight search failed: ${detail}`);
  }

  return data?.data?.[0] || null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { type, packageMeta, customer } = body || {};

    if (!type || !customer?.fullName || !customer?.email || !customer?.phone) {
      return new Response(JSON.stringify({ error: "Missing required booking fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tripParams = getTripParams(type, packageMeta);
    if (!tripParams) {
      return new Response(JSON.stringify({
        automated: false,
        status: "manual",
        message: "This service is configured for manual follow-up.",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "umrah" && (!tripParams.departureDate || !tripParams.returnDate)) {
      return new Response(JSON.stringify({ error: "Umrah booking requires departure and return dates" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getAccessToken();
    if (!token) {
      return new Response(JSON.stringify({
        automated: false,
        status: "manual",
        message: "Amadeus credentials are not configured; booking will be handled manually.",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const offer = await searchFlightOffer(token, tripParams);
    return new Response(JSON.stringify({
      automated: true,
      status: offer ? "quoted" : "pending",
      message: offer
        ? "Flight offer fetched from Amadeus and attached to booking."
        : "No flight offers returned; booking set for manual review.",
      offer: offer
        ? {
            id: offer.id,
            source: offer.source,
            lastTicketingDate: offer.lastTicketingDate,
            numberOfBookableSeats: offer.numberOfBookableSeats,
            price: offer.price,
            itineraries: offer.itineraries,
          }
        : null,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({
      automated: false,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown automation error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
