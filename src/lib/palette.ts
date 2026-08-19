/**
 * Sayfa boyunca dolaşan renk temaları.
 *
 * Sayfanın zemini kural olarak SİYAH; bazı bölümler zeytin yeşiline döner ve
 * yalnızca vurgu anlarında (özellik şeridinin sonu, kapanış çağrısı) yanık
 * turuncuya geçer. Yani tüm site üç renkte konuşur: siyah → yeşil → turuncu.
 *
 * Her bölüm `data-color="<tema>"` ile temasını seçer; SectionColor bileşeni
 * bölüm ekranın ortasına gelince kök değişkenleri o temaya tweenler. Diğer tüm
 * renkler (yüzey, çizgi, ikincil metin) globals.css'te bu değişkenlerden
 * color-mix ile türediği için başka bir yeri güncellemek gerekmez.
 */

export const palette = {
  /** Zemin siyahı: hero ve açılış ekranı birebir aynı olsun diye tam siyah. */
  ink: "#000000",
  ivory: "#f6efe0",
  camel: "#d9c6a5",
  choco: "#472a1c",
  orange: "#c0570f",
  terra: "#9c4020",
  mustard: "#d3961d",
  sage: "#87a08f",
  olive: "#3f5a2b",
  /** Marka yeşili — logo, "PIX" ve hero vurguları. Siyah üzerinde okunur. */
  leaf: "#6a9f42",
  teal: "#164b5c",
  blush: "#e4a691",
} as const;

export type ThemeName = "ink" | "olive" | "orange";

export type Theme = {
  bg: string;
  fg: string;
  accent: string;
  accent2: string;
  /** Özellik şeridindeki kalın çizginin rengi — her zeminde okunur kalmalı. */
  ribbon: string;
};

export const themes: Record<ThemeName, Theme> = {
  ink: {
    bg: palette.ink,
    fg: palette.ivory,
    accent: palette.mustard,
    accent2: palette.orange,
    ribbon: palette.orange,
  },
  olive: {
    bg: palette.olive,
    fg: palette.ivory,
    accent: palette.mustard,
    accent2: palette.blush,
    ribbon: palette.mustard,
  },
  orange: {
    bg: palette.orange,
    fg: "#fbf3e4",
    accent: palette.ink,
    accent2: palette.mustard,
    ribbon: palette.ink,
  },
};

export const defaultTheme: ThemeName = "ink";

/** Tema fark etmeksizin sabit kalan renkler (indirme butonları). */
export const fixed = {
  buttonBg: "#100c06",
  buttonFg: "#f6efe0",
  buttonHover: palette.orange,
} as const;
