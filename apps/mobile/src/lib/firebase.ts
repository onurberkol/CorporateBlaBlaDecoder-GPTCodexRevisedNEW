import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const required = ['EXPO_PUBLIC_FIREBASE_API_KEY', 'EXPO_PUBLIC_FIREBASE_PROJECT_ID', 'EXPO_PUBLIC_FIREBASE_APP_ID'] as const;

/**
 * A production build must remain usable before the Firebase project is
 * provisioned. Initialising the Firebase SDK with an empty config can leave
 * Auth waiting forever, which in turn blocks the app's startup gate.
 */
export const isFirebaseConfigured = required.every((key) => Boolean(process.env[key]));

if (!isFirebaseConfigured && __DEV__) {
  console.warn('Firebase is not configured; the app is running in local mode.');
}

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = isFirebaseConfigured ? (getApps().length ? getApp() : initializeApp(config)) : null;

// Fast Refresh can initialize Auth more than once; use the existing instance in that case.
let appAuth: ReturnType<typeof getAuth> | null = null;
if (app) {
  try {
    // Firebase's React Native export is selected by Metro at runtime, while its
    // web declaration file omits this helper. Keep the platform detail local.
    const getReactNativePersistence = (require('firebase/auth') as { getReactNativePersistence?: (storage: typeof AsyncStorage) => unknown }).getReactNativePersistence;
    appAuth = getReactNativePersistence
      ? initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) as never })
      : getAuth(app);
  } catch {
    appAuth = getAuth(app);
  }
}

export const auth = appAuth;
export const db = app ? getFirestore(app) : null;
export const functions = app ? getFunctions(app, process.env.EXPO_PUBLIC_FUNCTIONS_REGION || 'europe-west1') : null;
