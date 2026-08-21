'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DateJump() {
  const router = useRouter();
  const [date, setDate] = useState('');
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded-md border border-line bg-paper px-2.5 py-1.5 text-sm"
      />
      <button
        onClick={() => date && router.push(`/plaza/${date}`)}
        className="rounded-md bg-ink text-paper px-3 py-1.5 text-sm"
      >
        Open / create
      </button>
    </div>
  );
}
