/**
 * NutriPix tanıtım sitesi — tüm metin ve veri içeriği.
 * Tek dosyada tutuluyor ki kopya güncellemesi bileşenlere dokunmadan yapılabilsin.
 */

export const site = {
  name: "NutriPix",
  tagline: "Yapay zekâ destekli beslenme asistanın",
  description:
    "Yemeğinin fotoğrafını çek, saniyeler içinde kalorisini ve makrolarını öğren. NutriPix; AI fotoğraf analizi, barkod tarama ve akıllı hedeflerle beslenmeni tek ekranda toplar.",
  url: "https://nutripix.app",
  version: "1.0.0",
  email: "zentia.app@gmail.com",
  stores: {
    ios: "#",
    android: "#",
  },
} as const;

/* Sayfa akışıyla aynı sıra: ne işe yarar → nasıl kullanılır → tur */
export const nav = [
  { label: "Ne İşe Yarar", href: "#ozellikler" },
  { label: "Nasıl Kullanılır", href: "#nasil" },
  { label: "Fiyatlar", href: "#fiyatlar" },
  { label: "SSS", href: "#sss" },
] as const;

export const heroStats = [
  { value: "~7 sn", label: "Bir öğünü kaydetme süresi" },
  { value: "4 yol", label: "Fotoğraf · Barkod · Yazı · Manuel" },
  { value: "2 platform", label: "iOS ve Android" },
] as const;

/* ────────────────────────────────────────────────────────────
   Kaydırmalı uygulama turu
   tap: telefon ekranının yüzdesi (0-1). Baş parmağın hedefi.
   enter: bir sonraki ekranın giriş animasyonu.
   ──────────────────────────────────────────────────────────── */
export type JourneyStep = {
  id: string;
  screen: string;
  index: string;
  chapter: string;
  title: string;
  body: string;
  points: string[];
  /** Bu adıma geçerken parmağın dokunduğu nokta (önceki ekranda). */
  tap: { x: number; y: number } | null;
  enter: "none" | "slide-left" | "slide-up" | "zoom" | "fade";
  accent: string;
};

export const journey: JourneyStep[] = [
  {
    id: "home",
    screen: "/screens/home.webp",
    index: "01",
    chapter: "Ana Sayfa",
    title: "Günün, tek bir ekranda",
    body: "Uygulamayı açtığın an kalan kalorini, makro dağılımını ve serini görürsün. Halka dolarken hedefe ne kadar kaldığını anlamak için hiçbir yere gitmen gerekmez.",
    points: ["Kalan kalori halkası", "Protein · Karbonhidrat · Yağ", "Haftalık gün şeridi"],
    tap: null,
    enter: "none",
    accent: "var(--color-accent)",
  },
  {
    id: "history",
    screen: "/screens/history.webp",
    index: "02",
    chapter: "Geçmiş",
    title: "Bir günü değil, gidişatı gör",
    body: "Alt menüden Geçmiş'e geç: son 7 günün kalori grafiği, haftalık ortalamaların ve aylık özetin seni bekliyor. Tek bir kötü gün değil, eğilim önemli.",
    points: ["Haftalık & aylık görünüm", "Kalori trend grafiği", "Ortalama makro raporu"],
    tap: { x: 0.313, y: 0.9 },
    enter: "slide-left",
    accent: "var(--color-blush)",
  },
  {
    id: "goals",
    screen: "/screens/goals.webp",
    index: "03",
    chapter: "Hedefler",
    title: "Hedefin senin vücuduna göre",
    body: "Boy, kilo, yaş ve aktivite seviyenden günlük kalori ve makro hedeflerin otomatik hesaplanır. Kilo ver, koru ya da kas yap — plan buna göre değişir.",
    points: ["Otomatik kalori & makro", "Kilo ver / koru / kas yap", "1 hafta – 3 ay projeksiyonu"],
    tap: { x: 0.687, y: 0.9 },
    enter: "slide-left",
    accent: "var(--color-orange)",
  },
  {
    id: "settings",
    screen: "/screens/settings.webp",
    index: "04",
    chapter: "Profil",
    title: "Her şey senin kontrolünde",
    body: "Dil, tema, bildirim saatleri ve abonelik tek yerde. Verini dilediğin an dışa aktar, hesabını dilediğin an sil. Karar hep sende.",
    points: ["Türkçe & English", "Açık / koyu tema", "Hatırlatma bildirimleri"],
    tap: { x: 0.874, y: 0.9 },
    enter: "slide-left",
    accent: "var(--color-blush)",
  },
  {
    id: "fab",
    screen: "/screens/fab.webp",
    index: "05",
    chapter: "Öğün Ekle",
    title: "Tek dokunuş, dört farklı yol",
    body: "Ortadaki butona bas; fotoğraf, barkod, yazı ve manuel giriş yelpaze gibi açılır. Hangi anda olursan ol, sana en hızlı geleni seç.",
    points: ["Fotoğrafla ekle", "Barkod tara", "Yazarak anlat", "Elle gir"],
    tap: { x: 0.5, y: 0.843 },
    enter: "zoom",
    accent: "var(--color-accent)",
  },
  {
    id: "ai",
    screen: "/screens/ai.webp",
    index: "06",
    chapter: "Yazarak Anlat",
    title: "Ne yediğini yaz, gerisini AI halletsin",
    body: "“2 yumurta, 1 dilim tam buğday ekmeği, beyaz peynir, 5 zeytin, çay” yaz — yapay zekâ porsiyonları çözer, kaloriyi ve makroları senin yerine doldurur.",
    points: ["Doğal dille giriş", "Sık yenenler için kısayol", "Kalan kalorine göre öneri"],
    tap: { x: 0.844, y: 0.768 },
    enter: "slide-up",
    accent: "var(--color-orange)",
  },
  {
    id: "manual",
    screen: "/screens/manual.webp",
    index: "07",
    chapter: "Manuel Giriş",
    title: "Rakamları biliyorsan, sen yaz",
    body: "Etiketi okuduysan ya da kendi tarifini biliyorsan manuel giriş hazır. Kalori, protein, karbonhidrat, yağ, lif, şeker ve sodyum — istediğin kadar detay.",
    points: ["7 besin alanı", "Öğün tipi seçimi", "Saniyeler içinde kayıt"],
    tap: { x: 0.528, y: 0.875 },
    enter: "slide-up",
    accent: "var(--color-camel)",
  },
  {
    id: "barcode",
    screen: "/screens/barcode.webp",
    index: "08",
    chapter: "Barkod",
    title: "Paketli ürünü okut, geç",
    body: "Marketten aldığın ürünün barkodunu kameraya tut. Open Food Facts veritabanından besin değerleri anında gelsin, porsiyonu ayarla ve kaydet.",
    points: ["Anlık barkod okuma", "Global ürün veritabanı", "Porsiyon çarpanı"],
    tap: { x: 0.359, y: 0.768 },
    enter: "zoom",
    accent: "var(--color-camel)",
  },
  {
    id: "photo",
    screen: "/screens/photo.webp",
    index: "09",
    chapter: "AI Fotoğraf",
    title: "Ve asıl mesele: sadece fotoğrafını çek",
    body: "Tabağını çek. Gemini görüntüyü tanır, DeepSeek içeriği detaylandırır: kalori, makrolar, porsiyon tahmini ve sağlık puanı. Tahmin etmeyi bırak.",
    points: ["Kamera veya galeri", "Porsiyon tahmini", "Sağlık puanı & detaylı analiz"],
    tap: { x: 0.156, y: 0.768 },
    enter: "zoom",
    accent: "var(--color-accent)",
  },
];

/* ──────────────────────────────── Fiyatlandırma ──────────────────────────────── */

export const plans = [
  {
    id: "free",
    name: "Ücretsiz Deneme",
    price: "₺0",
    period: "7 gün",
    note: "Kart bilgisi istenmez",
    highlight: false,
    cta: "Uygulamayı indir",
    features: [
      "Günde 2 AI fotoğraf analizi",
      "Sınırsız manuel & barkod girişi",
      "Günlük besin ve su takibi",
      "Kilo takibi ve grafikler",
      "Türkçe & İngilizce arayüz",
    ],
  },
  {
    id: "monthly",
    name: "Premium Aylık",
    price: "₺79,99",
    period: "/ay",
    note: "İstediğin an iptal et",
    highlight: true,
    cta: "Premium'a geç",
    features: [
      "Günde 10 AI fotoğraf analizi",
      "Detaylı AI besin raporu",
      "Reklamsız deneyim",
      "Sınırsız geçmiş erişimi",
      "Öncelikli destek",
    ],
  },
  {
    id: "yearly",
    name: "Premium Yıllık",
    price: "₺399,99",
    period: "/yıl",
    note: "Aylık ₺33,33 — %58 tasarruf",
    highlight: false,
    cta: "Yıllığa geç",
    features: [
      "Aylık planın tüm özellikleri",
      "En düşük aylık maliyet",
      "Yıl boyu fiyat sabit",
      "Tüm yeni özellikler dahil",
      "Tek hesap, iki platform",
    ],
  },
] as const;

/* ──────────────────────────────── SSS ──────────────────────────────── */

export const faq = [
  {
    q: "Fotoğraftan kalori hesabı gerçekten doğru mu?",
    a: "NutriPix, görüntüyü tanıyan bir modelle içeriği çözer ve ardından ikinci bir modelle porsiyonu detaylandırır. Sonuç bir tahmindir; gram bazlı bir tartı kadar kesin değildir ama günlük takibi anlamlı kılacak doğrulukta çalışır. Dilediğin an değerleri elle düzeltebilirsin.",
  },
  {
    q: "İnternet olmadan kullanabilir miyim?",
    a: "Manuel giriş, günlük takip ve geçmiş görüntüleme çevrimdışı çalışır. AI fotoğraf analizi, yazarak giriş ve barkod sorgusu için internet bağlantısı gerekir.",
  },
  {
    q: "Verilerim nerede tutuluyor?",
    a: "Hesabın ve öğün geçmişin şifreli bağlantı üzerinden senin hesabına bağlı olarak saklanır. Verini dilediğin an dışa aktarabilir, hesabını uygulama içinden kalıcı olarak silebilirsin.",
  },
  {
    q: "Ücretsiz sürümde neler var?",
    a: "7 günlük denemede günde 2 AI fotoğraf analizi, sınırsız manuel ve barkod girişi, günlük besin takibi, su ve kilo takibi ile tüm grafikler açıktır. Premium, AI analiz hakkını günde 10'a çıkarır ve reklamları kaldırır.",
  },
  {
    q: "Aboneliği nasıl iptal ederim?",
    a: "Abonelik App Store veya Google Play hesabın üzerinden yönetilir. Mağaza ayarlarındaki abonelikler bölümünden tek dokunuşla iptal edebilirsin; dönem sonuna kadar Premium açık kalır.",
  },
  {
    q: "Hem iPhone hem Android'de kullanabilir miyim?",
    a: "Evet. Aynı hesapla iki platformda da giriş yapabilirsin; öğün geçmişin, hedeflerin ve kilo kayıtların cihazlar arasında senkronize olur.",
  },
] as const;

export const footerLinks = {
  urun: [
    { label: "Nasıl Kullanılır", href: "#nasil" },
    { label: "Özellikler", href: "#ozellikler" },
    { label: "Fiyatlar", href: "#fiyatlar" },
    { label: "Sıkça Sorulanlar", href: "#sss" },
  ],
  yasal: [
    { label: "Gizlilik Politikası", href: "/gizlilik" },
    { label: "Kullanım Şartları", href: "/kullanim-sartlari" },
    { label: "Veri Silme Talebi", href: "/gizlilik#veri-silme" },
  ],
  iletisim: [
    { label: "zentia.app@gmail.com", href: "mailto:zentia.app@gmail.com" },
    { label: "Instagram", href: "#" },
    { label: "X / Twitter", href: "#" },
  ],
} as const;

/* ────────────────────────────────────────────────────────────
   "Ne işe yarar" — kalın çizgili özellik şeridi

   Bölümün arkasında scroll ile çizilen bir hat var; her "beat" bu hattın
   üstüne oturur. `layout` satırın biçimini belirler:
     solo  → ortada tek telefon
     left  → kart solda, telefon sağda
     right → telefon solda, kart sağda
     note  → geniş, telefonsuz kapanış kartı
   ──────────────────────────────────────────────────────────── */

export type SpotBeat = {
  id: string;
  layout: "solo" | "left" | "right" | "note";
  screen?: string;
  alt?: string;
  tag: string;
  title: string;
  body: string;
  stat?: string;
  statLabel?: string;
  chips?: string[];
};

export const spotlight: SpotBeat[] = [
  {
    id: "photo",
    layout: "solo",
    screen: "/screens/photo.webp",
    alt: "NutriPix fotoğraftan besin analizi ekranı",
    tag: "Fotoğraf",
    title: "Tabağını çek",
    body: "Görüntü modeli yemeği tanır, porsiyonu tahmin eder; kalori ve makrolar günlüğüne kendiliğinden düşer.",
    stat: "~7 sn",
    statLabel: "bir öğünü kaydetme süresi",
  },
  {
    id: "ai",
    layout: "left",
    screen: "/screens/ai.webp",
    alt: "NutriPix yazarak öğün ekleme ekranı",
    tag: "Yapay zekâ",
    title: "Ya da sadece anlat",
    body: "“2 yumurta, bir dilim tam buğday ekmeği, beyaz peynir, çay” yaz — model porsiyonları çözer, rakamları senin yerine doldurur. İçerik dökümü ve sağlık puanı da gelir.",
    stat: "6 bileşen",
    statLabel: "ortalama döküm",
  },
  {
    id: "barcode",
    layout: "right",
    screen: "/screens/barcode.webp",
    alt: "NutriPix barkod tarama ekranı",
    tag: "Barkod",
    title: "Paketliyse okut, geç",
    body: "Market ürününün barkodunu tara; besin değerleri Open Food Facts veritabanından anında gelsin. Etiket okumak, gram çevirmek yok.",
    stat: "Anında",
    statLabel: "global ürün veritabanı",
  },
  {
    id: "goals",
    layout: "left",
    screen: "/screens/goals.webp",
    alt: "NutriPix hedefler ekranı",
    tag: "Hedefler",
    title: "Hedef senin vücuduna göre",
    body: "Boy, kilo, yaş ve aktivite seviyenden günlük kalori ve makro hedeflerin hesaplanır. Kilo ver, koru ya da kas yap — plan buna göre değişir.",
    stat: "3 ay",
    statLabel: "ileriye dönük projeksiyon",
  },
  {
    id: "more",
    layout: "note",
    tag: "Ve dahası",
    title: "Günün geri kalanı da burada",
    body: "Takip tek bir öğünle bitmiyor: su, kilo, seri ve hatırlatmalar aynı ekranın içinde duruyor.",
    chips: [
      "Su takibi",
      "Kilo takibi",
      "Günlük seri",
      "Akıllı hatırlatma",
      "Türkçe & English",
      "Açık / koyu tema",
    ],
  },
];

/* ────────────────────────────────────────────────────────────
   Platformlar — iki model yan yana; birinin üzerine gelince
   aşağıdaki özellikler o platformunkiyle değişir.
   ──────────────────────────────────────────────────────────── */

export type PlatformKey = "ios" | "android";

export const platforms: Record<
  PlatformKey,
  {
    label: string;
    device: string;
    screen: string;
    alt: string;
    note: string;
    features: { t: string; d: string }[];
  }
> = {
  ios: {
    label: "iOS",
    device: "iPhone",
    screen: "/screens/history.webp",
    alt: "NutriPix iPhone geçmiş ekranı",
    note: "App Store",
    features: [
      { t: "Ana ekran widget'ı", d: "Su takibini uygulamayı açmadan, doğrudan iPhone ana ekranından yap." },
      { t: "Yerel bildirimler", d: "Öğün saatlerinde hatırlatma; saatleri sen belirle, dilediğinde kapat." },
      { t: "App Store aboneliği", d: "Premium, Apple hesabından yönetilir; iptal tek dokunuş." },
    ],
  },
  android: {
    label: "Android",
    device: "Android",
    screen: "/screens/goals.webp",
    alt: "NutriPix Android hedefler ekranı",
    note: "Google Play",
    features: [
      { t: "Ana ekran widget'ı", d: "Günlük halkayı ve su sayacını doğrudan ana ekrana koy." },
      { t: "Yerel bildirimler", d: "Aynı hatırlatmalar, Android bildirim ayarlarınla uyumlu çalışır." },
      { t: "Google Play aboneliği", d: "Premium, Play hesabından yönetilir; iptal tek dokunuş." },
    ],
  },
};
