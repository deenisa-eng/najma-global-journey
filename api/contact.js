import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { name, email, message, subject, source } = req.body || {};
    if (!name || !email || !message) return res.status(400).json({ error: "Missing required fields" });

    // Store inquiry in DB
    const { data, error: insertError } = await supabase
      .from("contact_inquiries")
      .insert([{ name, email, subject: subject || null, message, source: source || null, is_read: false }])
      .select()
      .single();

    if (insertError) {
      console.error("DB insert error", insertError);
      return res.status(500).json({ error: "Could not save inquiry" });
    }

    // Inquiry stored successfully; admin will see it in the dashboard via badge
    return res.status(200).json({ ok: true, inquiry: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
