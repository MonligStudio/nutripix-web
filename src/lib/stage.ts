/**
 * Sahne geometrisi — "el + telefon" kompozisyonunun tüm ölçüleri
 * 620 × 1000'lik sanal bir koordinat sisteminde tanımlıdır.
 *
 * Bu dosya `blender/model.py` ile ORTAKTIR: el modeli aynı koordinat
 * sisteminde, ortografik kamerayla render edilir. Buradaki bir sayı
 * değişirse Blender tarafı da yeniden çalıştırılmalıdır, yoksa render
 * edilen el DOM'daki telefonla hizasını kaybeder.
 */

export const STAGE = { w: 620, h: 1000 };

/**
 * El katmanının render kadrajı — sahneyle aynı sol-üst köşeyi paylaşır ama
 * 220 birim daha uzundur; ön kol kadrajın altından çıkıp gitsin diye.
 */
export const HAND_FRAME = { w: 620, h: 1220 };

/**
 * Telefon gövdesi. Blender'da bu dikdörtgen "holdout" olarak kullanılır:
 * modelin kendi telefonu alfadan silinir, yerini buradaki DOM telefon alır.
 * Telefonun önünde kalan parmaklar render'da durur ve DOM'un üstüne biner.
 */
export const PHONE = { x: 86, y: 24.8, w: 388, h: 780.4 };

/** Ekran alanı — gövdenin 12 birim içi */
export const SCREEN = { x: 98, y: 36.8, w: 364, h: 756.4 };

const box = (r: { x: number; y: number; w: number; h: number }) => ({
  left: `${(r.x / STAGE.w) * 100}%`,
  top: `${(r.y / STAGE.h) * 100}%`,
  width: `${(r.w / STAGE.w) * 100}%`,
  height: `${(r.h / STAGE.h) * 100}%`,
});

export const PHONE_STYLE = box(PHONE);
export const SCREEN_STYLE = box(SCREEN);
