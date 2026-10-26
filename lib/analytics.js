// Pure functions that turn users + sign-in events into dashboard analytics.
// Shared by the live admin dashboard and the demo, and safe to run in the browser.

const DAY = 24 * 60 * 60 * 1000;
const IST_OFFSET = 5.5 * 60 * 60 * 1000;

// Calendar day in India time, e.g. "2026-10-26"
export const dayKey = (time) => new Date(new Date(time).getTime() + IST_OFFSET).toISOString().slice(0, 10);

function lastNDays(n, now) {
  return Array.from({ length: n }, (_, i) => {
    const key = dayKey(now - (n - 1 - i) * DAY);
    const label = new Date(`${key}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
    return { key, label };
  });
}

function countByDay(times, days) {
  const counts = Object.fromEntries(days.map((d) => [d.key, 0]));
  for (const t of times) {
    const key = dayKey(t);
    if (key in counts) counts[key]++;
  }
  return days.map((d) => ({ ...d, count: counts[d.key] }));
}

const pctChange = (current, previous) => (previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100));

/**
 * users:  [{ id, name, email, role, status, createdAt, lastLoginAt, loginCount }]
 * events: [{ userId, createdAt }]  sign-ins from (at least) the last 30 days
 */
export function computeAnalytics(users, events, now = Date.now()) {
  const within = (time, from, to = now) => {
    const t = new Date(time).getTime();
    return t > from && t <= to;
  };
  const weekAgo = now - 7 * DAY;
  const twoWeeksAgo = now - 14 * DAY;

  const userIds = new Set(users.map((u) => u.id));
  const liveEvents = events.filter((e) => userIds.has(e.userId)); // ignore events of deleted users

  const newThisWeek = users.filter((u) => within(u.createdAt, weekAgo)).length;
  const newLastWeek = users.filter((u) => within(u.createdAt, twoWeeksAgo, weekAgo)).length;
  const activeThisWeek = new Set(liveEvents.filter((e) => within(e.createdAt, weekAgo)).map((e) => e.userId)).size;
  const activeLastWeek = new Set(liveEvents.filter((e) => within(e.createdAt, twoWeeksAgo, weekAgo)).map((e) => e.userId)).size;
  const signIns30 = liveEvents.filter((e) => within(e.createdAt, now - 30 * DAY)).length;

  const days = lastNDays(30, now);
  const loginsPerUser = {};
  for (const e of liveEvents) loginsPerUser[e.userId] = (loginsPerUser[e.userId] || 0) + 1;

  return {
    kpis: {
      totalUsers: users.length,
      newThisWeek,
      newUsersChange: pctChange(newThisWeek, newLastWeek),
      activeThisWeek,
      activeUsersChange: pctChange(activeThisWeek, activeLastWeek),
      signIns30,
      admins: users.filter((u) => u.role === "admin").length,
      suspended: users.filter((u) => u.status === "suspended").length,
    },
    signupsByDay: countByDay(users.map((u) => u.createdAt), days),
    signInsByDay: countByDay(liveEvents.map((e) => e.createdAt), days),
    roles: [
      { label: "Members", count: users.filter((u) => u.role !== "admin").length },
      { label: "Admins", count: users.filter((u) => u.role === "admin").length },
    ],
    statuses: [
      { label: "Active", count: users.filter((u) => u.status !== "suspended").length },
      { label: "Suspended", count: users.filter((u) => u.status === "suspended").length },
    ],
    topUsers: users
      .map((u) => ({ id: u.id, name: u.name, email: u.email, logins: loginsPerUser[u.id] || 0 }))
      .filter((u) => u.logins > 0)
      .sort((a, b) => b.logins - a.logins)
      .slice(0, 5),
  };
}
