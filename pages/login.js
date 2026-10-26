import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth/next";
import { signIn } from "next-auth/react";
import { authOptions } from "@/lib/auth";
import { COMPANY } from "@/lib/content";
import { Logo } from "@/components/Navbar";

// Only allow redirects back into this site
const safeCallback = (url) => (typeof url === "string" && url.startsWith("/") && !url.startsWith("//") ? url : "/dashboard");

export async function getServerSideProps({ req, res, query }) {
  const session = await getServerSession(req, res, authOptions);
  if (session) return { redirect: { destination: safeCallback(query.callbackUrl), permanent: false } };
  return { props: {} };
}

const ERRORS = {
  AccessDenied: "Your Google account's email isn't verified. Please use a verified account.",
  Suspended: "Your account has been suspended by an admin. Contact support if you think this is a mistake.",
  OAuthAccountNotLinked: "This email is already linked to another sign-in method.",
  Configuration: "Sign-in isn't configured correctly on the server. Please try again later.",
  default: "Sign-in didn't work. Please try again.",
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-5 h-5 shrink-0" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export default function Login() {
  const { query } = useRouter();
  const [loading, setLoading] = useState(false);
  const callbackUrl = safeCallback(query.callbackUrl);
  const error = query.error ? ERRORS[query.error] || ERRORS.default : "";

  return (
    <>
      <Head>
        <title>{`Sign in · ${COMPANY.name}`}</title>
        <meta name="description" content={`Sign in to ${COMPANY.name} with your Google account.`} />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex flex-col items-center justify-center px-5 py-12">
        <Logo />

        <div className="mt-8 w-full max-w-sm rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 p-8">
          <h1 className="text-2xl font-bold text-ink text-center">Sign in to {COMPANY.name}</h1>
          <p className="mt-2 text-sm text-slate-500 text-center">Use your Google account to access your dashboard.</p>

          {error && (
            <p role="alert" className="mt-5 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
              {error}
            </p>
          )}

          <button
            onClick={() => {
              setLoading(true);
              signIn("google", { callbackUrl });
            }}
            disabled={loading}
            className="mt-6 w-full flex items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <GoogleIcon />
            {loading ? "Redirecting to Google..." : "Continue with Google"}
          </button>

          <p className="mt-6 text-xs text-slate-500 text-center leading-relaxed">
            We only read your name, email and profile photo. Sign-in is handled securely by Google with NextAuth.
          </p>
        </div>

        <p className="mt-6 text-sm text-slate-500 text-center">
          Just looking around?{" "}
          <Link href="/admin/demo" className="font-semibold text-brand-600 hover:underline">
            Explore the admin dashboard demo →
          </Link>
        </p>
        <Link href="/" className="mt-3 text-sm text-slate-500 hover:text-brand-600">
          ← Back to home
        </Link>
      </main>
    </>
  );
}
