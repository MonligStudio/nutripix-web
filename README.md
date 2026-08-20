# NutriPix Website

NutriPix'in Next.js ile hazırlanan tanıtım sitesi. Proje GitHub Pages için tam
statik çıktı üretir ve `main` dalına gönderilen her değişiklik GitHub Actions
üzerinden otomatik olarak yayınlanır.

## Tasarım sistemi

Sayfanın zemini kural olarak **tam siyah**; yeşil, "Bir öğün üç adım" ve
"Nasıl kullanılır" bölümlerinde devreye girip sonra siyaha döner, turuncu ise
yalnızca kapanış çağrısında görünür. Yani site üç renkte konuşur:
siyah → yeşil → turuncu. Açılış animasyonu da hero ile birebir aynı zemini
kullanır (ayrı ışık/ızgara katmanı yok).

Marka rengi ayrı bir sabittir: `--color-leaf` (logo, "PIX", header butonu ve
hero'nun tüm vurguları). Hero ile açılış ekranında `--color-accent` bu yeşile
ezilir, sayfanın geri kalanında vurgu hardal kalır.

Her bölüm (ya da bölüm içindeki durak) `data-color="ink | olive | orange"`
taşır; `SectionColor` bileşeni durak ekranın ortasına gelince kök değişkenleri
(`--bg`, `--fg`, `--accent`, `--accent-2`, `--ribbon`) o temaya tweenler. Header
ayrı bir renk mantığı kullanmaz, aynı değişkenlerden beslendiği için zeminle
eşzamanlı değişir. Yüzey, çizgi ve ikincil metin renkleri `globals.css` içinde
bu değişkenlerden `color-mix` ile türer. Palet ve temalar `src/lib/palette.ts`
dosyasında; indirme butonlarının siyah zemini ve turuncu hover'ı ise tema
değişse de sabittir.

`Spotlight` bölümü ("Ne işe yarar"), arkasında scroll ile çizilen kalın bir hat
(`--ribbon`) ve bu hattın üstüne dönüşümlü oturan kart/telefon satırlarından
oluşur; zemini bölüm boyunca siyah kalır.

Başlık fontu **SCHABO Condensed** (Tom Robin Karlsson, kişisel ve ticari
kullanımda ücretsiz). Fontun orijinalinde Türkçe `İ` ve `ı` glifleri yok;
`scripts/patch_schabo.py` bunları fontun kendi diyakritiğinden üretip ekliyor —
`src/fonts/SCHABO-Condensed.otf` bu yamalı sürümdür. `lang="tr"` altında büyük
harfe çevirme markaları da bozduğu için (iPhone → İPHONE) marka adları
`lang="en"` ile sarmalanır; veriden gelen başlıklarda bunu
`src/components/ui/brand.tsx` içindeki `withBrands` yapar.

Kenardan kenara uzanan başlıklar `data-fit` ile işaretlenir; punto, satır
kapsayıcısına tam oturacak şekilde çalışma anında hesaplanır
(`data-fit-max` üst sınır, `data-fit-bleed` yan boşluk telafisi — hero'daki
NUTRIPIX yazısı bunu kullanır). Parallax için `data-parallax="0.2"` (isteğe
bağlı `data-parallax-scope` kapsayıcısı) yeterli.

Pinli bir bölüm eklenirse ona `refreshPriority: 1`, layout'a bağlı diğer
tetikleyicilere `-1` verilmeli; yoksa ScrollTrigger konumları pin boşluğunu
saymadan hesaplar.

### Kırılım noktaları

Masaüstü (**≥1024px**) düzeni dokunulmaz kabul edilir; mobil/tablet düzeltmeleri
her zaman `max-width: 1023px` (ya da altındaki) sorgulara yazılır:

- **≤600px — telefon:** hero tek ekrana sığar (cihaz + yazı + butonlar),
  yüzen kartlar `scale(0.82)` ile küçülür, tur bölümünün metin kutusu 266px
  tabanlıdır (kısa telefonlarda taşmasın diye sahne 30svh'ye iner).
- **601–1023px — tablet:** hero ayrı bir blokla kurulur (cihaz `min(42vw,320px)`,
  üç kart açık, yazı blokları aşağıya yayılır); şerit ve platform telefonları
  büyür, footer iki sütuna geçer.
- **≥1024px — masaüstü:** mevcut düzen; hiçbir mobil kural buraya sızmaz.
- **Yatay telefon (`orientation: landscape` + `max-height`):** hero kısalır,
  tur bölümü masaüstü gibi yan yana kurulur — dikey yerleşim 390px yüksekliğe
  sığmıyor.
- **`hover: none`:** platform modelleri dokunmatikte tamamen sönmez; dokununca
  seçilir.

Açılış animasyonunu atlamak için: `http://localhost:3000/?boot=0`
(`?bootAt=0.33` ise animasyonu o karede dondurur).

## El + telefon sahnesi (Blender)

"Nasıl kullanılır" bölümündeki el, `blender/hand_rigged.blend` içindeki rigli
modelden üretiliyor. `blender/hand_rig.py` eli `src/lib/stage.ts` ile ortak olan
620×1000 sanal sahneye yerleştirir, telefonu holdout olarak keser (avuç arkada
silinir, kenardan sarkan parmak uçları ve camın üstündeki baş parmak kalır) ve
baş parmağı her adımın dokunma noktasına götürüp 40 kare render eder. Kareler
`blender/pack_thumb.py` ile tek bir sprite sheet'e paketlenir.

```bash
RAW_DIR=/tmp/nutripix_thumb /Applications/Blender.app/Contents/MacOS/Blender \
  -b blender/hand_rigged.blend --python blender/hand_rig.py -- 96 40
python3 blender/pack_thumb.py /tmp/nutripix_thumb 0.7
```

Yerleşimi denerken kodu düzenlemeye gerek yok: `HAND_SPIN`, `HAND_PITCH`,
`HAND_AX/AY/AZ`, `HAND_CURL`, `TH_LIFT` ortam değişkenleriyle geçilir ve
son argüman `debug` verilirse telefon yarı saydam bir dikdörtgen olarak
gösterilip tek kare basılır (`0 40 debug` hiç render etmeden ölçüleri yazar).

## Yerelde çalıştırma

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresini açın.

## Statik build

```bash
npm run build
```

Çıktı `out/` klasörüne yazılır. GitHub Pages alt yolunu geliştirme sunucusunda
doğrulamak için:

```bash
NEXT_PUBLIC_BASE_PATH=/nutripix-web npm run dev
```

Ardından `http://localhost:3000/nutripix-web/` adresini açın.

## GitHub Pages

Dağıtım akışı `.github/workflows/deploy-pages.yml` dosyasındadır. Depoda bir kez
`Settings → Pages → Build and deployment → Source: GitHub Actions` seçilmelidir.
Sonraki `main` push'ları otomatik yayınlanır.

Test adresi: [https://monligstudio.github.io/nutripix-web/](https://monligstudio.github.io/nutripix-web/)
