export default function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="text-sm font-semibold text-baybay-cocoa tracking-wide">
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">
          {title}
        </h2>
      ) : null}
      {subtitle ? (
        <p className="mt-3 text-black/65">{subtitle}</p>
      ) : null}
    </div>
  );
}
