import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

/**
 * Returns the signed-in admin from the database, or null.
 * The role is read fresh from the database (not the session cookie), so a demoted or
 * suspended admin loses access immediately.
 */
export async function getAdmin(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return { session: null, admin: null };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const admin = user?.role === "admin" && user.status === "active" ? user : null;
  return { session, admin };
}

// For API routes: responds 401/403 and returns null when the caller isn't an admin
export async function requireAdminApi(req, res) {
  const { session, admin } = await getAdmin(req, res);
  if (!session) {
    res.status(401).json({ error: "Please sign in" });
    return null;
  }
  if (!admin) {
    res.status(403).json({ error: "Admins only" });
    return null;
  }
  return admin;
}
