// Fake but realistic users and sign-ins for the public demo of the admin dashboard.
// Generated from a fixed seed, relative to "now", so charts always show recent activity.
// All emails use the reserved example.com domain; no real people are included.

const FIRST = ["Aarav", "Diya", "Vihaan", "Ananya", "Arjun", "Ishita", "Kabir", "Meera", "Rohan", "Saanvi", "Aditya", "Priya",
  "Karthik", "Neha", "Siddharth", "Riya", "Varun", "Tanvi", "Nikhil", "Pooja", "Harsh", "Sneha", "Manav", "Kavya"];
const LAST = ["Sharma", "Iyer", "Reddy", "Patel", "Nair", "Gupta", "Rao", "Menon", "Joshi", "Kulkarni", "Singh", "Bose", "Das", "Pillai"];

const DAY = 24 * 60 * 60 * 1000;

// Small deterministic random number generator (mulberry32)
function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function demoData(now = Date.now(), count = 48) {
  const rand = rng(2026);
  const users = [];
  const events = [];

  for (let i = 0; i < count; i++) {
    const first = FIRST[i % FIRST.length];
    const last = LAST[Math.floor(rand() * LAST.length)];
    // More sign-ups in recent weeks, like a startup that's growing
    const ageDays = Math.floor(Math.pow(rand(), 1.6) * 60);
    const createdAt = now - ageDays * DAY - Math.floor(rand() * DAY);
    const id = `demo-${i + 1}`;

    // Sign-ins: active users log in often, others rarely
    const activity = rand();
    const loginTimes = [createdAt];
    const days = Math.min(ageDays, 30);
    for (let d = days; d >= 0; d--) {
      if (rand() < activity * 0.45) loginTimes.push(now - d * DAY - Math.floor(rand() * DAY * 0.9));
    }
    const valid = loginTimes.filter((t) => t >= createdAt && t <= now).sort((a, b) => a - b);
    valid.forEach((t) => events.push({ userId: id, createdAt: new Date(t).toISOString() }));

    users.push({
      id,
      name: `${first} ${last}`,
      email: `${first}.${last}${i}`.toLowerCase() + "@example.com",
      image: null,
      role: i === 0 || i === 7 ? "admin" : "user",
      status: i % 13 === 5 ? "suspended" : "active",
      loginCount: valid.length,
      createdAt: new Date(createdAt).toISOString(),
      lastLoginAt: new Date(valid[valid.length - 1]).toISOString(),
    });
  }

  users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return { users, events, currentUserId: "demo-1" };
}
