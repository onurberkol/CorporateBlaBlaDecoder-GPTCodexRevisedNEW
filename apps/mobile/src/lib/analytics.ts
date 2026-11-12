type Properties = Record<string, string | number | boolean | undefined>;

export const Events = {
  appOpen: 'app_open', decode: 'decode_completed', compose: 'compose_completed', share: 'result_shared',
  plazaOpen: 'plaza_opened', paywallView: 'paywall_viewed', purchase: 'purchase_completed',
} as const;

/** Privacy-first seam for a future analytics vendor. Never send input, output, or persona text. */
export function track(event: string, properties: Properties = {}): void {
  if (__DEV__) console.debug(`[analytics] ${event}`, properties);
}
