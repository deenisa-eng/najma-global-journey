import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
};

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase credentials" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();
    const {
      user_id,
      service_type,
      package_label,
      amount,
      contact_name,
      contact_email,
      contact_phone,
      notes,
      package_id,
      metadata,
    } = body;

    const safePackageId = typeof package_id === "string" && /^[0-9a-fA-F-]{36}$/.test(package_id)
      ? package_id
      : null;

    if (!service_type || !contact_name || !contact_email || !contact_phone) {
      return new Response(JSON.stringify({ error: "Missing required booking fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (user_id) {
      await supabase.from("user_profiles").upsert({
        user_id,
        email: contact_email,
        full_name: contact_name,
      }, { onConflict: ["user_id"] });
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          user_id: user_id || null,
          service_type,
          package_label: package_label || null,
          amount: amount ?? 0,
          contact_name,
          contact_email,
          contact_phone,
          notes: notes || null,
          package_id: safePackageId,
          metadata: metadata || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Booking insert error", error);
      return new Response(JSON.stringify({ error: "Could not create booking" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ booking: data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});