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

export function demoResumeData(): ResumeData {
  return {
    personal: {
      fullName: "Aarav Mehta",
      email: "aarav.mehta@protonmail.com",
      phone: "+1 (646) 555-0187",
      location: "New York, NY",
      photoUrl: "",
      links: [
        { label: "LinkedIn", url: "https://linkedin.com/in/aaravmehta" },
        { label: "GitHub", url: "https://github.com/aaravmehta" },
        { label: "Portfolio", url: "https://aaravmehta.design" },
      ],
    },
    summary:
      "Product designer with 7+ years building SaaS workflows for growth-stage teams. Experienced in turning complex user journeys into clear, conversion-friendly interfaces. Strong partner to product and engineering with a focus on measurable impact, accessibility, and design systems.",
    experience: [
      {
        id: "demo-exp-1",
        company: "Notion Labs",
        role: "Senior Product Designer",
        start: "2022",
        end: "Present",
        bullets: [
          "Led redesign of admin settings and permissions, reducing setup time by 31%.",
          "Built reusable component patterns adopted by 6 squads across web and mobile.",
          "Partnered with PM and analytics to improve onboarding activation from 42% to 57%.",
        ],
      },
      {
        id: "demo-exp-2",
        company: "Figma",
        role: "Product Designer",
        start: "2019",
        end: "2022",
        bullets: [
          "Designed collaboration features for enterprise workspaces used by 40k+ teams.",
          "Improved handoff workflow, cutting design-to-dev clarification cycles by 23%.",
          "Ran usability studies and synthesized findings into quarterly roadmap priorities.",
        ],
      },
      {
        id: "demo-exp-3",
        company: "Airbnb",
        role: "UX Designer",
        start: "2017",
        end: "2019",
        bullets: [
          "Redesigned host onboarding flow and reduced first-week drop-off by 28%.",
          "Created a reusable research repository to align design decisions across teams.",
        ],
      },
    ],
    education: [
      {
        id: "demo-edu-1",
        school: "Rhode Island School of Design",
        degree: "BFA, Graphic Design",
        start: "2013",
        end: "2017",
      },
    ],
    skills: [
      {
        id: "demo-skill-1",
        category: "Design",
        items: ["Product Design", "Design Systems", "Prototyping", "Interaction Design"],
      },
      {
        id: "demo-skill-2",
        category: "Tools",
        items: ["Figma", "Framer", "FigJam", "Notion"],
      },
      {
        id: "demo-skill-3",
        category: "Collaboration",
        items: ["User Research", "A/B Testing", "Cross-functional Leadership"],
      },
    ],
  };
}

export function isResumeDataEmpty(data: ResumeData): boolean {
  const noPersonalCore =
    !data.personal.fullName.trim() &&
    !data.personal.email.trim() &&
    !data.personal.phone.trim() &&
    !data.personal.location.trim() &&
    !data.personal.photoUrl.trim() &&
    data.personal.links.length === 0;

  return (
    noPersonalCore &&
    !data.summary.trim() &&
    data.experience.length === 0 &&
    data.education.length === 0 &&
    data.skills.length === 0
  );
}
