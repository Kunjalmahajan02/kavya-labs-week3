import { useMemo, useState } from "react";
import Link from "next/link";
import { computeAnalytics } from "@/lib/analytics";
import { StatCard, BarChart, Breakdown } from "@/components/admin/Charts";
import UsersTable from "@/components/admin/UsersTable";

const CHANGES = {
  promote: { role: "admin" },
  demote: { role: "user" },
  suspend: { status: "suspended" },
  activate: { status: "active" },
};

const MESSAGES = {
  promote: "is now an admin",
  demote: "is no longer an admin",
  suspend: "has been suspended",
  activate: "has been reactivated",
  delete: "has been deleted",
};

/**
 * The admin dashboard: analytics overview and user management.
 * mode "live": actions call the admin API. mode "demo": actions only change local state.
 */
export default function AdminDashboard({ mode, initialUsers, events, currentUserId, protectedIds = [], now }) {
  const [tab, setTab] = useState("overview");
  const [users, setUsers] = useState(initialUsers);
  const [toast, setToast] = useState(null);
  const demo = mode === "demo";

  const stats = useMemo(() => computeAnalytics(users, events, now), [users, events, now]);
  const { kpis } = stats;

  const notify = (text, error = false) => {
    setToast({ text, error });
    setTimeout(() => setToast(null), 3500);
  };

  async function handleAction(user, action) {
    const who = user.name || user.email;
    try {
      if (!demo) {
        const res = await fetch(`/api/admin/users/${user.id}`, {
          method: action === "delete" ? "DELETE" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: action === "delete" ? undefined : JSON.stringify(CHANGES[action]),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
      }
      setUsers((list) =>
        action === "delete" ? list.filter((u) => u.id !== user.id) : list.map((u) => (u.id === user.id ? { ...u, ...CHANGES[action] } : u))
      );
      notify(`${who} ${MESSAGES[action]}${demo ? " (demo, not saved)" : ""}`);
    } catch (err) {
      notify(err.message, true);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      {demo && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Demo mode:</strong> this is the real admin dashboard filled with sample data, so anyone can explore it without
          signing in. Changes here aren't saved. Admins see live data at{" "}
          <Link href="/admin" className="underline font-semibold">
            /admin
          </Link>
          .
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-600">Admin dashboard</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-ink break-words">User management & analytics</h1>
        </div>
        <div role="tablist" aria-label="Admin sections" className="inline-flex max-w-full rounded-xl bg-slate-100 p-1 text-sm font-semibold">
          {[
            ["overview", "Analytics"],
            ["users", `Users (${users.length})`],
          ].map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap ${tab === key ? "bg-white shadow text-ink" : "text-slate-500 hover:text-ink"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" ? (
        <div className="mt-8 space-y-6">
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Key metrics">
            <StatCard label="Total users" value={kpis.totalUsers} hint={`${kpis.admins} admins · ${kpis.suspended} suspended`} />
            <StatCard label="New users (7 days)" value={kpis.newThisWeek} change={kpis.newUsersChange} />
            <StatCard label="Active users (7 days)" value={kpis.activeThisWeek} change={kpis.activeUsersChange} />
            <StatCard label="Sign-ins (30 days)" value={kpis.signIns30} hint="Every Google sign-in is logged" />
          </section>

          <section className="grid lg:grid-cols-2 gap-6" aria-label="Charts">
            <BarChart
              title="New sign-ups per day"
              total={stats.signupsByDay.reduce((s, d) => s + d.count, 0)}
              data={stats.signupsByDay}
            />
            <BarChart
              title="Sign-ins per day"
              total={stats.signInsByDay.reduce((s, d) => s + d.count, 0)}
              data={stats.signInsByDay}
              color="#0b1020"
            />
          </section>

          <section className="grid md:grid-cols-3 gap-6">
            <Breakdown title="Roles" items={stats.roles} />
            <Breakdown title="Account status" items={stats.statuses} colors={["#10b981", "#ef4444"]} />
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <p className="font-semibold text-ink">Most active (30 days)</p>
              <ol className="mt-4 space-y-2 text-sm">
                {stats.topUsers.map((u, i) => (
                  <li key={u.id} className="flex items-center gap-2 min-w-0">
                    <span className="w-5 text-slate-400">{i + 1}.</span>
                    <span className="truncate text-slate-700">{u.name || u.email}</span>
                    <span className="ml-auto font-semibold text-ink whitespace-nowrap">{u.logins} sign-ins</span>
                  </li>
                ))}
                {stats.topUsers.length === 0 && <li className="text-slate-500">No sign-ins yet.</li>}
              </ol>
            </div>
          </section>
        </div>
      ) : (
        <div className="mt-8">
          <UsersTable users={users} currentUserId={currentUserId} protectedIds={protectedIds} now={now} onAction={handleAction} />
        </div>
      )}

      {toast && (
        <p
          role="status"
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-[90vw] rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
            toast.error ? "bg-red-600 text-white" : "bg-ink text-white"
          }`}
        >
          {toast.text}
        </p>
      )}
    </div>
  );
}
