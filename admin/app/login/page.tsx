'use client';

import { useActionState } from 'react';
import { login } from '@/lib/actions';

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null as null | { error?: string });

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form action={action} className="w-full max-w-sm bg-card border border-line rounded-xl p-7">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-md bg-red text-paper flex items-center justify-center font-serif">cb</div>
          <span className="font-serif text-lg">Corporate BlaBla Decoder</span>
        </div>
        <h1 className="text-xl font-serif mb-1">Admin</h1>
        <p className="text-sm text-inkSoft mb-5">Enter the admin password to continue.</p>

        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          className="w-full rounded-md border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-red"
        />
        {state?.error && <p className="text-red text-sm mt-3">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="mt-5 w-full rounded-md bg-ink text-paper py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {pending ? '…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
