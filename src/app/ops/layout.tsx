import { auth, signOut } from "@/auth";
import OpsNav from "@/components/admin/OpsNav";

// Operations console shell at /ops. Individual protected pages call
// requireAdmin() themselves so /ops/login renders without a redirect loop.
export const dynamic = "force-dynamic";

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const admin = process.env.ADMIN_EMAIL?.toLowerCase();
  const email = session?.user?.email?.toLowerCase();
  const isAdmin = Boolean(email && admin && email === admin);

  // Unauthenticated visitors (the /ops/login page) get a bare shell.
  if (!isAdmin) return <section>{children}</section>;

  return (
    <div className="full-bleed -mt-10 min-h-screen bg-slate-50/60">
      {/* Console topbar */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="text-base font-semibold tracking-tight text-slate-900">OfficialRequirements</span>
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-600">Console</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden text-slate-500 sm:inline">{session?.user?.email}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/ops/login" });
            }}
          >
            <button type="submit" className="text-slate-600 hover:text-slate-900">Sign out</button>
          </form>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] md:grid-cols-[230px_1fr]">
        <aside className="border-b border-slate-200 bg-white px-3 py-5 md:min-h-[calc(100vh-57px)] md:border-b-0 md:border-r">
          <OpsNav />
        </aside>
        <main className="px-4 py-6 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
