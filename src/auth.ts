import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Single-admin Google OAuth (Auth.js / NextAuth v5). Only the Google account
// whose verified email equals ADMIN_EMAIL may sign in — every other login is
// rejected. Reads AUTH_SECRET / AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET from env.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  // Trust the deployment host (Vercel custom domains, localhost dev). Without
  // this, Auth.js v5 can reject the callback on non-Vercel-default hosts.
  trustHost: true,
  pages: { signIn: "/ops/login" },
  callbacks: {
    async signIn({ profile }) {
      const admin = process.env.ADMIN_EMAIL?.toLowerCase();
      const email = profile?.email?.toLowerCase();
      return Boolean(admin && email === admin && profile?.email_verified === true);
    },
  },
});
