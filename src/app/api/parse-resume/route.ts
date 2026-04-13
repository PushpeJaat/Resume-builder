import { ImageAnnotatorClient, type protos } from "@google-cloud/vision";
import mammoth from "mammoth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type SupportedFormat = "pdf" | "docx" | "jpeg";

type RouteInput =
  | { type: "file"; file: File }
  | { type: "fileUrl"; fileUrl: string };

type ResolvedInput = {
  bytes: Uint8Array;
  format: SupportedFormat;
  inputType: RouteInput["type"];
};

const MAX_PDF_BYTES = parsePositiveInt(process.env.MAX_RESUME_BYTES, 6 * 1024 * 1024);
const MAX_DOCX_BYTES = parsePositiveInt(process.env.MAX_DOCX_BYTES, 6 * 1024 * 1024);
const MAX_JPEG_BYTES = parsePositiveInt(process.env.MAX_JPEG_BYTES, 6 * 1024 * 1024);
const SMALL_PDF_BYTES = parsePositiveInt(process.env.VISION_DIRECT_PDF_MAX_BYTES, 3 * 1024 * 1024);
const FETCH_TIMEOUT_MS = parsePositiveInt(process.env.PARSE_RESUME_FETCH_TIMEOUT_MS, 8_000);
const OCR_TIMEOUT_MS = parsePositiveInt(process.env.OCR_TIMEOUT_MS, 10_000);
const DOCX_TIMEOUT_MS = parsePositiveInt(process.env.DOCX_TIMEOUT_MS, 5_000);
const MAX_PAGES_PER_REQUEST = 5;
const MAX_PAGED_BATCHES = parsePositiveInt(process.env.VISION_MAX_PAGE_BATCHES, 2);

let cachedVisionClient: ImageAnnotatorClient | null = null;

export async function POST(req: Request) {
  try {
    const input = await parseInput(req);
    const resolved = await readInputBytes(input);

    const extraction =
      resolved.format === "pdf"
        ? await extractTextFromPdf(resolved.bytes)
        : resolved.format === "docx"
          ? await extractTextFromDocx(resolved.bytes)
          : await extractTextFromImage(resolved.bytes);

    const cleaned = cleanExtractedText(extraction.text);
    if (!cleaned) {
      return NextResponse.json(
        {
          error: "No text could be extracted from the file.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json(
      {
        raw_text: cleaned,
        meta: {
          source: extraction.source,
          provider: extraction.provider,
          mode: extraction.mode,
          format: resolved.format,
          length: cleaned.length,
          input: resolved.inputType,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    const { status, message } = toErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}

class ParseRouteError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "ParseRouteError";
    this.status = status;
  }
}

async function parseInput(req: Request): Promise<RouteInput> {
  const contentType = (req.headers.get("content-type") ?? "").toLowerCase();

  if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    const fileUrl = typeof body?.fileUrl === "string" ? body.fileUrl.trim() : "";
    if (!fileUrl) {
      throw new ParseRouteError("JSON body must include a non-empty fileUrl.", 400);
    }

    return {
      type: "fileUrl",
      fileUrl,
    };
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    throw new ParseRouteError("Request body must be valid JSON or multipart form data.", 400);
  }

  const uploaded = formData.get("resume") ?? formData.get("file");
  if (isUploadableFile(uploaded)) {
    return {
      type: "file",
      file: uploaded,
    };
  }

  const fileUrlValue = formData.get("fileUrl");
  const fileUrl = typeof fileUrlValue === "string" ? fileUrlValue.trim() : "";
  if (fileUrl) {
    return {
      type: "fileUrl",
      fileUrl,
    };
  }

  throw new ParseRouteError("Provide either form field 'resume'/'file' or 'fileUrl'.", 400);
}

async function readInputBytes(input: RouteInput): Promise<ResolvedInput> {
  if (input.type === "file") {
    return readUploadedFileBytes(input.file);
  }

  return readRemoteFileBytes(input.fileUrl);
}

async function readUploadedFileBytes(file: File): Promise<ResolvedInput> {
  if (file.size <= 0) {
    throw new ParseRouteError("Uploaded file is empty.", 400);
  }

  const format = detectSupportedFormat({
    fileName: file.name,
    mimeType: file.type,
  });

  if (!format) {
    throw new ParseRouteError("Only PDF, DOCX, and JPG/JPEG files are supported.", 400);
  }

  const maxBytes = getMaxBytesForFormat(format);
  if (file.size > maxBytes) {
    throw new ParseRouteError(
      `${format.toUpperCase()} is too large. Max allowed is ${toMb(maxBytes)} MB.`,
      413,
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.byteLength === 0) {
    throw new ParseRouteError("Uploaded file is empty.", 400);
  }

  return {
    bytes,
    format,
    inputType: "file",
  };
}

async function readRemoteFileBytes(fileUrl: string): Promise<ResolvedInput> {
  if (!/^https?:\/\//i.test(fileUrl)) {
    throw new ParseRouteError("fileUrl must be an absolute http(s) URL.", 400);
  }

  const response = await fetchWithTimeout(fileUrl, {
    method: "GET",
    headers: {
      Accept:
        "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/jpg,application/octet-stream",
    },
    timeoutMs: FETCH_TIMEOUT_MS,
    timeoutMessage: "Timed out while downloading file from fileUrl.",
  });

  if (!response.ok) {
    throw new ParseRouteError(`Failed to download file from fileUrl (${response.status}).`, 400);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength === 0) {
    throw new ParseRouteError("Downloaded file is empty.", 400);
  }

  const format = detectSupportedFormat({
    fileName: getFileNameFromUrl(fileUrl),
    mimeType: response.headers.get("content-type") ?? "",
    bytes,
  });

  if (!format) {
    throw new ParseRouteError("Only PDF, DOCX, and JPG/JPEG files are supported via fileUrl.", 400);
  }

  const maxBytes = getMaxBytesForFormat(format);
  const contentLength = Number.parseInt(response.headers.get("content-length") ?? "", 10);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new ParseRouteError(
      `${format.toUpperCase()} is too large. Max allowed is ${toMb(maxBytes)} MB.`,
      413,
    );
  }

  if (bytes.byteLength > maxBytes) {
    throw new ParseRouteError(
      `${format.toUpperCase()} is too large. Max allowed is ${toMb(maxBytes)} MB.`,
      413,
    );
  }

  return {
    bytes,
    format,
    inputType: "fileUrl",
  };
}

function detectSupportedFormat(args: {
  fileName?: string;
  mimeType?: string;
  bytes?: Uint8Array;
}): SupportedFormat | null {
  const mimeType = (args.mimeType ?? "").toLowerCase();
  if (mimeType.includes("application/pdf")) {
    return "pdf";
  }

  if (mimeType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
    return "docx";
  }

  if (mimeType.includes("image/jpeg") || mimeType.includes("image/jpg")) {
    return "jpeg";
  }

  const extension = (args.fileName ?? "").split(".").pop()?.toLowerCase() ?? "";
  if (extension === "pdf") {
    return "pdf";
  }

  if (extension === "docx") {
    return "docx";
  }

  if (extension === "jpg" || extension === "jpeg") {
    return "jpeg";
  }

  const bytes = args.bytes;
  if (bytes && isPdfMagic(bytes)) {
    return "pdf";
  }

  if (bytes && isJpegMagic(bytes)) {
    return "jpeg";
  }

  return null;
}

function isPdfMagic(bytes: Uint8Array) {
  return (
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}

function isJpegMagic(bytes: Uint8Array) {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function getFileNameFromUrl(fileUrl: string) {
  try {
    const url = new URL(fileUrl);
    const segments = url.pathname.split("/").filter(Boolean);
    return decodeURIComponent(segments.at(-1) ?? "");
  } catch {
    return "";
  }
}

function getMaxBytesForFormat(format: SupportedFormat) {
  if (format === "pdf") {
    return MAX_PDF_BYTES;
  }

  if (format === "docx") {
    return MAX_DOCX_BYTES;
  }

  return MAX_JPEG_BYTES;
}

async function extractTextFromPdf(pdfBytes: Uint8Array) {
  const mode = pdfBytes.byteLength <= SMALL_PDF_BYTES ? "direct_pdf" : "paged_pdf";
  const text =
    mode === "direct_pdf"
      ? await runVisionPdfOcr(pdfBytes, [1, 2, 3, 4, 5])
      : await runVisionPdfOcrInBatches(pdfBytes);

  return {
    text,
    source: "ocr" as const,
    provider: "google-vision" as const,
    mode,
  };
}

async function extractTextFromDocx(docxBytes: Uint8Array) {
  const result = await withTimeout(
    mammoth.extractRawText({ buffer: Buffer.from(docxBytes) }),
    DOCX_TIMEOUT_MS,
    "DOCX extraction timed out.",
  );

  return {
    text: result.value ?? "",
    source: "docx" as const,
    provider: "mammoth" as const,
    mode: "docx_text" as const,
  };
}

async function extractTextFromImage(imageBytes: Uint8Array) {
  const text = await runVisionImageOcr(imageBytes);

  return {
    text,
    source: "ocr" as const,
    provider: "google-vision" as const,
    mode: "image_ocr" as const,
  };
}

async function runVisionPdfOcr(pdfBytes: Uint8Array, pages: number[]): Promise<string> {
  const client = getVisionClient();

  const request: protos.google.cloud.vision.v1.IBatchAnnotateFilesRequest = {
    requests: [
      {
        inputConfig: {
          mimeType: "application/pdf",
          content: pdfBytes,
        },
        features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
        pages,
      },
    ],
  };

  const [response] = await withTimeout(
    client.batchAnnotateFiles(request),
    OCR_TIMEOUT_MS,
    "Google Vision OCR timed out.",
  );

  const fileResponses = response.responses ?? [];
  const chunks: string[] = [];

  for (const fileResponse of fileResponses) {
    const imageResponses = fileResponse.responses ?? [];
    for (const imageResponse of imageResponses) {
      const text = imageResponse.fullTextAnnotation?.text ?? imageResponse.textAnnotations?.[0]?.description ?? "";
      if (text.trim()) {
        chunks.push(text);
      }
    }

    if (fileResponse.error?.message) {
      throw new ParseRouteError(fileResponse.error.message, 502);
    }
  }

  return chunks.join("\n");
}

async function runVisionPdfOcrInBatches(pdfBytes: Uint8Array): Promise<string> {
  const chunks: string[] = [];

  for (let batchIndex = 0; batchIndex < MAX_PAGED_BATCHES; batchIndex += 1) {
    const startPage = batchIndex * MAX_PAGES_PER_REQUEST + 1;
    const pages = Array.from({ length: MAX_PAGES_PER_REQUEST }, (_, index) => startPage + index);
    let text = "";
    try {
      text = await runVisionPdfOcr(pdfBytes, pages);
    } catch (error) {
      if (batchIndex > 0 && isOutOfRangePageError(error)) {
        break;
      }

      throw error;
    }

    if (!text.trim()) {
      break;
    }

    chunks.push(text);
  }

  return chunks.join("\n");
}

async function runVisionImageOcr(imageBytes: Uint8Array): Promise<string> {
  const client = getVisionClient();

  const request: protos.google.cloud.vision.v1.IBatchAnnotateImagesRequest = {
    requests: [
      {
        image: {
          content: imageBytes,
        },
        features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
      },
    ],
  };

  const [response] = await withTimeout(
    client.batchAnnotateImages(request),
    OCR_TIMEOUT_MS,
    "Google Vision OCR timed out.",
  );

  const imageResponses = response.responses ?? [];
  const chunks: string[] = [];

  for (const imageResponse of imageResponses) {
    const text =
      imageResponse.fullTextAnnotation?.text ?? imageResponse.textAnnotations?.[0]?.description ?? "";
    if (text.trim()) {
      chunks.push(text);
    }

    if (imageResponse.error?.message) {
      throw new ParseRouteError(imageResponse.error.message, 502);
    }
  }

  return chunks.join("\n");
}

function getVisionClient() {
  if (cachedVisionClient) {
    return cachedVisionClient;
  }

  const projectId = process.env.GOOGLE_PROJECT_ID?.trim() ?? "";
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim() ?? "";
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n").trim();

  if (!projectId || !clientEmail || !privateKey) {
    throw new ParseRouteError(
      "Missing Google Vision service account env vars: GOOGLE_PROJECT_ID, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY.",
      500,
    );
  }

  cachedVisionClient = new ImageAnnotatorClient({
    projectId,
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });

  return cachedVisionClient;
}

function cleanExtractedText(input: string) {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isUploadableFile(value: FormDataEntryValue | null | undefined): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    typeof (value as { arrayBuffer?: unknown }).arrayBuffer === "function" &&
    "name" in value &&
    "size" in value
  );
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt((value ?? "").trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toMb(bytes: number) {
  return Math.max(1, Math.round(bytes / (1024 * 1024)));
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeoutMs: number; timeoutMessage: string },
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(options.timeoutMessage);
  }, options.timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ParseRouteError(options.timeoutMessage, 504);
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new ParseRouteError(message, 504));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

function toErrorResponse(error: unknown) {
  if (error instanceof ParseRouteError) {
    return {
      status: error.status,
      message: error.message,
    };
  }

  if (error instanceof Error) {
    return {
      status: 500,
      message: error.message || "Failed to parse resume.",
    };
  }

  return {
    status: 500,
    message: "Failed to parse resume.",
  };
}

function isOutOfRangePageError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return /page/.test(message) && /(out of range|invalid|exceed|beyond)/.test(message);
}
