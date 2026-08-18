export default function SectionHead({
  eyebrow,
  title,
  body,
  align = "left",
  className = "",
}: {
  eyebrow: string;
  title: React.ReactNode;
  body?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={[
        "max-w-[62ch]",
        align === "center" ? "mx-auto text-center" : "",
        className,
      ].join(" ")}
    >
      <div
        data-reveal
        className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}
      >
        <span className="h-px w-8 bg-mint/60" />
        <span className="eyebrow !text-mint">{eyebrow}</span>
      </div>

      <h2
        data-reveal
        data-reveal-delay="80"
        className="h-display mt-5 text-[clamp(30px,5.2vw,58px)]"
      >
        {title}
      </h2>

      {body && (
        <p
          data-reveal
          data-reveal-delay="160"
          className={`mt-5 text-[15.5px] leading-relaxed text-fg-2 lg:text-[17px] ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {body}
        </p>
      )}
    </div>
  );
}
