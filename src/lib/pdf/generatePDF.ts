import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import {
  resumeLayoutSchema,
  type ResumeLayout,
  type TextElement,
} from "@/shared/layoutSchema";
import { wrapText } from "@/shared/textWrap";

const REGULAR_FONT_PATH = path.join(process.cwd(), "public", "fonts", "NotoSans-Regular.ttf");
const BOLD_FONT_PATH = path.join(process.cwd(), "public", "fonts", "NotoSans-Bold.ttf");

type LoadedImage = { bytes: Uint8Array; kind: "png" | "jpg" };

export async function generatePDF(layoutJson: ResumeLayout): Promise<Uint8Array> {
  const layout = resumeLayoutSchema.parse(layoutJson);
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const regularFontBytes = await readFile(REGULAR_FONT_PATH);
  const boldFontBytes = await readFile(BOLD_FONT_PATH);

  const regularFont = await pdf.embedFont(regularFontBytes, { subset: true });
  const boldFont = await pdf.embedFont(boldFontBytes, { subset: true });

  const pageCount = layout.elements.reduce((max, element) => Math.max(max, element.pageIndex), 0) + 1;
  const pages = Array.from({ length: pageCount }, () =>
    pdf.addPage([layout.page.width, layout.page.height]),
  );

  const measure = (text: string, style: Pick<TextElement, "fontSize" | "fontWeight" | "letterSpacing">) => {
    const font = style.fontWeight === "bold" ? boldFont : regularFont;
    const baseWidth = font.widthOfTextAtSize(text, style.fontSize);
    const spacing = style.letterSpacing * Math.max(0, text.length - 1);
    return baseWidth + spacing;
  };

  for (const element of layout.elements) {
    const page = pages[element.pageIndex];
    if (!page) {
      continue;
    }

    if (element.type === "rect") {
      page.drawRectangle({
        x: element.x,
        y: layout.page.height - element.y - element.height,
        width: element.width,
        height: element.height,
        color: parseHexColor(element.color),
        ...(element.strokeColor && typeof element.strokeWidth === "number" && element.strokeWidth > 0
          ? {
              borderColor: parseHexColor(element.strokeColor),
              borderWidth: element.strokeWidth,
            }
          : {}),
        ...(typeof element.opacity === "number" ? { opacity: element.opacity } : {}),
      });
      continue;
    }

    if (element.type === "circle") {
      page.drawEllipse({
        x: element.cx,
        y: layout.page.height - element.cy,
        xScale: element.radius,
        yScale: element.radius,
        color: parseHexColor(element.color),
        ...(element.strokeColor && typeof element.strokeWidth === "number" && element.strokeWidth > 0
          ? {
              borderColor: parseHexColor(element.strokeColor),
              borderWidth: element.strokeWidth,
            }
          : {}),
        ...(typeof element.opacity === "number" ? { opacity: element.opacity } : {}),
      });
      continue;
    }

    if (element.type === "line") {
      page.drawRectangle({
        x: element.x,
        y: layout.page.height - element.y - element.strokeWidth,
        width: element.width,
        height: element.strokeWidth,
        color: parseHexColor(element.color),
      });
      continue;
    }

    if (element.type === "image") {
      const imageAsset = await loadImageBytes(element.src);
      if (!imageAsset) {
        continue;
      }

      const image = imageAsset.kind === "png"
        ? await pdf.embedPng(imageAsset.bytes)
        : await pdf.embedJpg(imageAsset.bytes);

      page.drawImage(image, {
        x: element.x,
        y: layout.page.height - element.y - element.height,
        width: element.width,
        height: element.height,
      });
      continue;
    }

    const font = element.fontWeight === "bold" ? boldFont : regularFont;
    const lineHeightPx = element.fontSize * element.lineHeight;
    const lines = wrapText(element.content, element.width, element, measure);

    for (const [lineIndex, line] of lines.entries()) {
      const lineTop = element.y + lineHeightPx * lineIndex;
      const y = layout.page.height - lineTop - element.fontSize;
      if (y < 0) {
        break;
      }

      page.drawText(line, {
        x: element.x,
        y,
        size: element.fontSize,
        font,
        color: parseHexColor(element.color),
        lineHeight: lineHeightPx,
      });
    }
  }

  return pdf.save();
}

function parseHexColor(hex: string) {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3
    ? normalized
        .split("")
        .map((char) => `${char}${char}`)
        .join("")
    : normalized;

  const red = Number.parseInt(full.slice(0, 2), 16) / 255;
  const green = Number.parseInt(full.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(full.slice(4, 6), 16) / 255;

  return rgb(red, green, blue);
}

async function loadImageBytes(src: string): Promise<LoadedImage | null> {
  if (!src) {
    return null;
  }

  if (src.startsWith("data:image/")) {
    const dataUrlMatch = src.match(/^data:image\/([a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!dataUrlMatch) {
      return null;
    }

    const [, mimeSubtype, payload] = dataUrlMatch;
    if (!payload) {
      return null;
    }

    const normalizedSubtype = mimeSubtype.toLowerCase();
    const kind = normalizedSubtype.includes("png")
      ? "png"
      : normalizedSubtype.includes("jpg") || normalizedSubtype.includes("jpeg")
        ? "jpg"
        : null;

    if (!kind) {
      return null;
    }

    return {
      bytes: Uint8Array.from(Buffer.from(payload, "base64")),
      kind,
    };
  }

  if (src.startsWith("/") || src.startsWith(".")) {
    const localPath = src.startsWith("/") ? src.slice(1) : src;
    try {
      const bytes = await readFile(path.join(process.cwd(), "public", localPath));
      const ext = path.extname(localPath).toLowerCase();

      return {
        bytes: Uint8Array.from(bytes),
        kind: ext === ".png" ? "png" : "jpg",
      };
    } catch {
      return null;
    }
  }

  return null;
}
