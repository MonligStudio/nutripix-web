import type { ReactNode } from "react";
import { HAND_FRAME } from "@/lib/stage";
import { withBasePath } from "@/lib/paths";

/**
 * El + telefon katmanı — artık tek bir statik fotoğraf
 * (blender/hand_phone_whole_site.blend, kaynak orijinal Meshy modeli, hiç
 * bölünmemiş/dikişsiz). Önceki ayrı-rigli animasyonlu el sprite'ı (25 kare)
 * gerçek mesh'te düzeltilemeyen bir başparmak-avuç kopukluğu içeriyordu;
 * kullanıcı isteğiyle bu tek parça modele geçildi. Baş parmak animasyonu
 * (dokunuş/kaydırma) bu adımda yok — sonraki adımda ayrıca eklenecek.
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
        className="hand-photo pointer-events-none absolute inset-0 h-full w-full select-none"
        style={{
          backgroundImage: `url(${withBasePath("/hand/hand-phone-static.webp")})`,
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
