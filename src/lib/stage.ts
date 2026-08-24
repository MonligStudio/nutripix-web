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
 * Telefon dahil el+telefon TEK bir statik fotoğraf (blender/hand_phone_whole_site.blend,
 * kaynak Meshy_AI_Hand_Holding_Smartpho...blend — hiç bölünmemiş, dikişsiz model).
 * Ekran dikdörtgeni bu fotoğrafta kalan boşluğun piksel ölçümüyle bulundu
 * (measure_screen.py), HAND_FRAME (620×1220) koordinat sisteminde.
 */
export const SCREEN = { x: 53, y: 47, w: 336, h: 677 };

const box = (r: { x: number; y: number; w: number; h: number }, frame: { w: number; h: number }) => ({
  left: `${(r.x / frame.w) * 100}%`,
  top: `${(r.y / frame.h) * 100}%`,
  width: `${(r.w / frame.w) * 100}%`,
  height: `${(r.h / frame.h) * 100}%`,
});

export const SCREEN_STYLE = box(SCREEN, HAND_FRAME);
