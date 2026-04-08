import { z } from "zod";

export const linkSchema = z.object({
  label: z.string(),
  url: z.string(),
});

export const experienceSchema = z.object({
  id: z.string().optional(),
  company: z.string(),
  role: z.string(),
  start: z.string(),
  end: z.string(),
  bullets: z.array(z.string()),
});

export const educationSchema = z.object({
  id: z.string().optional(),
  school: z.string(),
  degree: z.string(),
  start: z.string(),
  end: z.string(),
});

export const skillCategorySchema = z.object({
  id: z.string().optional(),
  category: z.string(),
  items: z.array(z.string()),
});

export const resumeDataSchema = z.object({
  personal: z.object({
    fullName: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    photoUrl: z.string().default(""),
    links: z.array(linkSchema),
  }),
  summary: z.string(),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  skills: z.array(skillCategorySchema),
});

export type ResumeData = z.infer<typeof resumeDataSchema>;

export function emptyResumeData(): ResumeData {
  return {
    personal: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      photoUrl: "",
      links: [],
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
  };
}
