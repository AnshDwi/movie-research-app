export function MobileAccordion({ title, children, defaultOpen = false }) {
  return (
    <details
      className="glass-panel md:hidden"
      open={defaultOpen}
    >
      <summary className="cursor-pointer list-none px-5 py-4 font-display text-lg font-semibold">
        {title}
      </summary>
      <div className="px-5 pb-5">{children}</div>
    </details>
  );
}
