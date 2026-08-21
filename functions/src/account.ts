import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { ENFORCE_APP_CHECK, REGION } from './config';

/** Erases server-held account data before removing the anonymous Auth identity. */
export const deleteAccount = onCall(
  { region: REGION, memory: '128MiB', timeoutSeconds: 30, enforceAppCheck: ENFORCE_APP_CHECK },
  async (req) => {
    const uid = req.auth?.uid;
    if (!uid) throw new HttpsError('unauthenticated', 'Sign-in required.');
    const db = getFirestore();
    const events = await db.collection('revenuecatEvents').where('uid', '==', uid).limit(500).get();
    const batch = db.batch();
    batch.delete(db.collection('users').doc(uid));
    events.docs.forEach((event) => batch.delete(event.ref));
    await batch.commit();
    await getAuth().deleteUser(uid);
    return { deleted: true };
  }
);
