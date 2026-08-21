import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore } from 'firebase-admin/firestore';
import { REGION } from './config';

const COPY: Record<'tr' | 'en', { title: string; body: string }> = {
  tr: { title: 'Plaza seni özledi', body: 'Bugünün tuzağı seni bekliyor. Zincirini kırma.' },
  en: { title: 'The Plaza misses you', body: "Today's trap is waiting. Don't break your chain." },
};

/**
 * Daily-local commute reminders are scheduled on-device (notifications.ts).
 * This server job re-engages users who have drifted: no open in 3+ days, a
 * stored push token, and notifications enabled. Runs once daily at 17:30 UTC.
 */
export const reengageLapsed = onSchedule(
  { region: REGION, schedule: '30 17 * * *', timeZone: 'Etc/UTC', memory: '256MiB' },
  async () => {
    const db = getFirestore();
    const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const snap = await db
      .collection('users')
      .where('lastSeen', '<', cutoff)
      .limit(400)
      .get();

    const messages: Array<{ to: string; title: string; body: string; sound: string }> = [];
    for (const doc of snap.docs) {
      const u = doc.data();
      const token: string | undefined = u.pushToken;
      const enabled = u.prefs?.notifications !== false;
      if (!token || !enabled) continue;
      const loc = u.displayLocale === 'en' ? 'en' : 'tr';
      messages.push({ to: token, sound: 'default', ...COPY[loc] });
    }
    if (messages.length === 0) return;

    // Expo Push accepts up to 100 messages per request.
    for (let i = 0; i < messages.length; i += 100) {
      const chunk = messages.slice(i, i + 100);
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chunk),
      }).catch(() => undefined);
    }
  }
);
