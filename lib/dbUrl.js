// Kavya Labs keeps its tables in their own Postgres schema so it can share a Supabase
// database with other projects without touching their tables. Week 3 uses its own schema
// ("kavya_week3") so its new columns never clash with the Week 2 deployment.
// Users paste the normal Supabase URLs; this adds ?schema=... for Prisma.
const SCHEMA = "kavya_week3";

function withSchema(url) {
  if (!url || /[?&]schema=/.test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}schema=${SCHEMA}`;
}

module.exports = { withSchema, SCHEMA };
