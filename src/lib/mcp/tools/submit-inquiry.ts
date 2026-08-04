import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "submit_inquiry",
  title: "Submit a contact inquiry",
  description: "Send a contact inquiry to the Najma Global team on behalf of the signed-in user.",
  inputSchema: {
    name: z.string().describe("Name of the person making the inquiry."),
    email: z.string().describe("Reply-to email address."),
    subject: z.string().optional().describe("Short subject line."),
    message: z.string().describe("The inquiry message."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { error } = await supabase.from("contact_inquiries").insert({
      name: input.name,
      email: input.email,
      subject: input.subject ?? null,
      message: input.message,
      source: "mcp",
    });

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: "Inquiry submitted. The Najma Global team will follow up by email." }],
      structuredContent: { submitted: true },
    };
  },
});
