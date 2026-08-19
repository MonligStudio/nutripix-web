export default function SectionHead({
  eyebrow,
  title,
  body,
  align = "center",
  className = "",
}: {
  eyebrow: string;
  title: React.ReactNode;
  body?: string;
  align?: "left" | "center";
  className?: string;
}) {
  const centered = align === "center";

  return (
    <div className={[centered ? "mx-auto text-center" : "max-w-[62ch]", className].join(" ")}>
      <div
        data-reveal
        className={`flex items-center gap-3 ${centered ? "justify-center" : ""}`}
      >
        <span className="h-px w-10 bg-accent" />
        <span className="eyebrow !text-accent">{eyebrow}</span>
        {centered && <span className="h-px w-10 bg-accent" />}
      </div>

      {/* Sayfa ortasında, kenardan kenara uzanan dev başlık. */}
      <h2
        data-reveal
        data-reveal-delay="80"
        className={`h-display mt-6 ${
          centered ? "text-[clamp(46px,9.5vw,168px)]" : "text-[clamp(38px,6vw,86px)]"
        }`}
      >
        {title}
      </h2>

      {body && (
        <p
          data-reveal
          data-reveal-delay="160"
          className={`mt-6 text-[15.5px] leading-relaxed text-fg-2 lg:text-[17px] ${
            centered ? "mx-auto max-w-[56ch]" : "max-w-[52ch]"
          }`}
        >
          {body}
        </p>
      )}
    </div>
  );
}
