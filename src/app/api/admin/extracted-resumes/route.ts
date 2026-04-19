import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await prisma.extractedResume.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({
    extracted_resumes: rows.map((row) => {
      const record = asRecord(row.extractedData);
      const personal = asRecord(record.personalInfo ?? record.personal ?? record.contact ?? record.basics);

      const fullName = readTextFromRecords([personal, record], ["fullName", "full_name", "name"]);
      const email = readTextFromRecords([personal, record], ["email", "emailAddress", "mail"]);
      const phone = readTextFromRecords([personal, record], ["phone", "phoneNumber", "mobile", "contactNumber"]);
      const summary = readTextFromRecords([record, personal], [
        "summary",
        "professionalSummary",
        "profile",
        "objective",
      ]);

      return {
        id: row.id,
        source_file_name: row.sourceFileName,
        created_at: row.createdAt.toISOString(),
        created_at_readable: formatReadableDate(row.createdAt),
        full_name: fullName,
        email,
        phone,
        summary_preview: truncate(summary, 200),
      };
    }),
  });
}

function formatReadableDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: true,
  }).format(value);
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}...`;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function toText(value: unknown) {
  if (typeof value === "string") {
    return value.replace(/\s+/g, " ").trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return "";
}

function readTextFromRecords(records: Array<Record<string, unknown>>, keys: string[]) {
  for (const record of records) {
    for (const key of keys) {
      const value = toText(record[key]);
      if (value) {
        return value;
      }
    }
  }

  return "";
}
