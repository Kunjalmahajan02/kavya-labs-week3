import { useMemo, useState } from "react";

const PAGE_SIZE = 10;

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

function timeAgo(iso, now) {
  const mins = Math.round((now - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days < 30 ? `${days} d ago` : formatDate(iso);
}

function Avatar({ user }) {
  return user.image ? (
    <img src={user.image} alt="" className="w-9 h-9 rounded-full shrink-0" referrerPolicy="no-referrer" />
  ) : (
    <span className="w-9 h-9 rounded-full shrink-0 bg-brand-100 text-brand-600 font-semibold flex items-center justify-center">
      {(user.name || user.email)[0].toUpperCase()}
    </span>
  );
}

function Badge({ children, tone }) {
  const tones = {
    admin: "bg-ink text-white",
    user: "bg-slate-100 text-slate-700",
    active: "bg-emerald-50 text-emerald-700",
    suspended: "bg-red-50 text-red-700",
  };
  return <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${tones[tone]}`}>{children}</span>;
}

function exportCsv(users) {
  const rows = [["Name", "Email", "Role", "Status", "Sign-ins", "Joined", "Last sign-in"]];
  users.forEach((u) => rows.push([u.name || "", u.email, u.role, u.status, u.loginCount, u.createdAt, u.lastLoginAt]));
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "kavya-users.csv" });
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * User management table: search, filters, sorting, pagination and per-user actions.
 * onAction(user, action) performs "promote" | "demote" | "suspend" | "activate" | "delete".
 */
export default function UsersTable({ users, currentUserId, protectedIds = [], now, onAction }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(0);
  const [busyId, setBusyId] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = users.filter(
      (u) =>
        (!q || (u.name || "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
        (role === "all" || u.role === role) &&
        (status === "all" || u.status === status)
    );
    const by = {
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      recent: (a, b) => new Date(b.lastLoginAt) - new Date(a.lastLoginAt),
      logins: (a, b) => b.loginCount - a.loginCount,
      name: (a, b) => (a.name || a.email).localeCompare(b.name || b.email),
    };
    return [...list].sort(by[sort]);
  }, [users, query, role, status, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  async function act(user, action) {
    if (action === "delete" && !window.confirm(`Delete ${user.name || user.email}? This can't be undone.`)) return;
    setBusyId(user.id);
    try {
      await onAction(user, action);
    } finally {
      setBusyId(null);
    }
  }

  const resetPage = (fn) => (e) => {
    fn(e.target.value);
    setPage(0);
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200">
      <div className="p-4 flex flex-wrap gap-3 items-center border-b border-slate-200">
        <input
          type="search"
          value={query}
          onChange={resetPage(setQuery)}
          placeholder="Search name or email..."
          aria-label="Search users"
          className="flex-1 min-w-[12rem] rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
        />
        <select value={role} onChange={resetPage(setRole)} aria-label="Filter by role" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="all">All roles</option>
          <option value="admin">Admins</option>
          <option value="user">Members</option>
        </select>
        <select value={status} onChange={resetPage(setStatus)} aria-label="Filter by status" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort users" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="recent">Recently active</option>
          <option value="logins">Most sign-ins</option>
          <option value="name">Name A–Z</option>
        </select>
        <button onClick={() => exportCsv(filtered)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:border-slate-400">
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">Sign-ins</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">Last active</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((u) => {
              const locked = u.id === currentUserId || protectedIds.includes(u.id);
              const busy = busyId === u.id;
              return (
                <tr key={u.id} className={busy ? "opacity-50" : ""}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-[14rem]">
                      <Avatar user={u} />
                      <div className="min-w-0">
                        <p className="font-medium text-ink truncate">
                          {u.name || "—"} {u.id === currentUserId && <span className="text-xs text-slate-400">(you)</span>}
                        </p>
                        <p className="text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={u.role}>{u.role === "admin" ? "Admin" : "Member"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={u.status}>{u.status === "suspended" ? "Suspended" : "Active"}</Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{u.loginCount}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{timeAgo(u.lastLoginAt, now)}</td>
                  <td className="px-4 py-3">
                    {locked ? (
                      <p className="text-right text-xs text-slate-400 whitespace-nowrap">{u.id === currentUserId ? "Your account" : "Owner admin"}</p>
                    ) : (
                      <div className="flex justify-end gap-1.5 whitespace-nowrap">
                        <button
                          disabled={busy}
                          onClick={() => act(u, u.role === "admin" ? "demote" : "promote")}
                          className="px-2.5 py-1 rounded-md border border-slate-300 hover:border-slate-400 text-xs font-semibold"
                        >
                          {u.role === "admin" ? "Remove admin" : "Make admin"}
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => act(u, u.status === "suspended" ? "activate" : "suspend")}
                          className="px-2.5 py-1 rounded-md border border-slate-300 hover:border-slate-400 text-xs font-semibold"
                        >
                          {u.status === "suspended" ? "Reactivate" : "Suspend"}
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => act(u, "delete")}
                          className="px-2.5 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  No users match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 text-sm text-slate-500">
        <p>
          Showing {filtered.length ? current * PAGE_SIZE + 1 : 0}–{Math.min((current + 1) * PAGE_SIZE, filtered.length)} of{" "}
          {filtered.length} users
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(current - 1)}
            disabled={current === 0}
            className="px-3 py-1.5 rounded-md border border-slate-300 disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="px-2 py-1.5">
            {current + 1} / {pages}
          </span>
          <button
            onClick={() => setPage(current + 1)}
            disabled={current >= pages - 1}
            className="px-3 py-1.5 rounded-md border border-slate-300 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
