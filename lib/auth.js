import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/db";

// Emails in ADMIN_EMAILS (comma-separated) are always admins. Other admins can be
// promoted from the admin dashboard, which stores the role in the database.
const adminEmails = () =>
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export const isOwnerAdmin = (email) => adminEmails().includes(String(email).toLowerCase());

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },

  callbacks: {
    async signIn({ user, account, profile }) {
      // Only accept Google accounts with a verified email
      if (account?.provider !== "google" || !profile?.email_verified) return false;

      try {
        const existing = await prisma.user.findUnique({ where: { email: user.email } });
        if (existing?.status === "suspended") return "/login?error=Suspended";

        const role = isOwnerAdmin(user.email) ? "admin" : existing?.role || "user";
        const saved = await prisma.user.upsert({
          where: { email: user.email },
          create: { email: user.email, name: user.name, image: user.image, role, loginCount: 1 },
          update: { name: user.name, image: user.image, role, loginCount: { increment: 1 }, lastLoginAt: new Date() },
        });
        await prisma.loginEvent.create({ data: { userId: saved.id } });
      } catch (err) {
        // A database problem must never lock everyone out, so sign-in continues
        console.error("[auth] Could not save sign-in:", err.message);
      }
      return true;
    },

    // At sign-in, copy the user's role into the session token (used for showing admin links).
    // Admin pages and APIs re-check the role in the database on every request.
    async jwt({ token, user }) {
      if (user) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { email: user.email }, select: { role: true } });
          token.role = dbUser?.role || (isOwnerAdmin(user.email) ? "admin" : "user");
        } catch {
          token.role = isOwnerAdmin(user.email) ? "admin" : "user";
        }
      }
      return token;
    },

    async session({ session, token }) {
      session.user.role = token.role || "user";
      return session;
    },
  },
};
