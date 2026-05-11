import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { emojiToDataUrl } from "../lib/emojiToDataUrl.js";
import { resolveQrStyle } from "../lib/qrStyleConfig.js";

const PLACEHOLDER_URL = "https://reviewboost.invalid/preview";

/**
 * @param {{
 *   value: string;
 *   styleId: string;
 *   size?: number;
 *   animated?: boolean;
 *   className?: string;
 * }} props
 */
export function StyledReviewQr({
  value,
  styleId,
  size = 140,
  animated = true,
  className = "",
}) {
  const encode = (value && String(value).trim()) || PLACEHOLDER_URL;

  const [displayStyleId, setDisplayStyleId] = useState(styleId);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!animated) {
      setDisplayStyleId(styleId);
      setVisible(true);
      return undefined;
    }
    if (styleId === displayStyleId) return undefined;
    setVisible(false);
    const t = window.setTimeout(() => {
      setDisplayStyleId(styleId);
      window.requestAnimationFrame(() => setVisible(true));
    }, 300);
    return () => window.clearTimeout(t);
  }, [animated, styleId, displayStyleId]);

  const cfg = useMemo(
    () => resolveQrStyle(animated ? displayStyleId : styleId),
    [animated, displayStyleId, styleId],
  );

  const imageSettings = useMemo(() => {
    if (!cfg.centerEmoji) return undefined;
    const side = Math.max(12, Math.round(size * 0.21));
    return {
      src: emojiToDataUrl(cfg.centerEmoji, 128),
      width: side,
      height: side,
      excavate: true,
    };
  }, [cfg.centerEmoji, size]);

  const inner = (
    <QRCodeSVG
      value={encode}
      size={size}
      level={cfg.level}
      includeMargin
      bgColor={cfg.bg}
      fgColor={cfg.fg}
      imageSettings={imageSettings}
    />
  );

  const wrapped = cfg.roundedContainer ? (
    <div className="overflow-hidden rounded-[24px] shadow-sm ring-1 ring-indigo-100/80">
      {inner}
    </div>
  ) : (
    inner
  );

  const opacityClass = animated
    ? visible
      ? "opacity-100"
      : "opacity-0"
    : "opacity-100";

  return (
    <div
      className={`transition-opacity duration-300 ease-out ${opacityClass} ${className}`.trim()}
    >
      {wrapped}
    </div>
  );
}
