# Corporate BlaBla Decoder — bağımsız teknik ve lansman denetimi

**İncelenen paket:** `corporate-blabla-decoder.zip`  
**İnceleme tarihi:** 20 Ağustos 2026  
**Sonuç:** Mevcut paket **mağazaya veya prodüksiyona hazır değil**. Ürün fikri, mimari niyeti ve görsel yönü güçlü; fakat teslim edilen kaynak paketinin önemli bölümleri eksik ve doğrulama altyapısı yok.

## Yönetici özeti

Uygulama, kurumsal dildeki pasif-agresif mesajları açıklayan ve farklı tonlarda yanıt yazan, TR/EN lokalizasyonlu bir mobil üründür. Paylaşılabilir kartlar, günlük “Plaza” içeriği, premium abonelik ve kişisel ton hafızası iyi tasarlanmış ürün kaldıraçlarıdır.

Ne var ki ZIP, çalıştırılabilir bir uygulama değildir. Mobil uygulamanın çalışma katmanı (`src/lib`) ve admin panelinin eşdeğer katmanı (`admin/lib`) yoktur. Bu nedenle Firebase oturumu, callable API, satın alma, yerel geçmiş, bildirimler, metinler, analitik ve yönetim paneli eylemleri derlenemez. 20 Ağustos 2026 tarihinde yapılan TypeScript doğrulaması mobilde bu eksiklerden kaynaklı çok sayıda hata, adminde de eksik `auth`, `actions` ve `data` modülü üretti.

Bu, fikir veya tasarımın kötü olduğu anlamına gelmiyor; ancak bu teslimi “eksik kaynaklı prototip iskeleti” olarak ele almak gerekir. Mağaza hesabı/kimlik bilgileri de kullanıcıya ait olduğu için doğrudan yayın yapmak ayrıca mümkün değildir.

## Güçlü taraflar

- **Net ürün döngüsü:** Decode → yanıt üretme → paylaşma → günlük içerik → premium dönüşüm akışı tutarlı.
- **Doğru güvenlik niyeti:** Claude anahtarının sunucuda tutulması; abonelik seviyesinin RevenueCat webhook’tan gelmesi; kotanın sunucuda sayılması; Firestore’un varsayılan reddetme kuralı iyi başlangıç noktaları.
- **Marka/tasarım yönü:** “paper / ink / red stamp” görsel dili ayırt edici, sosyal kartlara uygun ve koyu mod düşünülmüş.
- **Yayın malzemesi başlangıcı:** TR/EN mağaza metinleri, hukuki sayfalar, ASO notları, Firebase yapılandırması ve EAS profilleri mevcut.
- **Mimari ayrıştırma:** Promptlar ve ortak tipler `packages/core` altında ayrı tutuluyor; backend ve mobil uygulama arasında iyi bir sınır.

## Bloke eden bulgular (P0)

| Bulgu | Kanıt | Etki | Gerekli düzeltme |
| --- | --- | --- | --- |
| Mobil çalışma katmanı yok | Ekranlar `@/lib/firebase`, `user`, `api`, `history`, `purchases`, `notifications`, `analytics`, `crash`, `strings`, `locale`, `personas` içe aktarıyor; `apps/mobile/src/lib` yok. Bunun yerine boş `src/{lib,components}` klasörü var. | Uygulama derlenmez; ana işlevler mevcut değildir. | Kayıp dosyaları orijinal repodan geri getirin veya davranış/test spesifikasyonuyla yeniden kurun. |
| Admin çalışma katmanı yok | Admin sayfaları `@/lib/auth`, `actions`, `data` kullanıyor; `admin/lib` yok. | Admin paneli derlenmez ve içerik yönetilemez. | Sunucu doğrulamalı auth, Firebase Admin erişimi ve server action’lar yeniden kurulmalı. |
| Mobil derleme hataları | Manuel `tsc --noEmit -p apps/mobile/tsconfig.json`: eksik modüller, eksik `@expo/vector-icons`, `Theme` tip uyumsuzluğu, örtük `any` hataları. | iOS/Android build öncesi başarısız. | Kayıp katmanı ekleyin; bağımlılıkları doğrudan tanımlayın; tipleri düzeltin. |
| Yayın kimlikleri yer tutucu | `app.json` EAS project id ve `eas.json` Apple/Play submit alanları `REPLACE_*`. | EAS build/submit çalışmaz. | Gerçek EAS, Apple, Google Play ve servis hesabı bilgileriyle yapılandırın. |
| Gerçek cihaz / uçtan uca test yok | Test dosyası, test script’i, CI iş akışı veya çalıştırılmış cihaz sonucu bulunmuyor. | Satın alma, paylaşım, bildirim ve hata durumları yayın öncesi kanıtlanmamış. | Emulator + gerçek iOS/Android cihaz senaryoları, sandbox satın alma ve CI kapıları eklenmeli. |

## Yüksek öncelikli teknik ve güvenlik bulguları (P1)

- **App Check kapalı varsayılan:** `ENFORCE_APP_CHECK` ancak environment değeriyle açılıyor ve varsayılanı `false`. Yayına geçmeden etkinleştirilmezse anonim kullanıcı oluşturan callable uçlar kota tüketimi/maliyet suistimaline açık kalır.
- **Başarısız AI isteği de kotayı tüketiyor:** `consumeQuota` Claude isteğinden önce artırılıyor. Zaman aşımı, sağlayıcı hatası ya da geçersiz model cevabı kullanıcıya ücretsiz hakkını kaybettirir. Rezervasyon/idempotency veya başarı sonrası sayım tasarlanmalı.
- **RevenueCat webhook sağlamlaştırılmalı:** Basit shared Authorization header var; imza doğrulaması, olay kimliği ile tekrar (replay) önleme ve olay sıralaması kaydı yok. Webhook tekrarları ya da geç gelen olaylar premium durumunu yanlış yazabilir.
- **Girdi ve model güvenliği:** Karakter limiti var fakat kullanıcı metni doğrudan prompta giriyor. Prompt-injection dayanıklılığı, PII/iş sırrı uyarısı, moderasyon ve model çıktısı için daha katı şema doğrulaması eklenmeli.
- **Bildirim işi güvenilir değil:** En fazla 400 kullanıcı okunuyor; sayfalama, Expo receipt kontrolü, geçersiz token temizleme ve hata telemetrisi bulunmuyor. `fetch` hatası sessizce yutuluyor.
- **Gizlilik iddiası doğrulanmamış:** Metinlerin saklanmadığı belirtiliyor, fakat uygulama yerel geçmiş ve persona örnekleri tutmayı planlıyor. Eksik lib katmanı yüzünden şifreleme, retention ve silme davranışı kanıtlanamıyor. KVKK/GDPR metni hukukçu tarafından ürünün gerçek davranışıyla eşleştirilmeli.
- **Hesap silme akışı yalnızca istemcide:** Ekran kodu kullanıcı belgesini silmeyi ve Firebase anonim kullanıcısını silmeyi deniyor; ancak satın alma eşlemesi, push token, pending data, `requires-recent-login` ve başarısız kısmi silme senaryoları için sunucu tarafı silme/orchestration yok.
- **Bağımlılık riski:** `npm audit --omit=dev --audit-level=high`, mevcut lockfile’da 1 kritik, 65 yüksek ve ek orta seviye uyarı bildirdi. Bunların bir kısmı geliştirme zincirinde olsa da yayın öncesi Expo/Firebase/Next sürümleri ve lockfile güncellenerek yeniden değerlendirilmelidir.

## Ürün ve deneyim iyileştirmeleri (P1/P2)

- İlk sonucu daha hızlı göstermeye odaklanın: onboarding’i kısa tutun; ilk decode için örnek mesajla tek dokunuşlu deneme sunun.
- “Boss mode” ifadesi eğlenceli ama profesyonel kullanıcıda risk yaratabilir. Zararlı/alaycı çıktılar için ton koruması ve “göndermeden önce düzenle” alanı ekleyin.
- Sonuçların bağlam eksikliğini görünür kılın: "Bu bir yorumdur, kesin niyet tespiti değildir" etiketi ve geri bildirim düğmesi ekleyin.
- Paylaşım kartında hassas iş bilgisi için varsayılan gizleme/kırpma, açık onay ve kopyalanabilir düz metin seçeneği sunun.
- Erişilebilirlik denetimi gerekir: dinamik metin boyutu, VoiceOver/TalkBack etiketleri, kontrast, odak sırası, haptiklerin alternatifleri ve ekran okuyucu testleri.
- Analytics olayları tanımlanmış görünüyor ama eksik modül nedeniyle veri şeması/consent/opt-out uygulanabilir değil. Lansman hedefleri için `activation`, ilk değer süresi, share rate, paywall view→purchase ve 7-gün geri dönüş olaylarını netleştirin.

## Tasarım değerlendirmesi

Tasarım sistemi tutarlı: açık kağıt zemin, koyu mürekkep, kırmızı damga ve Fraunces/Inter eşleşmesi karakterli. Ancak uygulama kodunda responsive/accessibility kanıtı yok ve ekran görüntüleri gerçek build’den üretilmiş değil. Koyu temadaki `Theme` tipi şu an hatalı tanımlı: `Theme = typeof light`; `dark` dönüşü tip tarafından reddediliyor. Tasarımı koruyup tokenları iki temayı kapsayan ortak bir arayüz altında toplamak gerekir.

## Lansman hazırlık durumu

| Alan | Durum | Not |
| --- | --- | --- |
| Mobil derleme | Kırmızı | Eksik kaynaklar ve TypeScript hataları. |
| Backend typecheck | Yeşil | `functions` paketi typecheck geçti; entegrasyon testi yok. |
| Admin derleme | Kırmızı | Eksik `admin/lib` modülleri. |
| Firebase güvenliği | Sarı | Temel rules iyi; App Check ve abuse controls tamamlanmalı. |
| Abonelik | Sarı | Akış tasarlanmış; eksik client kodu, sandbox test ve webhook dayanıklılığı gerekli. |
| Hukuk/gizlilik | Sarı | Sayfalar mevcut; gerçek veri akışıyla hukuk incelemesi şart. |
| Store metadata | Sarı | Başlangıç malzemeleri mevcut; gerçek ekran görüntüsü, ürün/fiyat ve console formları eksik. |
| Operasyon/izleme | Kırmızı | Crash/analytics modülleri kayıp; alarmlar, dashboard, runbook ve CI yok. |

## Önerilen tamamlanma sırası

1. **Kayıp kaynakların kurtarılması:** Önce GitHub/Claude Code çalışma klasöründen eksik `apps/mobile/src/lib` ve `admin/lib` dosyalarını bulun. Bu, yeniden yazmaktan daha güvenli ve hızlıdır.
2. **Çalışır temel sürüm:** Kaynak bulunamazsa bu katmanları temiz, testli olarak yeniden yazın; Firebase Anonymous Auth, callable istemcisi, RevenueCat, local encrypted storage, user provider ve server-side admin auth ile başlayın.
3. **Build kalite kapısı:** Tüm workspaces için tek kök script; `typecheck`, lint, unit test, Firestore emulator kuralları, Functions integration test ve Expo config/doctors ekleyin. CI’da her pull request’te çalıştırın.
4. **Güvenlik/ödeme sertleştirmesi:** App Check üretimde zorunlu, webhook idempotency, hata sonrası kota telafisi, rate limiting, audit log ve veri silme endpoint’i.
5. **Gerçek cihaz QA:** iOS/Android release candidate, push izinleri, çevrimdışı/hata akışları, sandbox satın alma/restore, share sheet, TR/EN ve erişilebilirlik testi.
6. **Yayın/operasyon:** EAS ve console değerleri, uygulama imzalama, gerçek mağaza ekran görüntüleri, hukuk onayı, privacy/data-safety formları, Crashlytics/Sentry + ürün analitiği, destek/runbook ve kademeli internal→closed→production rollout.

## Bu paketi lansmana ben hazırlayabilir miyim?

**Evet.** Teknik olarak eksik katmanları yeniden kurabilir, derleme/test/CI hattını ekleyebilir, backend’i sertleştirebilir, görsel ve metin kalitesini iyileştirebilir ve EAS release-candidate üretimine kadar götürebilirim. Fakat Apple Developer, Google Play Console, Firebase/RevenueCat/Anthropic hesapları, domain/DNS ve hukukî onay kullanıcı/şirket yetkisi gerektirir; bu hesaplarda sizin adınıza yayın yapamam.

Başlamadan önce en değerli sonraki adım, eksik dosyaların bulunduğu asıl GitHub deposu veya Claude Code çalışma klasörünü bulmaktır. Bulunamazsa uygulamayı bu tasarım ve ekran sözleşmelerine dayanarak yeniden tamamlamak mümkündür; bunu yeni, doğrulanabilir bir kaynak sürüm olarak ele almak gerekir.
