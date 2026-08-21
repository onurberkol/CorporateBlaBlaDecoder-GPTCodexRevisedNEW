import type { ComposerExample } from '../types';

/**
 * EN Composer golden set. Transcreated into native US corporate idiom
 * (wheelhouse, remit, loop in, EOD). Same four-tone spectrum and length curve.
 */
export const COMPOSER_FEWSHOT_EN: ComposerExample[] = [
  {
    intent: "This isn't my job, it's yours, stop dumping it on me.",
    variants: {
      kind:
        "Hey! I really think you're the best person for this — it's right in your wheelhouse. Shout if you hit a wall 🙂",
      distant:
        'Hi — based on the current split, this sits under your scope. Can you confirm?',
      surgical:
        "Hey! Unless I'm misremembering the org chart, this should fall under your remit — happy to loop in [Manager] to clarify if that helps 🙂",
      boss: 'This is yours. Need it by EOD Friday.',
    },
  },
  {
    intent: 'You delivered late for the third time. I am done but must stay professional.',
    variants: {
      kind:
        'Got it, thank you! To make planning a little smoother, it would be great if we could land the next one on the original date 🙂',
      distant:
        'Received, thanks. For predictability, the remaining items are expected to close on their original dates.',
      surgical:
        "Thanks for sending this over 🙂 There's been a little slippage on the last three — just flagging it, purely in the spirit of optimistic planning.",
      boss: 'Third slip. Next deadline is fixed. Let’s be clear.',
    },
  },
  {
    intent: 'This meeting is pointless and I do not want to attend.',
    variants: {
      kind:
        'Could you share the agenda beforehand? If I spot where I can add value, I’ll come prepared 🙂',
      distant:
        'This looks like it could move over email. If the meeting is required I’ll join — could you send the agenda?',
      surgical:
        'Looking at the agenda, I think this could be a two-line email — but if you’d like a meeting, I’m in of course 🙂',
      boss: 'Let’s handle this over email and keep the calendar clear.',
    },
  },
];
