import type { CSSProperties, ReactNode } from "react";

const BODY_RADIUS = "15.5% / 7.15%";
const SCREEN_RADIUS = "13.2% / 6.0%";

/**
 * Telefon çerçevesi — el modeliyle aynı "clay" dilinde: metalik kasa yerine
 * mat gövde, kalın yuvarlatılmış köşeler, sol üstten tek bir yumuşak kenar
 * ışığı. Genişlik dışarıdan verilir, yükseklik 1179:2556 oranından gelir.
 */
export function PhoneFrame({
  children,
  className = "",
  style,
  buttons = true,
  camera = "island",
  glow = true,
  shadow = true,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  buttons?: boolean;
  /** iPhone'da dinamik ada, Android'de tepe ortasında delik kamera. */
  camera?: "island" | "punch" | "none";
  glow?: boolean;
  /** Dışa düşen gölge; kapanınca sadece kenar kabartmaları kalır. */
  shadow?: boolean;
}) {
  return (
    <div
      className={`relative ${className}`}
      style={{ aspectRatio: "1179 / 2556", ...style }}
    >
      {glow && (
        <div
          className="pointer-events-none absolute -inset-[14%] -z-10 opacity-70"
          style={{
            background:
              "radial-gradient(50% 42% at 50% 46%, color-mix(in oklab, var(--accent) 26%, transparent) 0%," +
              " color-mix(in oklab, var(--accent) 8%, transparent) 45%, transparent 72%)",
          }}
        />
      )}

      {/* yan tuşlar — clay stilde sadece hafif kabartı */}
      {buttons && (
        <>
          <span
            className="absolute -left-[0.9%] top-[17%] h-[3.4%] w-[1.1%] rounded-l-full bg-[#2a323c]"
          />
          <span
            className="absolute -left-[0.9%] top-[23.5%] h-[6.2%] w-[1.1%] rounded-l-full bg-[#2a323c]"
          />
          <span
            className="absolute -left-[0.9%] top-[31.8%] h-[6.2%] w-[1.1%] rounded-l-full bg-[#2a323c]"
          />
          <span
            className="absolute -right-[0.9%] top-[26.5%] h-[8.8%] w-[1.1%] rounded-r-full bg-[#2a323c]"
          />
        </>
      )}

      {/* mat gövde */}
      <div
        className="absolute inset-0 p-[2.6%]"
        style={{
          borderRadius: BODY_RADIUS,
          background: "linear-gradient(155deg,#333b46 0%,#222932 26%,#1a2028 62%,#141a21 100%)",
          boxShadow: shadow
            ? "0 1.5px 0 rgba(255,255,255,.16) inset, 0 -1px 0 rgba(0,0,0,.55) inset," +
              " 0 40px 90px -30px rgba(0,0,0,.85), 0 14px 40px -20px rgba(0,0,0,.7)"
            : "0 1.5px 0 rgba(255,255,255,.16) inset, 0 -1px 0 rgba(0,0,0,.55) inset",
        }}
      >
        {/* ekran */}
        <div
          className="relative h-full w-full overflow-hidden bg-black"
          style={{ borderRadius: SCREEN_RADIUS }}
        >
          {children}

          {camera === "island" && (
            <div
              className="pointer-events-none absolute left-1/2 top-[1.15%] h-[3.4%] w-[30.5%] -translate-x-1/2 rounded-full bg-black"
              style={{ boxShadow: "0 0 0 1px rgba(255,255,255,.05)" }}
            >
              <span className="absolute right-[14%] top-1/2 h-[42%] w-0 -translate-y-1/2 rounded-full pl-[10%] [background:radial-gradient(circle,#1b2733_35%,#0a0e13_70%)]" />
            </div>
          )}

          {camera === "punch" && (
            <span
              className="pointer-events-none absolute left-1/2 top-[1.5%] aspect-square w-[4.6%] -translate-x-1/2 rounded-full bg-black"
              style={{
                boxShadow: "0 0 0 1px rgba(255,255,255,.07)",
                background: "radial-gradient(circle at 35% 30%, #1b2733 30%, #05080c 72%)",
              }}
            />
          )}

          {/* cam yansıması — tek, yumuşak diyagonal */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(122deg, rgba(255,255,255,.06) 0%, rgba(255,255,255,.015) 26%, transparent 46%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              boxShadow: "0 0 0 1px rgba(0,0,0,.65) inset",
              borderRadius: SCREEN_RADIUS,
            }}
          />
        </div>
      </div>
    </div>
  );
}
