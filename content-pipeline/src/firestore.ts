import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { initializeApp, applicationDefault, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { PlazaCardDoc } from '@corporate-blabla/core';

function initAdmin() {
  if (getApps().length) return;
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyPath) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    initializeApp({ credential: cert(require(path.resolve(keyPath))) });
  } else {
    initializeApp({ credential: applicationDefault() });
  }
}

/** Write each card to dailyPlaza/{date}. */
export async function writeToFirestore(docs: PlazaCardDoc[]): Promise<void> {
  initAdmin();
  const db = getFirestore();
  const batch = db.batch();
  for (const d of docs) {
    batch.set(db.collection('dailyPlaza').doc(d.date), d, { merge: true });
  }
  await batch.commit();
}

/** Dry run: write the batch to a local JSON file for review. */
export function writeToJson(docs: PlazaCardDoc[], file: string): void {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(docs, null, 2), 'utf8');
}
