export function SectionPanel({ title, eyebrow, action, children, className = "" }) {
  return (
    <section className={`glass-panel p-5 sm:p-6 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-500 dark:text-glow">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="section-title">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
