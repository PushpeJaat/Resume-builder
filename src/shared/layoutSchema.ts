import { z } from "zod";

export const FONT_FAMILY = "NotoSans" as const;
export const FONT_WEIGHT_VALUES = ["normal", "bold"] as const;

export const hexColorSchema = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Color must be a hex code.");

export const resumePageSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
});

export const textElementSchema = z.object({
  type: z.literal("text"),
  id: z.string().min(1),
  pageIndex: z.number().int().nonnegative().default(0),
  x: z.number().min(0),
  y: z.number().min(0),
  width: z.number().positive(),
  content: z.string(),
  fontSize: z.number().positive(),
  lineHeight: z.number().positive().default(1.3),
  fontFamily: z.string().default(FONT_FAMILY),
  fontWeight: z.enum(FONT_WEIGHT_VALUES).default("normal"),
  color: hexColorSchema.default("#111827"),
  letterSpacing: z.number().default(0),
});

export const imageFitSchema = z.enum(["cover", "contain", "fill"]).default("cover");

export const imageElementSchema = z.object({
  type: z.literal("image"),
  id: z.string().min(1),
  pageIndex: z.number().int().nonnegative().default(0),
  x: z.number().min(0),
  y: z.number().min(0),
  width: z.number().positive(),
  height: z.number().positive(),
  src: z.string().min(1),
  fit: imageFitSchema,
});

export const lineElementSchema = z.object({
  type: z.literal("line"),
  id: z.string().min(1),
  pageIndex: z.number().int().nonnegative().default(0),
  x: z.number().min(0),
  y: z.number().min(0),
  width: z.number().positive(),
  strokeWidth: z.number().positive().default(1),
  color: hexColorSchema.default("#d1d5db"),
});

export const resumeElementSchema = z.discriminatedUnion("type", [
  textElementSchema,
  imageElementSchema,
  lineElementSchema,
]);

export const resumeLayoutSchema = z.object({
  page: resumePageSchema,
  elements: z.array(resumeElementSchema),
});

export type ResumePage = z.infer<typeof resumePageSchema>;
export type TextElement = z.infer<typeof textElementSchema>;
export type ImageElement = z.infer<typeof imageElementSchema>;
export type LineElement = z.infer<typeof lineElementSchema>;
export type ResumeElement = z.infer<typeof resumeElementSchema>;
export type ResumeLayout = z.infer<typeof resumeLayoutSchema>;

export const A4_PAGE: ResumePage = {
  width: 595,
  height: 842,
};
