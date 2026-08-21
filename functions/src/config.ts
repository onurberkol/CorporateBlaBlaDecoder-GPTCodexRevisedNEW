import { defineSecret } from 'firebase-functions/params';

/** OpenAI key for the production-default provider. Never exposed to the app. */
export const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');

/** Shared secret that RevenueCat sends in the Authorization header. */
export const REVENUECAT_WEBHOOK_AUTH = defineSecret('REVENUECAT_WEBHOOK_AUTH');

/**
 * Model used for both Decoder and Composer. Override per environment after
 * benchmark and cost evaluation.
 */
export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-luna';
export const ANTHROPIC_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';
export const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';

/** Shared daily AI actions for free users. Premium is subject to fair-use controls. */
export const FREE_DAILY_ACTIONS = 3;

/** Max characters accepted from the client, to cap cost and abuse. */
export const MAX_INPUT = 2000;

/** Timezone used to compute the daily-reset boundary. */
export const RESET_TZ = process.env.RESET_TZ || 'Etc/UTC';

/** Deploy region. europe-west1 is close to Istanbul for low latency. */
export const REGION = process.env.FUNCTIONS_REGION || 'europe-west1';

/**
 * App Check must be explicitly enabled after the mobile client is configured
 * to send native App Check tokens. This avoids rejecting every valid request
 * during initial configuration, but it is a required pre-launch hardening step.
 */
export const ENFORCE_APP_CHECK = process.env.ENFORCE_APP_CHECK === 'true';
