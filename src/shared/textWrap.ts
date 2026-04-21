import type { TextElement } from "@/shared/layoutSchema";

export type MeasureTextWidth = (text: string, style: Pick<TextElement, "fontSize" | "fontFamily" | "fontWeight" | "letterSpacing">) => number;

export function wrapText(
  text: string,
  maxWidth: number,
  style: Pick<TextElement, "fontSize" | "fontFamily" | "fontWeight" | "letterSpacing">,
  measure: MeasureTextWidth,
): string[] {
  if (!text.trim()) {
    return [""];
  }

  const paragraphs = text.replace(/\r\n/g, "\n").split("\n");
  const allLines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      allLines.push("");
      continue;
    }

    const words = paragraph.split(/\s+/).filter(Boolean);
    let currentLine = "";

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (measure(candidate, style) <= maxWidth) {
        currentLine = candidate;
        continue;
      }

      if (!currentLine) {
        const splitWord = splitLongWord(word, maxWidth, style, measure);
        allLines.push(...splitWord.slice(0, -1));
        currentLine = splitWord[splitWord.length - 1] ?? "";
        continue;
      }

      allLines.push(currentLine);

      if (measure(word, style) <= maxWidth) {
        currentLine = word;
      } else {
        const splitWord = splitLongWord(word, maxWidth, style, measure);
        allLines.push(...splitWord.slice(0, -1));
        currentLine = splitWord[splitWord.length - 1] ?? "";
      }
    }

    if (currentLine) {
      allLines.push(currentLine);
    }
  }

  return allLines.length > 0 ? allLines : [""];
}

function splitLongWord(
  word: string,
  maxWidth: number,
  style: Pick<TextElement, "fontSize" | "fontFamily" | "fontWeight" | "letterSpacing">,
  measure: MeasureTextWidth,
): string[] {
  const chunks: string[] = [];
  let current = "";

  for (const char of word) {
    const next = `${current}${char}`;
    if (current && measure(next, style) > maxWidth) {
      chunks.push(current);
      current = char;
    } else {
      current = next;
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.length > 0 ? chunks : [word];
}

export function createCanvasMeasure(): MeasureTextWidth {
  if (typeof document === "undefined") {
    return (text, style) => fallbackMeasure(text, style.fontSize, style.letterSpacing);
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    return (text, style) => fallbackMeasure(text, style.fontSize, style.letterSpacing);
  }

  return (text, style) => {
    const weight = style.fontWeight === "bold" ? 700 : 400;
    context.font = `${weight} ${style.fontSize}px ${style.fontFamily}`;
    const base = context.measureText(text).width;
    const spacing = style.letterSpacing * Math.max(0, text.length - 1);
    return base + spacing;
  };
}

export function fallbackMeasure(text: string, fontSize: number, letterSpacing: number): number {
  const base = text.length * fontSize * 0.56;
  const spacing = letterSpacing * Math.max(0, text.length - 1);
  return base + spacing;
}
