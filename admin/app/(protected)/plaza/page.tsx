import Link from 'next/link';
import { listPlaza } from '@/lib/data';
import { Card } from '@/components/ui';
import { DateJump } from '@/components/DateJump';

export const dynamic = 'force-dynamic';

export default async function PlazaList() {
  const cards = await listPlaza(60);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl">Daily Plaza</h1>
        <DateJump />
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted text-[11px] uppercase tracking-wider">
              <th className="pb-2">Date</th>
              <th className="pb-2">Format</th>
              <th className="pb-2">Preview (TR)</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {cards.map((c) => {
              const p: any = c.locales.tr;
              const preview =
                c.format === 'trap' ? p.incoming :
                c.format === 'riddle' ? p.term :
                c.format === 'horoscope' ? p.sign :
                (p.cells?.[0] ?? '');
              return (
                <tr key={c.date}>
                  <td className="py-2.5 font-mono text-inkSoft">{c.date}</td>
                  <td className="py-2.5"><span className="px-2 py-0.5 rounded bg-surfaceAlt text-redText text-xs uppercase">{c.format}</span></td>
                  <td className="py-2.5 text-inkText truncate max-w-[260px]">{preview}</td>
                  <td className="py-2.5 text-right"><Link href={`/plaza/${c.date}`} className="text-red">Edit</Link></td>
                </tr>
              );
            })}
            {cards.length === 0 && (
              <tr><td colSpan={4} className="py-4 text-muted">No cards yet — run the content pipeline or create one above.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
