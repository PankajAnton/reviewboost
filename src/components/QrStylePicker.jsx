import { StyledReviewQr } from "./StyledReviewQr.jsx";
import { normalizeQrStyleId } from "../lib/qrStyleConfig.js";

const PICKER_OPTIONS = [
  { id: "classic", label: "Classic" },
  { id: "star", label: "Star" },
  { id: "smiley", label: "Smiley" },
  { id: "rounded", label: "Rounded" },
  { id: "heart", label: "Heart" },
];

/**
 * @param {{
 *   scanUrl: string;
 *   selectedId: string;
 *   onSelect: (id: string) => void;
 * }} props
 */
export function QrStylePicker({ scanUrl, selectedId, onSelect }) {
  const sel = normalizeQrStyleId(selectedId);

  return (
    <div className="w-full max-w-md">
      <p className="text-center text-xs font-semibold tracking-wide text-stone-700">
        QR Code Style
      </p>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1 pt-0.5 [-webkit-overflow-scrolling:touch]">
        {PICKER_OPTIONS.map(({ id, label }) => {
          const isSel = sel === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={`flex h-[70px] w-[60px] shrink-0 flex-col items-center justify-between rounded-xl border-2 px-1 pb-1.5 pt-2 transition-colors ${
                isSel
                  ? "border-[#f97316] bg-orange-50/90 ring-1 ring-[#f97316]/25"
                  : "border-stone-200 bg-white hover:bg-stone-50"
              }`}
            >
              <div className="flex max-h-9 min-h-9 items-center justify-center overflow-hidden">
                <StyledReviewQr
                  value={scanUrl}
                  styleId={id}
                  size={34}
                  animated={false}
                />
              </div>
              <span
                className={`max-w-[56px] truncate text-center text-[10px] font-semibold leading-tight ${
                  isSel ? "text-[#c2410c]" : "text-stone-600"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
