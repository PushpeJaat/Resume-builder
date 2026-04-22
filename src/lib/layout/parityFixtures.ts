import type { ResumeData } from "@/types/resume";

export type ParityFixture = {
  id: string;
  label: string;
  data: ResumeData;
};

type FixtureSpec = {
  id: string;
  label: string;
  summaryRepeats: number;
  experienceCount: number;
  bulletsPerExperience: number;
  educationCount: number;
  skillGroupCount: number;
  skillItemsPerGroup: number;
};

const BASE_SUMMARY_SENTENCE =
  "Senior product designer with strong ownership across discovery, interaction design, and launch execution for complex enterprise workflows.";

const BASE_BULLET_SENTENCE =
  "Drove a measurable product outcome through close collaboration with engineering, analytics, and customer success stakeholders.";

function repeatSentence(sentence: string, count: number): string {
  return Array.from({ length: count }, () => sentence).join(" ");
}

function createFixture(spec: FixtureSpec): ParityFixture {
  const experience = Array.from({ length: spec.experienceCount }, (_, index) => ({
    id: `${spec.id}-exp-${index + 1}`,
    company: `Example Company ${index + 1}`,
    role: `Product Designer ${index + 1}`,
    start: `${2013 + index}`,
    end: `${2014 + index}`,
    bullets: Array.from({ length: spec.bulletsPerExperience }, (_, bulletIndex) => {
      return `${BASE_BULLET_SENTENCE} Focus area ${index + 1}.${bulletIndex + 1}.`;
    }),
  }));

  const education = Array.from({ length: spec.educationCount }, (_, index) => ({
    id: `${spec.id}-edu-${index + 1}`,
    school: `Design Institute ${index + 1}`,
    degree: `Bachelors in Visual Communication ${index + 1}`,
    start: `${2008 + index}`,
    end: `${2012 + index}`,
  }));

  const skills = Array.from({ length: spec.skillGroupCount }, (_, groupIndex) => ({
    id: `${spec.id}-skill-${groupIndex + 1}`,
    category: `Skill Group ${groupIndex + 1}`,
    items: Array.from({ length: spec.skillItemsPerGroup }, (_, itemIndex) => {
      return `Skill-${groupIndex + 1}-${itemIndex + 1}`;
    }),
  }));

  return {
    id: spec.id,
    label: spec.label,
    data: {
      personal: {
        fullName: "Alexandra Reid",
        email: "alex.reid@example.com",
        phone: "+1 (415) 555-0192",
        location: "San Francisco, CA",
        photoUrl: "",
        links: [
          { label: "LinkedIn", url: "https://linkedin.com/in/alexreid" },
          { label: "Portfolio", url: "https://alexreid.design" },
        ],
      },
      summary: repeatSentence(BASE_SUMMARY_SENTENCE, spec.summaryRepeats),
      experience,
      education,
      skills,
    },
  };
}

export const PARITY_FIXTURES: ParityFixture[] = [
  createFixture({
    id: "fixture-1-page",
    label: "Compact profile fixture",
    summaryRepeats: 1,
    experienceCount: 2,
    bulletsPerExperience: 2,
    educationCount: 1,
    skillGroupCount: 2,
    skillItemsPerGroup: 3,
  }),
  createFixture({
    id: "fixture-2-page",
    label: "Mid-length fixture",
    summaryRepeats: 2,
    experienceCount: 6,
    bulletsPerExperience: 5,
    educationCount: 2,
    skillGroupCount: 4,
    skillItemsPerGroup: 5,
  }),
  createFixture({
    id: "fixture-3-page",
    label: "Long-form fixture",
    summaryRepeats: 3,
    experienceCount: 10,
    bulletsPerExperience: 7,
    educationCount: 3,
    skillGroupCount: 5,
    skillItemsPerGroup: 8,
  }),
];
