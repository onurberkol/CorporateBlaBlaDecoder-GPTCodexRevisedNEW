import { getMetrics, recentUsers } from '@/lib/data';
import { Card, Stat } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function Users() {
  const [m, users] = await Promise.all([getMetrics(), recentUsers(50)]);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">Users</h1>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Total" value={m.totalUsers.toLocaleString()} />
        <Stat label="Premium" value={m.premiumUsers.toLocaleString()} />
        <Stat label="Active today" value={m.activeToday.toLocaleString()} />
      </div>

      <Card>
        <h2 className="font-serif text-lg mb-3">Recent activity</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted text-[11px] uppercase tracking-wider">
              <th className="pb-2">User</th>
              <th className="pb-2">Tier</th>
              <th className="pb-2">Streak</th>
              <th className="pb-2">Last seen (UTC)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.uid}>
                <td className="py-2 font-mono text-inkSoft">{u.uid.slice(0, 10)}…</td>
                <td className="py-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${u.tier === 'premium' ? 'bg-redWash text-redText' : 'bg-surfaceAlt text-inkSoft'}`}>{u.tier}</span>
                </td>
                <td className="py-2">{u.streak}</td>
                <td className="py-2 text-inkSoft">{u.lastSeen ?? '—'}</td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={4} className="py-4 text-muted">No users yet.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
