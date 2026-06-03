import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("contact_inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ inquiries: data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const { id, is_read, resolved } = req.body || {};
      if (!id) return res.status(400).json({ error: "Missing id" });

      const updates = {};
      if (typeof is_read === "boolean") updates.is_read = is_read;
      if (typeof resolved === "boolean") updates.resolved = resolved;

      const { data, error } = await supabase
        .from("contact_inquiries")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ inquiry: data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
