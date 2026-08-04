import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listPackagesTool from "./tools/list-packages";
import listMyBookingsTool from "./tools/list-my-bookings";
import createBookingTool from "./tools/create-booking";
import submitInquiryTool from "./tools/submit-inquiry";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "chhtzqpyvheuklyrsmjj";

export default defineMcp({
  name: "najma-global-journey",
  title: "Najma Global Journey",
  version: "0.1.0",
  instructions:
    "Tools for Najma Global Tours & Consulting. Use `list_packages` to browse Umrah, Hajj, study abroad, medical tourism and visa packages; `list_my_bookings` to read the signed-in user's bookings; `create_booking` to request a new booking; and `submit_inquiry` to contact the team.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listPackagesTool, listMyBookingsTool, createBookingTool, submitInquiryTool],
});
