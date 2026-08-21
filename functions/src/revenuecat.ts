import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { REVENUECAT_WEBHOOK_AUTH, REGION } from './config';
import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * Event types that mean the user currently HAS premium access.
 * Note: CANCELLATION is intentionally absent — a cancelled subscription keeps
 * access until it EXPIRES, so we only downgrade on EXPIRATION.
 */
const ACTIVE = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'UNCANCELLATION',
  'PRODUCT_CHANGE',
  'NON_RENEWING_PURCHASE',
  'SUBSCRIPTION_EXTENDED',
]);

const INACTIVE = new Set(['EXPIRATION', 'SUBSCRIPTION_PAUSED']);

function secureEquals(a: string | undefined, b: string): boolean {
  if (!a) return false;
  const left = createHash('sha256').update(a).digest();
  const right = createHash('sha256').update(b).digest();
  return timingSafeEqual(left, right);
}

/**
 * RevenueCat -> Firestore tier sync. This is the ONLY writer of `users.tier`.
 * Configure RevenueCat to POST here with an Authorization header equal to the
 * REVENUECAT_WEBHOOK_AUTH secret, and set the app's RevenueCat appUserID to the
 * Firebase uid so `app_user_id` maps directly to the user doc.
 */
export const revenuecatWebhook = onRequest(
  {
    region: REGION,
    secrets: [REVENUECAT_WEBHOOK_AUTH],
    memory: '128MiB',
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }
    if (!secureEquals(req.header('Authorization'), REVENUECAT_WEBHOOK_AUTH.value())) {
      res.status(401).send('Unauthorized');
      return;
    }

    const event = req.body?.event;
    const type: string | undefined = event?.type;
    const uid: string | undefined = event?.app_user_id;

    if (!type || !uid) {
      res.status(400).send('Malformed event');
      return;
    }

    // TRANSFER and other informational events: acknowledge, no tier change.
    if (!ACTIVE.has(type) && !INACTIVE.has(type)) {
      res.status(200).send('Ignored');
      return;
    }

    const becomesPremium = ACTIVE.has(type);
    const db = getFirestore();

    // RevenueCat retries webhooks and can deliver events out of order. Persist
    // the event id and only let a newer event change entitlement state.
    const eventId = String(event?.id ?? `${uid}:${type}:${event?.event_timestamp_ms ?? ''}`);
    const eventTime = Number(event?.event_timestamp_ms ?? Date.now());
    const userRef = db.collection('users').doc(uid);
    const eventRef = db.collection('revenuecatEvents').doc(createHash('sha256').update(eventId).digest('hex'));
    await db.runTransaction(async (tx) => {
      if ((await tx.get(eventRef)).exists) return;
      const user = await tx.get(userRef);
      const previousTime = Number(user.data()?.lastEntitlementEvent?.eventTime ?? 0);
      tx.set(eventRef, { uid, type, eventTime, receivedAt: FieldValue.serverTimestamp() });
      if (eventTime < previousTime) return;
      tx.set(userRef, {
        tier: becomesPremium ? 'premium' : 'free',
        premiumUntil: event?.expiration_at_ms ?? null,
        lastEntitlementEvent: { type, eventTime, at: FieldValue.serverTimestamp() },
      }, { merge: true });
    });

    res.status(200).send('OK');
  }
);
