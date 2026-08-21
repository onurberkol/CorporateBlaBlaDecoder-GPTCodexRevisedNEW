import Link from 'next/link';
import { getCard } from '@/lib/data';
import { Card } from '@/components/ui';
import { CardForm } from '@/components/CardForm';
import type { PlazaFormat } from '@corporate-blabla/core';

export const dynamic = 'force-dynamic';

function stripKind(payload: any): string {
  if (!payload) return '';
  const { kind, ...rest } = payload;
  return JSON.stringify(rest, null, 2);
}

export default async function EditCard({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const card = await getCard(date);

  const format: PlazaFormat = card?.format ?? 'trap';
  const tr = card ? stripKind(card.locales.tr) : '';
  const en = card ? stripKind(card.locales.en) : '';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/plaza" className="text-sm text-red">← Plaza</Link>
        <h1 className="font-serif text-2xl">{date}</h1>
        {!card && <span className="text-xs text-muted">(new)</span>}
      </div>

      <Card>
        <CardForm date={date} format={format} tr={tr} en={en} />
      </Card>
    </div>
  );
}
