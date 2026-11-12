import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import type { Locale } from '@corporate-blabla/core';
import { auth, db, isFirebaseConfigured } from './firebase';
import { deviceLocale } from './locale';
import { configurePurchases } from './purchases';
import { scheduleCommuteReminders } from './notifications';

export interface Preferences { notifications?: boolean; commuteMorning?: string; commuteEvening?: string }
export interface Streak { count: number; lastDay?: string }
type Tier = 'free' | 'premium';

interface UserState {
  loaded: boolean;
  uid: string | null;
  locale: Locale;
  tier: Tier;
  prefs: Preferences;
  streak: Streak;
  onboardingDone: boolean;
  updatePrefs: (prefs: Partial<Preferences>) => Promise<void>;
  completeOnboarding: (prefs: Preferences) => Promise<void>;
  markDailyEngaged: () => Promise<void>;
}

const UserContext = createContext<UserState | null>(null);
const initialLocale = deviceLocale();

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Omit<UserState, 'updatePrefs' | 'completeOnboarding' | 'markDailyEngaged'>>({ loaded: false, uid: null, locale: initialLocale, tier: 'free', prefs: {}, streak: { count: 0 }, onboardingDone: false });

  useEffect(() => {
    const firebaseAuth = auth;
    const firestore = db;
    if (!isFirebaseConfigured || !firebaseAuth || !firestore) {
      // The shell and its local features must work before a backend exists.
      setState((current) => ({ ...current, loaded: true }));
      return;
    }

    let unsubscribeDocument: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        try { await signInAnonymously(firebaseAuth); } catch { setState((current) => ({ ...current, loaded: true })); }
        return;
      }
      await configurePurchases(user.uid).catch(() => undefined);
      const userRef = doc(firestore, 'users', user.uid);
      unsubscribeDocument = onSnapshot(userRef, (snapshot) => {
        if (!snapshot.exists()) {
          void setDoc(userRef, { prefs: {}, displayLocale: initialLocale, onboardingDone: false, streak: { count: 0 }, updatedAt: serverTimestamp() }, { merge: true });
          setState({ loaded: true, uid: user.uid, locale: initialLocale, tier: 'free', prefs: {}, streak: { count: 0 }, onboardingDone: false });
          return;
        }
        const data = snapshot.data();
        setState({
          loaded: true,
          uid: user.uid,
          locale: data.displayLocale === 'en' ? 'en' : 'tr',
          tier: data.tier === 'premium' ? 'premium' : 'free',
          prefs: typeof data.prefs === 'object' && data.prefs ? data.prefs as Preferences : {},
          streak: typeof data.streak === 'object' && data.streak ? data.streak as Streak : { count: 0 },
          onboardingDone: data.onboardingDone === true,
        });
      }, () => setState((current) => ({ ...current, loaded: true, uid: user.uid })));
    });
    return () => { unsubscribeAuth(); unsubscribeDocument?.(); };
  }, []);

  const value = useMemo<UserState>(() => ({
    ...state,
    async updatePrefs(patch) {
      const next = { ...state.prefs, ...patch };
      setState((current) => ({ ...current, prefs: next }));
      if (!state.uid || !db) {
        await scheduleCommuteReminders(next.commuteMorning, next.commuteEvening, next.notifications !== false).catch(() => undefined);
        return;
      }
      await setDoc(doc(db, 'users', state.uid), { prefs: next, updatedAt: serverTimestamp() }, { merge: true });
      await scheduleCommuteReminders(next.commuteMorning, next.commuteEvening, next.notifications !== false).catch(() => undefined);
    },
    async completeOnboarding(prefs) {
      setState((current) => ({ ...current, prefs, onboardingDone: true }));
      if (!state.uid || !db) {
        await scheduleCommuteReminders(prefs.commuteMorning, prefs.commuteEvening, prefs.notifications !== false).catch(() => undefined);
        return;
      }
      await setDoc(doc(db, 'users', state.uid), { prefs, onboardingDone: true, displayLocale: state.locale, updatedAt: serverTimestamp() }, { merge: true });
      await scheduleCommuteReminders(prefs.commuteMorning, prefs.commuteEvening, prefs.notifications !== false).catch(() => undefined);
    },
    async markDailyEngaged() {
      const day = new Intl.DateTimeFormat('en-CA').format(new Date());
      const current = state.streak;
      if (current.lastDay === day) return;
      const yesterday = new Intl.DateTimeFormat('en-CA').format(new Date(Date.now() - 86_400_000));
      const streak: Streak = { count: current.lastDay === yesterday ? Math.min(current.count + 1, 365) : 1, lastDay: day };
      setState((value) => ({ ...value, streak }));
      if (!state.uid || !db) return;
      await setDoc(doc(db, 'users', state.uid), { streak, updatedAt: serverTimestamp() }, { merge: true });
    },
  }), [state]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserState {
  const value = useContext(UserContext);
  if (!value) throw new Error('useUser must be rendered inside UserProvider');
  return value;
}
