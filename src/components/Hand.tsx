import { HAND_FRAME } from "@/lib/stage";
import { withBasePath } from "@/lib/paths";
import sprite from "@/lib/thumbFrames.json";

/**
 * El katmanı — Blender'da temizlenip sahneye hizalanan modelin ortografik
 * render'ı (blender/model.py). Modelin kendi telefonu holdout ile alfadan
 * silindiği için görselde SADECE el var: telefonun arkasında kalan avuç
 * kesilmiş, önündeki parmaklar durmaktadır. Bu yüzden katman DOM telefonun
 * ÜSTÜNE serilir, doğru örtüşme kendiliğinden oluşur.
 *
 * Üstünde baş parmağın poz dizisi var. Parmak iki eklemden (CMC + IP)
 * gerçek eklem limitleriyle bükülüp 24 kare render edildi; hedefe uzanma
 * iki halkalı IK ile çözüldü (blender/thumb_frames.py). Sprite yalnızca
 * kareler arasında değişen dikdörtgeni içerir, elin kalanı alttaki sabit
 * görselden gelir. 0. kare dinlenme duruşudur, tabanla birebir çakışır.
 *
 * Kadraj sahneden uzun (1220 / 1000) — kol aşağıdan taşsın diye. İkisi de
 * bu sarmalayıcının içinde olduğu için yüzdeler aynı uzaya oturur.
 */
export function HandLayer() {
  const { rect, cols, rows } = sprite;
  return (
    <div
      aria-hidden="true"
      className="hand-frame pointer-events-none absolute left-0 top-0 w-full"
      style={{ aspectRatio: `${HAND_FRAME.w} / ${HAND_FRAME.h}` }}
    >
      <img
        src={withBasePath("/hand/model.webp")}
        alt=""
        draggable={false}
        width={HAND_FRAME.w}
        height={HAND_FRAME.h}
        className="hand-model absolute inset-0 h-full w-full max-w-none select-none"
        style={{ filter: "drop-shadow(-16px 22px 30px rgba(0,0,0,.55))" }}
      />
      <div
        className="thumb-sprite absolute"
        style={{
          left: `${(rect.x / HAND_FRAME.w) * 100}%`,
          top: `${(rect.y / HAND_FRAME.h) * 100}%`,
          width: `${(rect.w / HAND_FRAME.w) * 100}%`,
          height: `${(rect.h / HAND_FRAME.h) * 100}%`,
          backgroundImage: `url(${withBasePath("/hand/thumb-sheet.webp")})`,
          backgroundSize: `${cols * 100}% ${rows * 100}%`,
          backgroundPosition: "0% 0%",
          backgroundRepeat: "no-repeat",
          filter: "drop-shadow(-14px 18px 24px rgba(0,0,0,.5))",
        }}
      />
    </div>
  );
}

/** Hedef → kare eşlemesi ve ızgara ölçüleri (blender/pack_thumb.py üretir) */
export const thumbFrames = sprite;
