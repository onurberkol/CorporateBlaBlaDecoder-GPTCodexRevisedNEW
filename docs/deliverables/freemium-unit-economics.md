# Corporate BlaBla Decoder — Freemium birim ekonomisi

**Model:** OpenAI `gpt-5.6-luna` · Responses API · strict JSON output  
**Fiyat referansı:** 20 Ağustos 2026  
**Amaç:** mağaza komisyonundan ve makul altyapı payından sonra en az %90 brüt marjı hedeflemek.

## Varsayımlar

Bu model gerçek kullanım verisi değil, lansman öncesi korumacı planlama senaryosudur. İlk 30 günde gerçek `input_tokens`, `output_tokens`, p50/p95 gecikme ve kullanıcı başına aksiyon ölçülmeli; fiyat/limit sonrasında yeniden ayarlanmalıdır.

| Kalem | Decode | Composer |
| --- | ---: | ---: |
| Tahmini input token | 1.700 | 1.500 |
| Tahmini output token | 130 | 260 |
| Luna doğrudan token maliyeti | $0,000496 | $0,000612 |
| Korumacı maliyet katsayısı | 3× | 3× |
| Planlama maliyeti / istek | $0,00149 | $0,00184 |

Katsayı; reasoning tokenları, retry, uzun kullanıcı metni ve prompt büyümesi için ayrılmış emniyet payıdır. Karma kullanımın %60 Decode, %40 Composer olduğu varsayılmıştır: **planlama maliyeti = $0,00163 / AI aksiyonu**.

Sabit/yarı sabit kullanıcı maliyeti (Firebase, fonksiyon, Firestore, push, crash/analytics ve RevenueCat için tahsis): **$0,12 / aktif premium kullanıcı / ay**. Bu tutar API maliyeti değildir; muhafazakâr operasyon rezervidir.

## Kaç mesaj beklemeliyiz?

İş günlerinde kullanılan bir “micro-utility” için planlama dağılımı:

| Kullanıcı profili | AI aksiyonu/gün | Aylık aksiyon | Planlanan aylık AI maliyeti |
| --- | ---: | ---: | ---: |
| Seyrek | 1 | 30 | $0,05 |
| Normal aktif | 4 | 120 | $0,20 |
| Güçlü kullanıcı | 8 | 240 | $0,39 |
| Çok güçlü | 10 | 300 | $0,49 |

Normal aktif premium kullanıcının toplam planlama maliyeti: **$0,32/ay** (AI + $0,12 operasyon rezervi). Güçlü kullanıcıda: **$0,51/ay**.

## Önerilen paket

### Free — günlük 3 ortak AI aksiyonu

- Decode ve Composer arasında ortak toplam **3 aksiyon/gün**.
- Reklam yok; ürünün profesyonel/mahremiyet algısını korumak için banner/interstitial reklam önerilmez.
- Günlük Plaza, arşiv ve paylaşım açık kalır.
- Premium: sınırsız normal kullanım, bütün tonlar, savunma önerisi, persona ve haftalık karne.

Ortak limit, eski 3 Decode + 3 Composer (6 toplam) limitinden daha temizdir: kullanıcı ilk değeri rahatça alır, maliyet ve dönüşüm kontrol altında kalır. Kod tarafında bu uygulandı.

### Premium — önerilen liste fiyatı

| Pazar | Aylık liste fiyatı | %15 mağaza komisyonundan sonra yaklaşık net gelir |
| --- | ---: | ---: |
| ABD / küresel | **$6,99** | $5,94 |
| Türkiye | **₺299,99** | ₺254,99 |

TL tablosunda kur varsayımı **$1 = ₺45** kullanılmıştır; bu bir satış fiyatı kararı için yuvarlak senaryodur, anlık kur iddiası değildir. Bu varsayımla ₺299,99 yaklaşık $6,67 brüt / $5,67 net gelirdir.

| Senaryo | Net gelir | Toplam planlama maliyeti | Brüt marj |
| --- | ---: | ---: | ---: |
| $6,99, normal aktif (4/gün) | $5,94 | $0,32 | **%94,6** |
| $6,99, güçlü (8/gün) | $5,94 | $0,51 | **%91,4** |
| ₺299,99, güçlü (8/gün, ₺45/$) | $5,67 | $0,51 | **%91,0** |
| $6,99, çok güçlü (10/gün) | $5,94 | $0,61 | **%89,7** |

Bu nedenle mağaza metninde “sınırsız” denebilir, fakat şartlarda **normal ve makul kullanım** maddesi bulunmalıdır. Aynı kullanıcıda sürekli olağandışı otomasyon davranışını engelleyen sunucu tarafı abuse/rate-limit koruması zorunludur. Bu koruma ürün deneyiminde limit sayacı gibi görünmemeli; yalnızca kötüye kullanımda devreye girmelidir.

## Neden $4,99 / ₺199,99 değil?

Normal kullanımda maliyeti karşılar; ancak 8–10 aksiyon/gün kullanan premium kullanıcıda %90 hedefini güvenli biçimde korumaz. $4,99 fiyatı dönüşüm deneyi için promosyon/ilk yıl teklifi olabilir, ana liste fiyatı olmamalıdır.

## Yıllık paket

- Küresel: **$59,99/yıl**
- Türkiye: **₺2.499,99/yıl**

Bu, aylığa göre yaklaşık %28–29 indirim sunar. Yıllık kullanıcıların ortalama aksiyon/gün seviyesi ölçülmeden daha yüksek indirim yapılmamalıdır.

## Takip edilmesi gereken karar metrikleri

1. Aktif kullanıcı başına AI aksiyonu/gün (ortalama, p90, p99)
2. Aksiyon başına gerçek input/output/reasoning token maliyeti
3. Free → paywall → purchase dönüşümü
4. Premium kullanıcı başına aylık brüt marj
5. TR ve US için ayrı iptal, iade ve yıllık pakete geçiş oranı

İlk 30 gün sonunda p90 kullanım 8 aksiyon/günü geçmiyorsa fiyat korunur. Geçerse önce prompt tokenlarını ve model yönlendirmesini optimize edin; sonra sınırlı segmentte $7,99 / ₺349,99 fiyat testi yapın.
