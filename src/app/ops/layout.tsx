import Link from "next/link";
import { auth, signOut } from "@/auth";

// Admin shell at /ops. Individual protected pages call requireAdmin() themselves
// so the /ops/login page can render without a redirect loop. Middleware gates
// the whole /ops surface as defence-in-depth.
export const dynamic = "force-dynamic";

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const admin = process.env.ADMIN_EMAIL?.toLowerCase();
  const email = session?.user?.email?.toLowerCase();
  const isAdmin = Boolean(email && admin && email === admin);

  // Unauthenticated visitors (the /ops/login page) get a bare shell — no admin
  // navigation, no internal structure, nothing that reveals the console exists.
  if (!isAdmin) {
    return <section>{children}</section>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-[200px_1fr]">
      <aside className="md:border-r md:border-slate-200 md:pr-4">
        <div className="text-sm font-semibold uppercase tracking-wide text-slate-400">Admin</div>
        <nav className="mt-3 flex flex-col gap-1 text-sm">
          <Link href="/ops" className="rounded px-2 py-1.5 hover:bg-slate-100">Dashboard</Link>
          <Link href="/ops/ads" className="rounded px-2 py-1.5 hover:bg-slate-100">Ads &amp; affiliate</Link>
          <Link href="/ops/data" className="rounded px-2 py-1.5 hover:bg-slate-100">Data freshness</Link>
          <Link href="/ops/seo" className="rounded px-2 py-1.5 hover:bg-slate-100">SEO &amp; health</Link>
        </nav>
        <div className="mt-6 border-t border-slate-200 pt-3 text-xs text-slate-500">
          <div className="truncate" title={session?.user?.email ?? ""}>{session?.user?.email}</div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/ops/login" });
            }}
          >
            <button type="submit" className="mt-1 text-brand-600 hover:underline">Sign out</button>
          </form>
        </div>
      </aside>
      <section>{children}</section>
    </div>
  );
}
