# Welcome to your Lovable project

## Amadeus Booking Automation

This project now includes a server endpoint at `api/amadeus-booking.js` to automate booking enrichment with Amadeus flight offers.

Set these server-side environment variables in your hosting platform:

- `AMADEUS_CLIENT_ID`
- `AMADEUS_CLIENT_SECRET`
- `AMADEUS_ENV` (`test` or `production`)

Notes:

- Credentials must stay server-side and should never be exposed as `VITE_*` variables.
- `Hajj` and `Umrah` bookings attempt automated flight-offer lookup.
- `Study Abroad` and `Medical Tourism` remain manual follow-up services by design.
