import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, type PurchasesOffering, type PurchasesPackage } from 'react-native-purchases';

const ENTITLEMENT = 'premium';
let configuredFor: string | null = null;

export async function configurePurchases(uid: string): Promise<void> {
  if (configuredFor === uid) return;
  const apiKey = Platform.OS === 'ios' ? process.env.EXPO_PUBLIC_RC_IOS : process.env.EXPO_PUBLIC_RC_ANDROID;
  if (!apiKey) return;
  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
  Purchases.configure({ apiKey, appUserID: uid });
  configuredFor = uid;
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return Boolean(customerInfo.entitlements.active[ENTITLEMENT]);
}

export async function restore(): Promise<boolean> {
  const customerInfo = await Purchases.restorePurchases();
  return Boolean(customerInfo.entitlements.active[ENTITLEMENT]);
}
