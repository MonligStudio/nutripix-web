import { Fragment } from "react";

/**
 * Marka adları büyük harfe Türkçe kuralıyla çevrilmemeli: `lang="tr"` altında
 * `text-transform: uppercase` "iPhone"u "İPHONE" yapıyor. Veriden gelen
 * başlıklarda markaları bulup `lang="en"` ile sarmalıyoruz.
 */
const BRANDS = /(iPhone|iPad|iOS|Android|NutriPix|App Store|Google Play|Open Food Facts)/g;

export function withBrands(text: string) {
  return text.split(BRANDS).map((part, i) =>
    i % 2 === 1 ? (
      <span key={`${part}-${i}`} lang="en">
        {part}
      </span>
    ) : (
      <Fragment key={`t-${i}`}>{part}</Fragment>
    ),
  );
}
