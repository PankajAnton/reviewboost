import { useEffect, useState } from "react";

/**
 * Character-by-character reveal (AI “writing” feel).
 */
export default function TypewriterText({
  text,
  startDelay = 0,
  charDelay = 14,
  className = "",
  showCursor = true,
}) {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplay("");
    setDone(false);
    if (!text) {
      setDone(true);
      return;
    }

    let cancelled = false;
    let tid;
    let i = 0;

    function scheduleNext(delay) {
      tid = setTimeout(() => {
        if (cancelled) return;
        if (i >= text.length) {
          setDisplay(text);
          setDone(true);
          return;
        }
        setDisplay(text.slice(0, i + 1));
        i += 1;
        scheduleNext(charDelay);
      }, delay);
    }

    scheduleNext(startDelay);

    return () => {
      cancelled = true;
      clearTimeout(tid);
    };
  }, [text, startDelay, charDelay]);

  return (
    <span className={className}>
      {display}
      {showCursor && !done ? (
        <span className="ml-0.5 inline-block w-0.5 animate-pulse text-[#ea580c]">▍</span>
      ) : null}
    </span>
  );
}
