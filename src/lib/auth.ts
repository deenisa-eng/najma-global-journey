import { supabase } from "./supabase";

const adminEmails = () =>
  (import.meta.env.VITE_ADMIN_EMAILS as string | undefined)
    ?.split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean) ?? [];

export const isAdminEmail = (email: string | undefined | null) =>
  Boolean(email && adminEmails().includes(email.trim().toLowerCase()));

export const signUp = (email: string, password: string, fullName?: string) =>
  supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName ?? "" } },
  });

export const signIn = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password });

export const signOut = () => supabase.auth.signOut();

export const getSession = () => supabase.auth.getSession();
