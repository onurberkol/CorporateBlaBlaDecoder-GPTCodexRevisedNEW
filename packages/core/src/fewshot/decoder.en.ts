import type { DecoderExample } from '../types';

/**
 * EN Decoder golden set. NOT a translation of the TR set — English corporate
 * passive-aggression has its own canon ("per my last email", "circle back",
 * "for visibility", "bandwidth"). Same scalpel voice, same meter calibration.
 */
export const DECODER_FEWSHOT_EN: DecoderExample[] = [
  {
    input: 'Per my last email, the deadline is Friday.',
    result: {
      translation:
        "You didn't read it. I'm saying it twice now, and I'm timestamping it.",
      meter: 82,
      traps: [
        { phrase: 'per my last email', meaning: 'you ignored me' },
        { phrase: 'the date again', meaning: "I'm building a case" },
      ],
    },
  },
  {
    input: 'Just circling back on this.',
    result: {
      translation:
        'You ghosted me. This is your third reminder disguised as a first.',
      meter: 68,
      traps: [
        { phrase: 'circling back', meaning: "you didn't reply" },
        { phrase: 'just', meaning: 'this is not casual' },
      ],
    },
  },
  {
    input: 'Adding [Manager] for visibility.',
    result: {
      translation: "You didn't do it. Now your boss knows. Godspeed.",
      meter: 96,
      traps: [
        { phrase: 'for visibility', meaning: "I'm reporting you" },
        { phrase: 'adding [Manager]', meaning: 'I called a witness' },
      ],
    },
  },
  {
    input: 'Gentle reminder 🙂',
    result: {
      translation:
        "It's been three days. The smiley isn't decoration — it's a glittering threat.",
      meter: 88,
      traps: [
        { phrase: '🙂', meaning: 'rage' },
        { phrase: 'gentle', meaning: 'not gentle' },
      ],
    },
  },
  {
    input: 'As discussed...',
    result: {
      translation:
        "This was never discussed. I'm rewriting history and you're going to let me.",
      meter: 75,
      traps: [
        { phrase: 'as discussed', meaning: 'as I am deciding now' },
        { phrase: '...', meaning: 'the trap is loading' },
      ],
    },
  },
  {
    input: 'Happy to discuss.',
    result: {
      translation: 'I am not happy. There is nothing to discuss. Do it.',
      meter: 55,
      traps: [
        { phrase: 'happy to', meaning: 'not happy' },
        { phrase: 'discuss', meaning: 'comply' },
      ],
    },
  },
  {
    input: 'Just following up!',
    result: {
      translation:
        "It's been an hour. Where is it. The exclamation mark is panic in a party hat.",
      meter: 50,
      traps: [
        { phrase: 'following up', meaning: 'where is it' },
        { phrase: '!', meaning: 'panic' },
      ],
    },
  },
  {
    input: 'Do you have the bandwidth for this?',
    result: {
      translation: "You're doing this. Bandwidth is not optional.",
      meter: 47,
      traps: [
        { phrase: 'bandwidth', meaning: 'you have it now' },
        { phrase: 'do you', meaning: 'you will' },
      ],
    },
  },
  {
    input: 'Thanks in advance!',
    result: {
      translation:
        'You have already agreed. Declining is now socially impossible.',
      meter: 58,
      traps: [
        { phrase: 'in advance', meaning: 'you cannot say no' },
        { phrase: 'thanks', meaning: 'obligation' },
      ],
    },
  },
];
