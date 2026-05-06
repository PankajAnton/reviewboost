export function OrangeCheckLine({ children }) {
  return (
    <li className="flex gap-2.5 text-sm leading-snug text-stone-700">
      <span className="shrink-0 font-bold text-[#f97316]" aria-hidden>
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}

export function PlanFeatureChecklist({ items }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((text) => (
        <OrangeCheckLine key={text}>{text}</OrangeCheckLine>
      ))}
    </ul>
  );
}
