import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { REGION, ENFORCE_APP_CHECK } from './config';

/**
 * Called once per user per day when they open the Plaza card. Increments the
 * aggregate "you're not alone" counter and returns the running total. Counting
 * is server-side so the number can't be inflated by clients.
 */
export const openPlaza = onCall(
  { region: REGION, memory: '128MiB', timeoutSeconds: 15, enforceAppCheck: ENFORCE_APP_CHECK },
  async (req) => {
    if (!req.auth?.uid) throw new HttpsError('unauthenticated', 'Sign-in required.');
    const day = (req.data as { day?: string })?.day;
    if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day))
      throw new HttpsError('invalid-argument', 'day must be YYYY-MM-DD.');

    const db = getFirestore();
    const ref = db.collection('plazaStats').doc(day);

    // Only count a given user once per day (idempotent via a seen marker).
    const seenRef = ref.collection('seen').doc(req.auth.uid);
    const count = await db.runTransaction(async (tx) => {
      const seen = await tx.get(seenRef);
      const cur = await tx.get(ref);
      const base = (cur.data()?.count as number) ?? 0;
      if (seen.exists) return base;
      tx.set(ref, { date: day, count: FieldValue.increment(1) }, { merge: true });
      tx.set(seenRef, { at: FieldValue.serverTimestamp() });
      return base + 1;
    });

    return { count };
  }
);
