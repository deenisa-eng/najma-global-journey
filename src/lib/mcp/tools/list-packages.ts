import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_packages",
  title: "List travel packages",
  description:
    "List Najma Global travel packages (Umrah, Hajj, study abroad, medical, visas) with price, duration and category.",
  inputSchema: {
    category: z.string().optional().describe("Optional category filter, e.g. 'umrah' or 'hajj'."),
    limit: z.number().int().min(1).max(50).optional().describe("Maximum packages to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, limit }) => {
    const supabase = supabaseAnon();
    let query = supabase
      .from("packages")
      .select("id, slug, title, category, description, price, duration_days")
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (category) query = query.ilike("category", category);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { packages: data ?? [] },
    };
  },
});
