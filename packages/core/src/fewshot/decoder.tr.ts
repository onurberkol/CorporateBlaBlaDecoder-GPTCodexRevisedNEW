import type { DecoderExample } from '../types';

/**
 * TR Decoder golden set. These are hand-curated — they ARE the voice.
 * Keep translations short and scalpel-like; humor comes from being too
 * accurate, never from exaggeration. Meter follows the calibration in
 * tones.ts (innocent / sneaky / evidence / nuclear).
 */
export const DECODER_FEWSHOT_TR: DecoderExample[] = [
  {
    input: 'Müsait olduğunda bir bakabilir misin? Acelesi yok.',
    result: {
      translation: 'Şu an bak. "Acelesi yok" cümlenin en agresif kısmı.',
      meter: 64,
      traps: [
        { phrase: 'acelesi yok', meaning: 'acelesi var' },
        { phrase: 'müsait olduğunda', meaning: 'şimdi' },
      ],
    },
  },
  {
    input: 'Önceki mailimde de belirttiğim üzere, teslim cuma.',
    result: {
      translation:
        'Maili okumadın. Bunu ikinci kez yazıyorum ve bu beni yordu. Ayrıca kanıt bırakıyorum.',
      meter: 81,
      traps: [
        { phrase: 'belirttiğim üzere', meaning: 'sen okumadın' },
        { phrase: 'önceki mailimde', meaning: 'arşive geçiyorum' },
      ],
    },
  },
  {
    input: 'Görünürlük açısından [Yönetici]\u0027yi de loop\u0027a alıyorum.',
    result: {
      translation: 'Bu işi yapmadın. Artık patronun da biliyor. İyi şanslar.',
      meter: 96,
      traps: [
        { phrase: 'görünürlük açısından', meaning: 'seni şikayet ediyorum' },
        { phrase: "loop'a alıyorum", meaning: 'tanık çağırdım' },
      ],
    },
  },
  {
    input: 'Nazik bir hatırlatma 🙂',
    result: {
      translation:
        'Üç gündür bekliyorum. Sabrım bitti. Gülen yüz süs değil, ışıltılı bir tehdit.',
      meter: 88,
      traps: [
        { phrase: '🙂', meaning: 'öfke' },
        { phrase: 'nazik', meaning: 'nazik değil' },
      ],
    },
  },
  {
    input: 'Bilginize.',
    result: {
      translation:
        'Bu maili sakla. İleride "sana söylemiştim" diyeceğim an için kanıtın.',
      meter: 73,
      traps: [
        { phrase: 'bilginize', meaning: 'kanıt bırakıyorum' },
        { phrase: 'tek kelime', meaning: 'mesafe koyuyorum' },
      ],
    },
  },
  {
    input: 'Yanlış anlaşılmasın ama bu tam benim alanım değil sanırım?',
    result: {
      translation: 'Bu senin işin. Soru işareti kibarlık, cümle ret.',
      meter: 70,
      traps: [
        { phrase: 'yanlış anlaşılmasın', meaning: 'birazdan kırıcı olacağım' },
        { phrase: 'sanırım?', meaning: 'eminim' },
      ],
    },
  },
  {
    input: "Hızlıca bir sync'leyelim mi?",
    result: {
      translation:
        'İki satırlık maille çözülecek şeyi yarım saatlik toplantıya çevireceğim.',
      meter: 45,
      traps: [
        { phrase: 'hızlıca', meaning: 'hızlı değil' },
        { phrase: 'sync', meaning: 'takvimine girdim bile' },
      ],
    },
  },
  {
    input: 'Bu konuyu artık bir kapatabilir miyiz?',
    result: {
      translation: 'Bıktım. Haklı olabilirsin ama umurumda değil. Sus ve onayla.',
      meter: 78,
      traps: [
        { phrase: 'kapatalım', meaning: 'pes et' },
        { phrase: 'artık', meaning: 'sabrım sıfırlandı' },
      ],
    },
  },
  {
    input: 'Teşekkürler, anladım. 👍',
    result: {
      translation:
        'Anlamadım, ikna olmadım, ama bu konuşmayı bitiriyorum. Sana darıldım.',
      meter: 59,
      traps: [
        { phrase: 'kuru 👍', meaning: 'soğuk savaş' },
        { phrase: 'anladım', meaning: 'konu kapandı, sen kaybettin' },
      ],
    },
  },
  {
    input: 'Quick question:',
    result: {
      translation: 'Quick değil. 20 dakikanı yiyecek ve cevabı sevmeyeceksin.',
      meter: 52,
      traps: [
        { phrase: 'quick', meaning: 'tuzak' },
        { phrase: 'iki nokta', meaning: 'arkasından paragraf geliyor' },
      ],
    },
  },
];
