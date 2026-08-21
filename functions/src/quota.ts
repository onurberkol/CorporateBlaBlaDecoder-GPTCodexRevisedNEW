import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
import { FREE_DAILY_ACTIONS, RESET_TZ } from './config';

export type Tier = 'free' | 'premium';
export type Action = 'decode' | 'compose';

export interface QuotaResult {
  tier: Tier;
  /** Remaining shared free actions today. Premium reports null (unlimited). */
  remaining: Record<Action, number | null>;
}

/** Date key (YYYY-MM-DD) in the reset timezone. */
function todayKey(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: RESET_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/**
 * Atomically checks the user's tier and daily quota, throws if a free user is
 * over the limit, otherwise increments the counter for `action`.
 *
 * The `tier` field is the source of truth for premium and is set by the
 * RevenueCat webhook (added in a later step). Missing user docs default to free.
 */
export async function consumeQuota(
  uid: string,
  action: Action
): Promise<QuotaResult> {
  const db = getFirestore();
  const ref = db.collection('users').doc(uid);
  const day = todayKey();

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists ? snap.data()! : {};
    const tier: Tier = data.tier === 'premium' ? 'premium' : 'free';

    const usage =
      data.usage && data.usage.date === day
        ? { ...data.usage }
        : { date: day, decode: 0, compose: 0 };

    if (tier === 'free') {
      const used = Number(usage.decode ?? 0) + Number(usage.compose ?? 0);
      const limit = FREE_DAILY_ACTIONS;
      if (used >= limit) {
        throw new HttpsError(
          'resource-exhausted',
          `Daily free limit reached for ${action}.`,
          { action, limit, tier }
        );
      }
    }

    usage[action] = (usage[action] ?? 0) + 1;

    tx.set(
      ref,
      {
        tier,
        usage,
        lastSeen: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const freeRemaining = Math.max(0, FREE_DAILY_ACTIONS - Number(usage.decode ?? 0) - Number(usage.compose ?? 0));
    const remaining: Record<Action, number | null> = { decode: tier === 'premium' ? null : freeRemaining, compose: tier === 'premium' ? null : freeRemaining };

    return { tier, remaining };
  });
}

/** Refund a provider-side failure so a user never loses a free request to our outage. */
export async function refundQuota(uid: string, action: Action): Promise<void> {
  const db = getFirestore();
  const ref = db.collection('users').doc(uid);
  const day = todayKey();
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data();
    if (!data || data.tier === 'premium' || data.usage?.date !== day) return;
    const usage = { ...data.usage };
    usage[action] = Math.max(0, Number(usage[action] ?? 0) - 1);
    tx.set(ref, { usage, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  });
}
