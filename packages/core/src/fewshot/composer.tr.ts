import type { ComposerExample } from '../types';

/**
 * TR Composer golden set. Each example shows the SAME raw intent rendered
 * across all four tones, so the model learns the spectrum (and the tonal
 * length curve: kind = longest, boss = shortest). These anchor the dial.
 */
export const COMPOSER_FEWSHOT_TR: ComposerExample[] = [
  {
    intent: 'Bu iş benim değil, senin işin, üstüme yıkma.',
    variants: {
      kind:
        'Selam! Bu konuda en doğru kişinin sen olduğunu düşünüyorum, tam senin uzmanlığına giriyor. Bir yerde takılırsan buradayım 🙂',
      distant:
        'Merhaba, bu kalem mevcut dağılımda senin sorumluluğunda görünüyor. Teyit eder misin?',
      surgical:
        "Selam, organizasyonu yanlış hatırlamıyorsam bu senin kapsamında olmalı. Tabii yanılıyorsam [Yönetici]'yi loop'a alıp hızlıca netleştirebiliriz 🙂",
      boss: "Bu senin işin. Cuma EOD'a bekliyorum.",
    },
  },
  {
    intent: 'Üçüncü kez geç teslim ettin, bıktım, ama profesyonel kalmam lazım.',
    variants: {
      kind:
        'Teslimi aldım, eline sağlık! Planlamayı rahatlatmak adına bir sonrakinde tarihte buluşabilirsek süper olur 🙂',
      distant:
        'Teslim ulaştı, teşekkürler. Öngörülebilirlik açısından bundan sonraki kalemleri orijinal tarihlerde kapatmamız bekleniyor.',
      surgical:
        'Teslim için teşekkürler 🙂 Son üç teslimde küçük kaymalar oldu, not düşeyim dedim — tabii tamamen iyimser bir planlama refleksiyle.',
      boss: 'Üçüncü gecikme. Bir dahakine tarih sabit. Netleşelim.',
    },
  },
  {
    intent: 'Bu toplantı gereksiz, gelmek istemiyorum.',
    variants: {
      kind:
        'Gündemi önden paylaşır mısın? Katkı sağlayabileceğim kısımları görürsem hazırlıklı gelirim 🙂',
      distant:
        'Bu konu mail üzerinden de ilerleyebilir gibi duruyor. Toplantı şartsa tabii katılırım, gündemi alabilir miyim?',
      surgical:
        'Gündeme bakınca bunun iki satırlık bir maille çözülebileceğini düşündüm, ama sen toplantı diyorsan ben varım tabii ki 🙂',
      boss: 'Bunu maille halledelim, takvimi şişirmeyelim.',
    },
  },
];
