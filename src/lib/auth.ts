import { auth } from "@/auth";

// Admin auth now runs on Auth.js (NextAuth) Google OAuth, single-admin gated by
// ADMIN_EMAIL (see src/auth.ts). These helpers wrap the session check so the
// rest of the app (admin pages + /api/admin/* routes) is unchanged.

/** True when the request carries a valid admin session (the ADMIN_EMAIL account). */
export async function isAdminAuthed(): Promise<boolean> {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  const admin = process.env.ADMIN_EMAIL?.toLowerCase();
  return Boolean(email && admin && email === admin);
}

/** Server-side guard for protected admin pages. Redirects to /ops/login if not authed. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthed())) {
    const { redirect } = await import("next/navigation");
    redirect("/ops/login");
  }
}
