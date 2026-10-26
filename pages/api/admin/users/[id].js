import prisma from "@/lib/db";
import { requireAdminApi } from "@/lib/adminAuth";
import { isOwnerAdmin } from "@/lib/auth";

const ROLES = ["user", "admin"];
const STATUSES = ["active", "suspended"];

// PATCH { role } or { status } updates a user; DELETE removes them. Admins only.
export default async function handler(req, res) {
  if (!["PATCH", "DELETE"].includes(req.method)) return res.status(405).json({ error: "Method not allowed" });

  const admin = await requireAdminApi(req, res);
  if (!admin) return;

  const target = await prisma.user.findUnique({ where: { id: String(req.query.id) } });
  if (!target) return res.status(404).json({ error: "User not found" });

  // Guard rails: nobody can lock themselves out, and owner admins (ADMIN_EMAILS) can't be changed from the UI
  if (target.id === admin.id) return res.status(400).json({ error: "You can't change your own account here" });
  if (isOwnerAdmin(target.email)) return res.status(400).json({ error: "Owner admins are managed in ADMIN_EMAILS" });

  if (req.method === "DELETE") {
    await prisma.user.delete({ where: { id: target.id } });
    return res.status(200).json({ deleted: target.id });
  }

  const { role, status } = req.body || {};
  const data = {};
  if (role !== undefined) {
    if (!ROLES.includes(role)) return res.status(400).json({ error: "Invalid role" });
    data.role = role;
  }
  if (status !== undefined) {
    if (!STATUSES.includes(status)) return res.status(400).json({ error: "Invalid status" });
    data.status = status;
  }
  if (!Object.keys(data).length) return res.status(400).json({ error: "Nothing to update" });

  const user = await prisma.user.update({ where: { id: target.id }, data });
  res.status(200).json({ user: { id: user.id, role: user.role, status: user.status } });
}
