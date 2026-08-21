'use client';

import { useActionState } from 'react';
import { saveCard } from '@/lib/actions';
import { PLAZA_ROTATION, type PlazaFormat } from '@corporate-blabla/core';

const HINTS: Record<PlazaFormat, string> = {
  trap: '{ "incoming": "...", "reading": "...", "meter": 64 }',
  riddle: '{ "term": "...", "answer": "..." }',
  horoscope: '{ "sign": "...", "text": "..." }',
  bingo: '{ "cells": ["1","2","3","4","5","6","7","8","9"] }',
};

export function CardForm({
  date,
  format,
  tr,
  en,
}: {
  date: string;
  format: PlazaFormat;
  tr: string;
  en: string;
}) {
  const [state, action, pending] = useActionState(
    saveCard,
    null as null | { error?: string; ok?: boolean }
  );

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="date" value={date} />

      <div>
        <label className="text-[11px] uppercase tracking-wider text-muted">Format</label>
        <select
          name="format"
          defaultValue={format}
          className="mt-1 block rounded-md border border-line bg-paper px-3 py-2 text-sm"
        >
          {PLAZA_ROTATION.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] uppercase tracking-wider text-muted">TR payload (JSON)</label>
          <textarea
            name="tr"
            defaultValue={tr}
            spellCheck={false}
            className="mt-1 w-full h-44 rounded-md border border-line bg-paper p-3 font-mono text-xs"
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-wider text-muted">EN payload (JSON)</label>
          <textarea
            name="en"
            defaultValue={en}
            spellCheck={false}
            className="mt-1 w-full h-44 rounded-md border border-line bg-paper p-3 font-mono text-xs"
          />
        </div>
      </div>

      <p className="text-xs text-muted">
        Shape for <b>{format}</b>: <code className="text-redText">{HINTS[format]}</code> (no “kind” field — it’s added automatically)
      </p>

      {state?.error && <p className="text-red text-sm">{state.error}</p>}
      {state?.ok && <p className="text-redText text-sm">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-red text-paper px-5 py-2.5 text-sm font-medium disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Save card'}
      </button>
    </form>
  );
}
