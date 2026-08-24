import type { ReactNode } from "react";
import { HAND_FRAME } from "@/lib/stage";
import { withBasePath } from "@/lib/paths";

/**
 * El + telefon katmanı — orijinal (dikişsiz) Meshy modelinden iki statik
 * kare: dinlenme (rest) ve baş parmağın hafifçe büküldüğü bastırma (press).
 * İkisi de aynı kadraj/ışık/malzeme ile, yalnızca baş parmak kemiği
 * (blender/hand_phone_whole_site.blend içindeki basit "Thumb" rig'i) farklı
 * pozda render edildi — el ve telefon hiç kıpırdamıyor. Journey.tsx bu
 * ikisi arasında scroll'a bağlı opaklık geçişi yapıyor (bkz. .hand-press).
 *
 * `children`, statik fotoğrafın ekran boşluğunun (SCREEN_STYLE) üstüne
 * gelen canlı uygulama ekran görüntülerini taşır — aynı HAND_FRAME
 * koordinat sisteminde konumlanır.
 */
export function HandLayer({ children }: { children?: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="hand-frame absolute left-0 top-0 w-full"
      style={{ aspectRatio: `${HAND_FRAME.w} / ${HAND_FRAME.h}` }}
    >
      <div
        className="hand-photo hand-rest pointer-events-none absolute inset-0 h-full w-full select-none"
        style={{
          backgroundImage: `url(${withBasePath("/hand/hand-phone-rest.webp")})`,
          backgroundSize: "100% 100%",
          backgroundPosition: "0% 0%",
          backgroundRepeat: "no-repeat",
          filter: "drop-shadow(-16px 22px 30px rgba(0,0,0,.55))",
        }}
      />
      <div
        className="hand-photo hand-press pointer-events-none absolute inset-0 h-full w-full select-none opacity-0"
        style={{
          backgroundImage: `url(${withBasePath("/hand/hand-phone-press.webp")})`,
          backgroundSize: "100% 100%",
          backgroundPosition: "0% 0%",
          backgroundRepeat: "no-repeat",
          filter: "drop-shadow(-16px 22px 30px rgba(0,0,0,.55))",
        }}
      />
      {children}
    </div>
  );
}
