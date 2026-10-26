import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { signOut } from "next-auth/react";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { COMPANY } from "@/lib/content";
import Navbar from "@/components/Navbar";

const formatDate = (iso) =>
  new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

export async function getServerSideProps({ req, res, resolvedUrl }) {
  // The middleware already protects this page; checking again here keeps it safe if the matcher changes
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return { redirect: { destination: `/login?callbackUrl=${encodeURIComponent(resolvedUrl)}`, permanent: false } };
  }

  let account = null;
  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user) {
      account = {
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt.toISOString(),
        loginCount: user.loginCount,
        role: user.role,
      };
    }
  } catch (err) {
    console.error("[dashboard] Could not load account:", err.message);
  }

  return { props: { user: session.user, account } };
}

export default function Dashboard({ user, account }) {
  const firstName = (user.name || "there").split(" ")[0];
  // The database role is the source of truth; the session copy can be out of date after a promotion
  const isAdmin = (account?.role || user.role) === "admin";

  return (
    <>
      <Head>
        <title>{`Dashboard · ${COMPANY.name}`}</title>
      </Head>
      <Navbar />

      <main className="min-h-[calc(100vh-4rem)] bg-slate-50">
        <div className="max-w-4xl mx-auto px-5 py-12">
          <p className="text-sm font-semibold text-brand-600">Dashboard</p>
          <h1 className="mt-1 text-3xl font-bold text-ink">Welcome, {firstName} 👋</h1>
          <p className="mt-2 text-slate-600">You're signed in with Google. This page is only visible to signed-in users.</p>

          <section className="mt-8 rounded-2xl bg-white border border-slate-200 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {user.image ? (
              <img src={user.image} alt="" className="w-20 h-20 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <span className="w-20 h-20 rounded-full bg-brand-500 text-white text-3xl font-bold flex items-center justify-center">
                {firstName[0]}
              </span>
            )}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h2 className="text-xl font-semibold text-ink break-words">{user.name}</h2>
              <p className="text-slate-500 break-all">{user.email}</p>
              <span
                className={`mt-2 inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                  isAdmin ? "bg-ink text-white" : "bg-brand-100 text-brand-600"
                }`}
              >
                {isAdmin ? "Admin" : "Member"}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="shrink-0 border border-slate-300 hover:border-slate-400 font-semibold px-4 py-2 rounded-lg"
            >
              Sign out
            </button>
          </section>

          {isAdmin && (
            <a
              href="/admin"
              className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-ink text-white p-6 hover:bg-slate-800"
            >
              <span>
                <span className="block font-semibold text-lg">Admin dashboard</span>
                <span className="block text-sm text-slate-300">Manage users and see sign-up and activity analytics.</span>
              </span>
              <span aria-hidden="true" className="text-2xl">
                →
              </span>
            </a>
          )}

          <section className="mt-6 grid sm:grid-cols-3 gap-4" aria-label="Account details">
            {[
              ["Member since", account ? formatDate(account.createdAt) : "—"],
              ["Last sign-in", account ? formatDate(account.lastLoginAt) : "—"],
              ["Total sign-ins", account ? account.loginCount : "—"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white border border-slate-200 p-5">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-1 text-lg font-semibold text-ink">{value}</p>
              </div>
            ))}
          </section>
        </div>
      </main>
    </>
  );
}
