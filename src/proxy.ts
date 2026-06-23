import { auth } from "@/auth";

// Next 16 "proxy" convention (formerly middleware). Gates the whole /ops console
// and the /api/admin write namespace. Unauthenticated (or non-admin) requests to
// /ops are redirected to /ops/login; API requests get a 401. Defence-in-depth:
// each /ops page also re-checks server-side, and the /api/admin handlers too.
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isOps = pathname.startsWith("/ops") && !pathname.startsWith("/ops/login");
  const isAdminApi = pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";
  if (!isOps && !isAdminApi) return;

  const email = req.auth?.user?.email?.toLowerCase();
  const admin = process.env.ADMIN_EMAIL?.toLowerCase();
  const ok = Boolean(email && admin && email === admin);
  if (ok) return;

  if (isAdminApi) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/ops/login";
  return Response.redirect(url);
});

export const config = {
  matcher: ["/ops/:path*", "/api/admin/:path*"],
};
