import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { QRCodeCanvas } from "qrcode.react";

const ORANGE = "#f97316";

function sanitizeFilename(name) {
  const s = (name || "Restaurant")
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  return s || "Restaurant";
}

function A4Poster({ restaurantName, reviewUrl, siteUrl }) {
  return (
    <div
      id="reviewboost-pdf-poster"
      style={{
        width: "794px",
        minHeight: "1123px",
        background: "#ffffff",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          background: ORANGE,
          color: "#ffffff",
          padding: "28px 32px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "28px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#ffffff",
          }}
        >
          ReviewBoost
        </div>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 500,
            opacity: 0.95,
            marginTop: "8px",
            color: "#ffffff",
          }}
        >
          Smart Reviews for Smart Restaurants
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: "40px 48px 36px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "32px",
            fontWeight: 700,
            color: "#1c1917",
            lineHeight: 1.2,
            maxWidth: "100%",
          }}
        >
          {restaurantName}
        </h1>

        <div
          data-pdf-qr-root
          style={{
            marginTop: "36px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              padding: "16px",
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
            }}
          >
            <QRCodeCanvas
              value={reviewUrl}
              size={250}
              level="H"
              includeMargin
              bgColor="#ffffff"
              fgColor="#1c1917"
            />
          </div>
        </div>

        <p
          style={{
            margin: "28px 0 0",
            fontSize: "18px",
            fontWeight: 600,
            color: "#57534e",
          }}
        >
          Scan &amp; share your experience
        </p>
        <p
          style={{
            margin: "10px 0 0",
            fontSize: "14px",
            color: "#78716c",
          }}
        >
          Takes less than 30 seconds • Your feedback matters
        </p>
        <div
          style={{
            marginTop: "24px",
            fontSize: "22px",
            color: ORANGE,
            letterSpacing: "6px",
            lineHeight: 1,
          }}
          aria-hidden
        >
          ★★★★★
        </div>
      </div>

      <div
        style={{
          background: ORANGE,
          color: "#ffffff",
          padding: "22px 32px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: 600,
            wordBreak: "break-all",
            color: "#ffffff",
          }}
        >
          {siteUrl}
        </div>
        <div
          style={{
            fontSize: "11px",
            marginTop: "8px",
            opacity: 0.92,
            color: "#ffffff",
          }}
        >
          Powered by ReviewBoost
        </div>
      </div>
    </div>
  );
}

function writePdfIframeShell(doc) {
  doc.open();
  doc.write(
    "<!DOCTYPE html><html><head><meta charset=\"utf-8\">" +
      "<style>" +
      "*{box-sizing:border-box}" +
      "html,body{margin:0;padding:0;background:#ffffff;color:#1c1917}" +
      "</style>" +
      "</head><body><div id=\"rb-pdf-root\"></div></body></html>"
  );
  doc.close();
}

/**
 * Renders the poster inside a blank iframe so html2canvas never parses the main app’s
 * Tailwind oklch() styles (which break html2canvas).
 */
export async function downloadReviewBoostRestaurantPdf({
  restaurantName,
  reviewUrl,
  siteUrl,
}) {
  if (!reviewUrl?.trim()) {
    throw new Error("Review link missing — set VITE_PUBLIC_APP_URL and redeploy.");
  }

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.title = "pdf-render";
  iframe.style.cssText =
    "position:fixed;left:-12000px;top:0;width:820px;height:1200px;border:0;opacity:0;pointer-events:none;";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const iWin = iframe.contentWindow;
  if (!doc || !iWin) {
    document.body.removeChild(iframe);
    throw new Error("Could not create PDF frame.");
  }

  writePdfIframeShell(doc);
  const mount = doc.getElementById("rb-pdf-root");
  if (!mount) {
    document.body.removeChild(iframe);
    throw new Error("PDF mount missing.");
  }

  const root = createRoot(mount);

  try {
    root.render(
      <A4Poster
        restaurantName={restaurantName}
        reviewUrl={reviewUrl}
        siteUrl={siteUrl || window.location.origin}
      />
    );

    await new Promise((r) =>
      iWin.requestAnimationFrame(() => iWin.requestAnimationFrame(r))
    );
    await new Promise((r) => setTimeout(r, 300));

    const posterEl = doc.getElementById("reviewboost-pdf-poster");
    if (!posterEl) {
      throw new Error("Could not build poster for PDF.");
    }

    const canvas = await html2canvas(posterEl, {
      window: iWin,
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: 794,
    });

    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgData = canvas.toDataURL("image/png", 1.0);

    const imgW = canvas.width;
    const imgH = canvas.height;
    const ratio = imgW / imgH;
    let drawW = pageW;
    let drawH = pageW / ratio;
    if (drawH > pageH) {
      drawH = pageH;
      drawW = pageH * ratio;
    }
    const offsetX = (pageW - drawW) / 2;
    const offsetY = (pageH - drawH) / 2;
    pdf.addImage(imgData, "PNG", offsetX, offsetY, drawW, drawH);
    pdf.save(`ReviewBoost-${sanitizeFilename(restaurantName)}.pdf`);
  } finally {
    root.unmount();
    iframe.remove();
  }
}
