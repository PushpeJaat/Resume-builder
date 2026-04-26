import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  conflictError,
  internalServerError,
  validationError,
} from "@/lib/api-response";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().max(120).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return validationError(parsed.error.flatten(), "Invalid registration payload.");
    }
    const { email, password, name } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return conflictError("An account with this email already exists.");
    }
    const passwordHash = await hash(password, 12);
    await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: name?.trim() || null,
      },
    });
    return apiSuccess({}, { code: "USER_REGISTERED" });
  } catch {
    return internalServerError("Registration failed.");
  }
}
