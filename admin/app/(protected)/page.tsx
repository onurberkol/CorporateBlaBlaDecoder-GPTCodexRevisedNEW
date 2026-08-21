import Link from 'next/link';
import { getMetrics, listPlaza } from '@/lib/data';
import { Card, Stat } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const [m, plaza] = await Promise.all([getMetrics(), listPlaza(6)]);
  const pct = m.totalUsers ? Math.round((m.premiumUsers / m.totalUsers) * 100) : 0;

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total users" value={m.totalUsers.toLocaleString()} />
        <Stat label="Premium" value={m.premiumUsers.toLocaleString()} sub={`${pct}% conversion`} />
        <Stat label="Active today" value={m.activeToday.toLocaleString()} />
        <Stat label="Plaza opens today" value={m.plazaCrowdToday.toLocaleString()} />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-lg">Upcoming Plaza cards</h2>
          <Link href="/plaza" className="text-sm text-red">Manage →</Link>
        </div>
        <ul className="divide-y divide-line">
          {plaza.map((c) => (
            <li key={c.date} className="py-2.5 flex items-center justify-between text-sm">
              <span className="font-mono text-inkSoft">{c.date}</span>
              <span className="px-2 py-0.5 rounded bg-surfaceAlt text-redText text-xs uppercase tracking-wide">{c.format}</span>
              <Link href={`/plaza/${c.date}`} className="text-red">Edit</Link>
            </li>
          ))}
          {plaza.length === 0 && <li className="py-3 text-sm text-muted">No cards yet — run the content pipeline.</li>}
        </ul>
      </Card>
    </div>
  );
}
