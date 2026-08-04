import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_booking",
  title: "Create a booking",
  description:
    "Create a Najma Global booking request for the signed-in user. The booking starts in 'pending' status until the team confirms it.",
  inputSchema: {
    service_type: z
      .string()
      .describe("Service: umrah, hajj, study-abroad, medical-tourism or travel-visas."),
    package_label: z.string().optional().describe("Package or tier name, if known."),
    travel_date: z.string().optional().describe("Preferred travel date as YYYY-MM-DD."),
    travelers_count: z.number().int().min(1).max(50).optional().describe("Number of travellers (default 1)."),
    contact_name: z.string().describe("Full name of the primary contact."),
    contact_email: z.string().describe("Contact email address."),
    contact_phone: z.string().describe("Contact phone number."),
    notes: z.string().optional().describe("Extra requests or context."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        user_id: ctx.getUserId(),
        service_type: input.service_type,
        package_label: input.package_label ?? null,
        travel_date: input.travel_date ?? null,
        travelers_count: input.travelers_count ?? 1,
        contact_name: input.contact_name,
        contact_email: input.contact_email,
        contact_phone: input.contact_phone,
        notes: input.notes ?? null,
        status: "pending",
      })
      .select()
      .single();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { booking: data },
    };
  },
});
