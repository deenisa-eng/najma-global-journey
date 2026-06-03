# Database Migrations

This folder contains SQL migrations for the Najma Global backend.

## Current migration

- `001_initial_schema.sql`: creates initial tables for admin profiles, packages, bookings, and contact inquiries.

## Applying migrations

Use your database migration tool or the Supabase CLI to apply these files in order. If you use Supabase, run:

```bash
supabase db push
```

Or apply the SQL files directly against your PostgreSQL database.
