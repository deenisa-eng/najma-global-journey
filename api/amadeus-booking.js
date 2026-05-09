const AMADEUS_BASE = process.env.AMADEUS_ENV === "production"
  ? "https://api.amadeus.com"
  : "https://test.api.amadeus.com";

async function getAccessToken() {
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Amadeus credentials are missing.");
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

function getTripParams(type, packageMeta) {
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

async function searchFlightOffer(accessToken, query) {
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { type, packageMeta, customer } = req.body || {};
    if (!type || !customer?.fullName || !customer?.email || !customer?.phone) {
      return res.status(400).json({ error: "Missing required booking fields" });
    }

    const tripParams = getTripParams(type, packageMeta);
    if (!tripParams) {
      return res.status(200).json({
        automated: false,
        status: "manual",
        message: "This service is configured for manual follow-up.",
      });
    }

    if (type === "umrah" && (!tripParams.departureDate || !tripParams.returnDate)) {
      return res.status(400).json({ error: "Umrah booking requires departure and return dates" });
    }

    const token = await getAccessToken();
    const offer = await searchFlightOffer(token, tripParams);

    return res.status(200).json({
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
    });
  } catch (error) {
    return res.status(500).json({
      automated: false,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown automation error",
    });
  }
}
