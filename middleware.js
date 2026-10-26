import { withAuth } from "next-auth/middleware";

// Protected routes: signed-out visitors are redirected to /login?callbackUrl=...
// /admin also checks the admin role in the database. /admin/demo stays public.
export default withAuth({ pages: { signIn: "/login" } });

export const config = { matcher: ["/dashboard/:path*", "/admin"] };
