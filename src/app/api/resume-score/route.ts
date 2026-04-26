import { scoreResume } from "@/lib/server/resume-scoring";
import {
  apiSuccess,
  badRequestError,
  internalServerError,
  unprocessableEntityError,
} from "@/lib/api-response";

const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = new Set(["pdf", "doc", "docx", "txt"]);
const SUPPORTED_MIME_SNIPPETS = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

function isSupportedResumeFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mime = (file.type || "").toLowerCase();
  return SUPPORTED_EXTENSIONS.has(extension) || SUPPORTED_MIME_SNIPPETS.some((item) => mime.includes(item));
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return badRequestError("Invalid upload payload.");
    }

    const file = formData.get("resume");
    if (!(file instanceof File)) {
      return badRequestError("No file uploaded.");
    }

    if (file.size === 0) {
      return badRequestError("Uploaded file is empty.");
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return badRequestError("Resume must be 6 MB or smaller.");
    }

    if (!isSupportedResumeFile(file)) {
      return badRequestError("Unsupported file type. Upload PDF, DOC, DOCX, or TXT.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const text = new TextDecoder("utf-8").decode(arrayBuffer);

    if (!text.trim()) {
      return unprocessableEntityError("Could not extract readable text from this file. Try a text-based PDF or DOCX.");
    }

    const { score, feedback } = await scoreResume(text);
    return apiSuccess({ score, feedback }, { code: "RESUME_SCORED" });
  } catch (error) {
    console.error("resume-score: failed to score resume", error);
    return internalServerError("Unable to score resume right now. Please try again in a moment.");
  }
}
