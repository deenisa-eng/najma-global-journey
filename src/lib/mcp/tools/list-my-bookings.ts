import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_bookings",
  title: "List my bookings",
  description: "List the signed-in user's Najma Global bookings with status, travel date and service type.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, service_type, package_label, travel_date, travelers_count, status, amount, contact_email, notes, created_at",
      )
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false });

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { bookings: data ?? [] },
    };
  },
});
