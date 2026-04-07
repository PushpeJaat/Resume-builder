/**
 * Renders HTML to PDF via Browserless headless Chrome.
 * @see https://docs.browserless.io/docs/pdf.html
 */
export async function htmlToPdfBuffer(html: string): Promise<ArrayBuffer> {
  const token = process.env.BROWSERLESS_API_TOKEN;
  if (!token) {
    throw new Error("BROWSERLESS_API_TOKEN is not configured");
  }
  const base =
    process.env.BROWSERLESS_BASE_URL?.replace(/\/$/, "") ??
    "https://production-sfo.browserless.io";

  const url = `${base}/pdf?token=${encodeURIComponent(token)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
    body: JSON.stringify({
      html,
      waitForTimeout: 3000,
      options: {
        format: "A4",
        printBackground: true,
        displayHeaderFooter: false,
        margin: {
          top: "12mm",
          right: "12mm",
          bottom: "12mm",
          left: "12mm",
        },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Browserless PDF failed (${res.status}): ${text.slice(0, 500)}`);
  }

  return res.arrayBuffer();
}
