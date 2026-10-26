import Head from "next/head";
import { demoData } from "@/lib/demoData";
import { COMPANY } from "@/lib/content";
import Navbar from "@/components/Navbar";
import AdminDashboard from "@/components/admin/AdminDashboard";

// Public, read-only showcase of the admin dashboard with generated sample data
export async function getServerSideProps() {
  const now = Date.now();
  const { users, events, currentUserId } = demoData(now);
  return { props: { now, users, events, currentUserId } };
}

export default function AdminDemo({ users, events, currentUserId, now }) {
  return (
    <>
      <Head>
        <title>{`Admin dashboard demo · ${COMPANY.name}`}</title>
        <meta name="description" content="Explore the Kavya Labs admin dashboard (user management and analytics) with sample data." />
      </Head>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] bg-slate-50">
        <AdminDashboard mode="demo" initialUsers={users} events={events} currentUserId={currentUserId} now={now} />
      </main>
    </>
  );
}
