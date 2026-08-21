import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { logout } from '@/lib/actions';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-card">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-red text-paper flex items-center justify-center text-xs font-serif">cb</div>
              <span className="font-serif">Admin</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm text-inkSoft">
              <Link href="/" className="hover:text-ink">Dashboard</Link>
              <Link href="/plaza" className="hover:text-ink">Plaza</Link>
              <Link href="/users" className="hover:text-ink">Users</Link>
            </nav>
          </div>
          <form action={logout}>
            <button className="text-sm text-inkSoft hover:text-red">Sign out</button>
          </form>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-5 py-8">{children}</main>
    </div>
  );
}
