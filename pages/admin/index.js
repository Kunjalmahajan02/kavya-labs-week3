import Head from "next/head";
import Link from "next/link";
import prisma from "@/lib/db";
import { getAdmin } from "@/lib/adminAuth";
import { isOwnerAdmin } from "@/lib/auth";
import { COMPANY } from "@/lib/content";
import Navbar from "@/components/Navbar";
import AdminDashboard from "@/components/admin/AdminDashboard";

const DAY = 24 * 60 * 60 * 1000;

export async function getServerSideProps({ req, res }) {
  const { session, admin } = await getAdmin(req, res);
  if (!session) return { redirect: { destination: "/login?callbackUrl=%2Fadmin", permanent: false } };
  if (!admin) return { props: { forbidden: true } };

  const now = Date.now();
  const [users, events] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 1000 }),
    prisma.loginEvent.findMany({
      where: { createdAt: { gte: new Date(now - 30 * DAY) } },
      select: { userId: true, createdAt: true },
    }),
  ]);

  return {
    props: {
      now,
      currentUserId: admin.id,
      protectedIds: users.filter((u) => isOwnerAdmin(u.email)).map((u) => u.id),
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        role: u.role,
        status: u.status,
        loginCount: u.loginCount,
        createdAt: u.createdAt.toISOString(),
        lastLoginAt: u.lastLoginAt.toISOString(),
      })),
      events: events.map((e) => ({ userId: e.userId, createdAt: e.createdAt.toISOString() })),
    },
  };
}

export default function AdminPage({ forbidden, users, events, currentUserId, protectedIds, now }) {
  return (
    <>
      <Head>
        <title>{`Admin · ${COMPANY.name}`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] bg-slate-50">
        {forbidden ? (
          <div className="max-w-lg mx-auto px-5 py-24 text-center">
            <p className="text-5xl" aria-hidden="true">
              🔒
            </p>
            <h1 className="mt-4 text-2xl font-bold text-ink">Admins only</h1>
            <p className="mt-2 text-slate-600">
              Your account doesn't have admin access. Ask an admin to promote you, or explore the dashboard with sample data.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/admin/demo" className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-5 py-2.5 rounded-xl">
                View admin demo
              </Link>
              <Link href="/dashboard" className="border border-slate-300 font-semibold px-5 py-2.5 rounded-xl">
                My dashboard
              </Link>
            </div>
          </div>
        ) : (
          <AdminDashboard
            mode="live"
            initialUsers={users}
            events={events}
            currentUserId={currentUserId}
            protectedIds={protectedIds}
            now={now}
          />
        )}
      </main>
    </>
  );
}
