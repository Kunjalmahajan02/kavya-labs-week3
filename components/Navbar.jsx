import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { COMPANY, NAV_LINKS } from "@/lib/content";

export function Logo({ light = false }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-bold text-lg ${light ? "text-white" : "text-ink"}`}>
      <span className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center">K</span>
      {COMPANY.name}
    </Link>
  );
}

function Avatar({ user }) {
  return user.image ? (
    <img src={user.image} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
  ) : (
    <span className="w-8 h-8 rounded-full bg-brand-500 text-white text-sm font-bold flex items-center justify-center">
      {(user.name || user.email || "?")[0].toUpperCase()}
    </span>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-slate-200">
      <nav className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4" aria-label="Main">
        <Logo />

        <ul className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
          {NAV_LINKS.map(([href, label]) => (
            <li key={href}>
              <a href={href} className="hover:text-brand-600">
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3 text-sm font-semibold min-w-[11rem] justify-end">
          {status === "loading" ? null : user ? (
            <>
              {user.role === "admin" && (
                <Link href="/admin" className="text-slate-700 hover:text-brand-600">
                  Admin
                </Link>
              )}
              <Link href="/dashboard" className="flex items-center gap-2 text-slate-700 hover:text-brand-600">
                <Avatar user={user} />
                Dashboard
              </Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="text-slate-500 hover:text-ink">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/admin/demo" className="text-slate-500 hover:text-brand-600 whitespace-nowrap">
                Admin demo
              </Link>
              <Link href="/login" className="text-slate-700 hover:text-brand-600 whitespace-nowrap">
                Sign in
              </Link>
              <Link href="/login" className="bg-ink text-white px-4 py-2 rounded-lg hover:bg-slate-800">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          className="lg:hidden p-2 -mr-2 text-2xl leading-none"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {open && (
        <ul className="lg:hidden border-t border-slate-200 bg-white px-5 py-3 space-y-1">
          {NAV_LINKS.map(([href, label]) => (
            <li key={href}>
              <a href={href} onClick={() => setOpen(false)} className="block py-2 font-medium text-slate-700">
                {label}
              </a>
            </li>
          ))}
          <li className="pt-2 border-t border-slate-100">
            {user ? (
              <div className="flex items-center justify-between py-2">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-slate-700">
                  <Avatar user={user} />
                  Dashboard
                </Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-slate-500">
                  Sign out
                </button>
              </div>
            ) : (
              <Link href="/login" className="block py-2 font-semibold text-brand-600">
                Sign in with Google
              </Link>
            )}
            <Link href={user?.role === "admin" ? "/admin" : "/admin/demo"} className="block py-2 font-medium text-slate-700">
              {user?.role === "admin" ? "Admin dashboard" : "Admin dashboard demo"}
            </Link>
          </li>
        </ul>
      )}
    </header>
  );
}
