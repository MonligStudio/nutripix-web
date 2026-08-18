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
    accent: "var(--color-mint)",
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
    accent: "var(--color-sky)",
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
    accent: "var(--color-coral)",
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
    accent: "var(--color-lav)",
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
    accent: "var(--color-mint)",
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
    accent: "var(--color-teal)",
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
    accent: "var(--color-amber)",
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
    accent: "var(--color-sky)",
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
    accent: "var(--color-mint)",
  },
];

/* ──────────────────────────────── Özellikler ──────────────────────────────── */

export type Feature = {
  icon: string;
  title: string;
  body: string;
  color: string;
  span?: string;
};

export const features: Feature[] = [
  {
    icon: "camera",
    title: "AI Fotoğraf Analizi",
    body: "Tabağının fotoğrafını çek; görüntü modeli yemeği tanısın, kaloriyi ve makroları saniyeler içinde hesaplasın. Tartıya, listeye, tahmine gerek yok.",
    color: "var(--color-mint)",
    span: "lg:col-span-2 lg:row-span-2",
  },
  {
    icon: "sparkles",
    title: "Detaylı AI Raporu",
    body: "İçerik dökümü, porsiyon tahmini ve sağlık puanıyla her öğünün arkasındaki hikâyeyi gör.",
    color: "var(--color-lav)",
  },
  {
    icon: "barcode",
    title: "Barkod Tarama",
    body: "Paketli ürünü okut, besin değerleri global veritabanından anında gelsin.",
    color: "var(--color-sky)",
  },
  {
    icon: "chart",
    title: "Günlük Besin Takibi",
    body: "Kalori, protein, karbonhidrat, yağ, lif ve şeker — hepsi tek ekranda, tek bakışta.",
    color: "var(--color-coral)",
    span: "lg:col-span-2",
  },
  {
    icon: "drop",
    title: "Su Takibi",
    body: "Günlük su tüketimini tek dokunuşla ekle, ana ekran widget'ından takip et.",
    color: "var(--color-sky)",
  },
  {
    icon: "scale",
    title: "Kilo Takibi",
    body: "Kilonu kaydet, grafiğini izle, hedefe kalan mesafeyi haftalık projeksiyonla gör.",
    color: "var(--color-teal)",
  },
  {
    icon: "flame",
    title: "Günlük Seri",
    body: "Her gün takip yaptıkça serin büyür. Motivasyonu alışkanlığa çeviren en basit mekanizma.",
    color: "var(--color-gold)",
  },
  {
    icon: "bell",
    title: "Akıllı Hatırlatma",
    body: "Öğün saatlerinde nazik bir dokunuş. Saatleri sen belirle, uygulama seni takip etsin.",
    color: "var(--color-amber)",
  },
  {
    icon: "globe",
    title: "Türkçe & English",
    body: "Uygulamanın tamamı iki dilde. Tema tercihini de açık/koyu olarak sen seç.",
    color: "var(--color-pink)",
  },
];

/* ──────────────────────────────── Nasıl çalışır ──────────────────────────────── */

export const steps = [
  {
    n: "01",
    title: "Profilini oluştur",
    body: "Boy, kilo, yaş, aktivite seviyesi ve hedefini gir. NutriPix günlük kalori ve makro hedeflerini senin için hesaplasın.",
  },
  {
    n: "02",
    title: "Öğününü kaydet",
    body: "Fotoğrafını çek, barkodunu okut, yazarak anlat ya da elle gir. Dört yoldan hangisi hızlıysa onu kullan.",
  },
  {
    n: "03",
    title: "Gidişatını izle",
    body: "Günlük halka, haftalık grafikler ve kilo trendiyle ilerlemeni gör. Serini büyüt, alışkanlığı kalıcı yap.",
  },
] as const;

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
   "Ne işe yarar" — 3B blok sahnesi

   Eski bento grid'in birebir 3B karşılığı: her hücre bir bloğa dönüştü ve
   hücrenin oranını korudu. 2×2 hücre küp, 2×1 hücre dikdörtgen prizma oldu.
   Bloklar çok uzaktan (z: -30000) uçarak gelip grid düzenine oturuyor.
   Yüzlerde görsel yok — her yüz o özelliği anlatan bir yazı taşıyor.

   Hedef konumlar artık yüzde değil, GRID SLOTU: geniş ekranda 5×3, dar
   ekranda 3×5. Hücre boyutu, boşluklar ve kenar payı çalışma anında
   viewport'tan hesaplanır (FeatureCubes/layout), böylece bloklar her
   ekranda ortada toplanır, birbirine değmez ve kenarlara taşmaz.
   ──────────────────────────────────────────────────────────── */

/** Blok gridinin iki varyantı — hangisinin daha büyük hücre verdiğine
    çalışma anında karar verilir (dar/uzun ekranda 3×5, geniş ekranda 5×3). */
export const featureGrids = {
  wide: { cols: 5, rows: 3 },
  narrow: { cols: 3, rows: 5 },
} as const;

export type FeatureBlock = {
  title: string;
  body: string;
  tag: string;
  /** ön yüzdeki mini mockup türü */
  visual: "ring" | "list" | "barcode" | "macros" | "water" | "chart" | "streak" | "bell" | "lang";
  /** öne çıkan rakam/ifade */
  stat: string;
  statLabel: string;
  color: string;
  /** hücre birimi: 1 = kare hücre */
  w: number;
  h: number;
  /** 5×3 gridde sol üst hücresi (c: sütun, r: satır) */
  at: { c: number; r: number };
  /** 3×5 (dar) gridde sol üst hücresi */
  atSm: { c: number; r: number };
  spin?: number;
  from: { top: number; left: number; rx: number; ry: number; rz: number };
  to: { rx: number; ry: number; rz: number };
};

export const featureBlocks: FeatureBlock[] = [
  {
    title: "AI Fotoğraf Analizi",
    body: "Tabağını çek; model yemeği tanır, kaloriyi ve makroları çıkarır. Porsiyon tahmini ve sağlık puanı da gelir.",
    tag: "Tartıya gerek yok",
    visual: "ring",
    stat: "~7 sn",
    statLabel: "fotoğraftan kayda",
    color: "var(--color-mint)",
    w: 2, h: 2,
    at: { c: 0, r: 0 }, atSm: { c: 0, r: 0 },
    from: { top: -60, left: 34, rx: 360, ry: -360, rz: -48 },
    to: { rx: -2, ry: 4, rz: 0 },
  },
  {
    title: "Detaylı AI Raporu",
    body: "Her bileşen ayrı satırda: miktar, kalori, makro payı.",
    tag: "Öğünün hikâyesi",
    visual: "list",
    stat: "6 bileşen",
    statLabel: "ortalama döküm",
    color: "var(--color-lav)",
    w: 1, h: 1, spin: 180,
    at: { c: 2, r: 0 }, atSm: { c: 2, r: 0 },
    from: { top: -38, left: 30, rx: -360, ry: 360, rz: 90 },
    to: { rx: 2, ry: -3, rz: 0 },
  },
  {
    title: "Barkod Tarama",
    body: "Paketli ürünü okut, değerler anında gelsin.",
    tag: "Anında sonuç",
    visual: "barcode",
    stat: "3M+",
    statLabel: "ürün veritabanı",
    color: "var(--color-sky)",
    w: 1, h: 1,
    at: { c: 3, r: 0 }, atSm: { c: 2, r: 1 },
    from: { top: -66, left: 52, rx: -360, ry: -360, rz: -180 },
    to: { rx: -3, ry: 3, rz: 0 },
  },
  {
    title: "Günlük Besin Takibi",
    body: "Kalori, protein, karbonhidrat, yağ, lif, şeker ve sodyum tek bakışta.",
    tag: "Tek ekranda",
    visual: "macros",
    stat: "7 değer",
    statLabel: "her öğünde",
    color: "var(--color-coral)",
    w: 2, h: 1,
    at: { c: 2, r: 1 }, atSm: { c: 0, r: 2 },
    from: { top: -34, left: 50, rx: -360, ry: -360, rz: -180 },
    to: { rx: 2, ry: -2, rz: 0 },
  },
  {
    title: "Su Takibi",
    body: "Bardak bardak ekle, widget'tan izle.",
    tag: "Günlük hedef",
    visual: "water",
    stat: "2.4 L",
    statLabel: "önerilen günlük",
    color: "var(--color-sky)",
    w: 1, h: 1,
    at: { c: 4, r: 0 }, atSm: { c: 2, r: 2 },
    from: { top: -52, left: 62, rx: 360, ry: 360, rz: -135 },
    to: { rx: -2, ry: 2, rz: 0 },
  },
  {
    title: "Kilo Takibi",
    body: "Eğrini izle, hedefe kalan mesafeyi gör.",
    tag: "Haftalık projeksiyon",
    visual: "chart",
    stat: "3 ay",
    statLabel: "ileri projeksiyon",
    color: "var(--color-teal)",
    w: 1, h: 1, spin: -180,
    at: { c: 4, r: 1 }, atSm: { c: 0, r: 3 },
    from: { top: -36, left: 68, rx: -180, ry: -360, rz: -180 },
    to: { rx: 3, ry: -2, rz: 0 },
  },
  {
    title: "Günlük Seri",
    body: "Kaydettiğin her gün seriyi büyütür.",
    tag: "Alışkanlık",
    visual: "streak",
    stat: "12 gün",
    statLabel: "en uzun seri",
    color: "var(--color-gold)",
    w: 1, h: 1,
    at: { c: 1, r: 2 }, atSm: { c: 1, r: 3 },
    from: { top: -44, left: 44, rx: 360, ry: -180, rz: 60 },
    to: { rx: -2, ry: 3, rz: 0 },
  },
  {
    title: "Akıllı Hatırlatma",
    body: "Sabah, öğle, akşam için ayrı saatler.",
    tag: "Unutturmaz",
    visual: "bell",
    stat: "3 öğün",
    statLabel: "ayrı saat",
    color: "var(--color-amber)",
    w: 1, h: 1,
    at: { c: 2, r: 2 }, atSm: { c: 2, r: 3 },
    from: { top: -58, left: 58, rx: -360, ry: 180, rz: -90 },
    to: { rx: 2, ry: -3, rz: 0 },
  },
  {
    title: "Türkçe & English",
    body: "Arayüz ve AI çıktıları iki dilde.",
    tag: "İki dil",
    visual: "lang",
    stat: "TR / EN",
    statLabel: "anında geçiş",
    color: "var(--color-pink)",
    w: 1, h: 1,
    at: { c: 3, r: 2 }, atSm: { c: 1, r: 4 },
    from: { top: -30, left: 36, rx: 180, ry: 360, rz: 135 },
    to: { rx: -3, ry: 2, rz: 0 },
  },
];

/** Blokların arasında süzülen 3B yiyecekler (blender/props.py üretir).
    Hedef konumlar da hücre birimiyle veriliyor: `cell: true` olanlar gridin
    boş kalan hücresine oturur, diğerleri gridin dışındaki kenar şeridine.
    Kenarda yeterli yer yoksa (dar ekran) o yiyecek otomatik gizlenir. */
export type FeatureProp = {
  src: string;
  size: number;
  rot: number;
  /** gridin boş hücresine mi oturuyor (dışarıdaki kenar şeridi yerine) */
  cell?: boolean;
  from: { top: number; left: number; rot: number };
  at: { c: number; r: number };
  atSm: { c: number; r: number };
};

export const featureProps: FeatureProp[] = [
  { src: "/props/elma.webp", size: 118, rot: -10,
    from: { top: -30, left: 20, rot: -40 }, at: { c: -0.85, r: 0.1 }, atSm: { c: -0.85, r: 0.3 } },
  { src: "/props/uzum.webp", size: 112, rot: -8,
    from: { top: -46, left: 26, rot: 30 }, at: { c: -0.85, r: 1.45 }, atSm: { c: -0.85, r: 2.2 } },
  { src: "/props/havuc.webp", size: 108, rot: 22, cell: true,
    from: { top: -25, left: 40, rot: 70 }, at: { c: 0, r: 2 }, atSm: { c: 0, r: 4 } },
  { src: "/props/domates.webp", size: 102, rot: -12, cell: true,
    from: { top: -35, left: 65, rot: -60 }, at: { c: 4, r: 2 }, atSm: { c: 2, r: 4 } },
  { src: "/props/yesil-elma.webp", size: 96, rot: 16,
    from: { top: -28, left: 72, rot: -35 }, at: { c: 5, r: 0.1 }, atSm: { c: 3, r: 0.3 } },
  { src: "/props/brokoli.webp", size: 126, rot: 14,
    from: { top: -20, left: 80, rot: 50 }, at: { c: 5, r: 2.15 }, atSm: { c: 3, r: 3.4 } },
  { src: "/props/su.webp", size: 90, rot: 8,
    from: { top: -40, left: 55, rot: -20 }, at: { c: -0.85, r: 2.8 }, atSm: { c: -0.85, r: 4.1 } },
  { src: "/props/yumurta.webp", size: 84, rot: -6,
    from: { top: -50, left: 48, rot: 20 }, at: { c: 5, r: 1.3 }, atSm: { c: 3, r: 1.8 } },
];
