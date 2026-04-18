"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import NextImage from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  FileText,
  GraduationCap,
  Plus,
  Trash2,
  Upload,
  UserRound,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ResumeData } from "@/types/resume";

const STEPS = [
  {
    id: "personal",
    title: "Personal Information",
    description: "Identity, contact details, and profile links.",
    icon: UserRound,
  },
  {
    id: "summary",
    title: "Summary",
    description: "Write a concise and compelling professional introduction.",
    icon: FileText,
  },
  {
    id: "experience",
    title: "Experience",
    description: "Add roles and measurable impact points.",
    icon: BriefcaseBusiness,
  },
  {
    id: "education",
    title: "Education",
    description: "Add schools, degrees, and timeline details.",
    icon: GraduationCap,
  },
  {
    id: "skills",
    title: "Skills",
    description: "Group technical and domain strengths.",
    icon: Wrench,
  },
] as const;

const STEP_COUNT = STEPS.length;

const PHONE_COUNTRIES = [
  { iso2: "IN", name: "India", dialCode: "+91" },
  { iso2: "US", name: "United States", dialCode: "+1" },
  { iso2: "GB", name: "United Kingdom", dialCode: "+44" },
  { iso2: "AE", name: "United Arab Emirates", dialCode: "+971" },
  { iso2: "CA", name: "Canada", dialCode: "+1" },
  { iso2: "AU", name: "Australia", dialCode: "+61" },
  { iso2: "SG", name: "Singapore", dialCode: "+65" },
  { iso2: "SA", name: "Saudi Arabia", dialCode: "+966" },
  { iso2: "DE", name: "Germany", dialCode: "+49" },
  { iso2: "FR", name: "France", dialCode: "+33" },
  { iso2: "BR", name: "Brazil", dialCode: "+55" },
  { iso2: "JP", name: "Japan", dialCode: "+81" },
] as const;

const SORTED_PHONE_COUNTRIES = [...PHONE_COUNTRIES].sort(
  (left, right) => right.dialCode.length - left.dialCode.length,
);

function detectCountryFromPhone(phone: string) {
  const normalizedPhone = phone.trim();
  return SORTED_PHONE_COUNTRIES.find((country) => normalizedPhone.startsWith(country.dialCode));
}

function stripPhoneDialCode(phone: string) {
  const normalizedPhone = phone.trim();

  for (const country of SORTED_PHONE_COUNTRIES) {
    const escapedDial = country.dialCode.replace("+", "\\+");
    const matchDialAtStart = new RegExp(`^${escapedDial}[\\s-]*`);
    if (matchDialAtStart.test(normalizedPhone)) {
      return normalizedPhone.replace(matchDialAtStart, "").trim();
    }
  }

  return normalizedPhone;
}

function getCountryByIso(iso2: string) {
  return PHONE_COUNTRIES.find((country) => country.iso2 === iso2) ?? PHONE_COUNTRIES[0];
}

type Props = {
  data: ResumeData;
  onChange: (next: ResumeData) => void;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500/95">{children}</p>;
}

function floatingLabelClassName() {
  return "pointer-events-none absolute left-3 top-0 z-10 -translate-y-1/2 rounded-full bg-[rgba(246,251,255,0.95)] px-1 text-[10px] font-medium text-slate-600 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:px-0 peer-placeholder-shown:text-[12px] peer-placeholder-shown:text-slate-500 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:px-1 peer-focus:text-[10px] peer-focus:text-sky-700 lg:bg-white";
}

type FloatingInputProps = Omit<React.ComponentProps<"input">, "placeholder"> & {
  label: string;
  wrapperClassName?: string;
  inputClassName?: string;
};

function FloatingInput({ label, wrapperClassName, inputClassName, ...props }: FloatingInputProps) {
  return (
    <label className={cn("relative block", wrapperClassName)}>
      <Input
        {...props}
        placeholder=" "
        className={cn(
          "peer h-11 rounded-xl border border-sky-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(240,249,255,0.8)_100%)] px-3 pt-5 pb-1 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-[border-color,box-shadow,background-color] duration-200 focus-visible:border-sky-400 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-sky-100 lg:border-slate-200 lg:bg-white lg:shadow-sm",
          inputClassName,
        )}
      />
      <span className={floatingLabelClassName()}>{label}</span>
    </label>
  );
}

type FloatingTextAreaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "placeholder"> & {
  label: string;
  wrapperClassName?: string;
};

function FloatingTextArea({ label, wrapperClassName, className, ...props }: FloatingTextAreaProps) {
  return (
    <label className={cn("relative block", wrapperClassName)}>
      <textarea
        {...props}
        placeholder=" "
        className={cn(
          "peer min-h-20 w-full rounded-xl border border-sky-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(240,249,255,0.78)_100%)] px-3 pt-6 pb-2 text-sm leading-6 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-transparent focus-visible:border-sky-400 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100 lg:rounded-lg lg:border-slate-200 lg:bg-white lg:shadow-sm",
          className,
        )}
      />
      <span className="pointer-events-none absolute left-3 top-0 z-10 -translate-y-1/2 rounded-full bg-[rgba(246,251,255,0.95)] px-1 text-[10px] font-medium text-slate-600 transition-all duration-200 peer-placeholder-shown:top-3.5 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:px-0 peer-placeholder-shown:text-[12px] peer-placeholder-shown:text-slate-500 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:px-1 peer-focus:text-[10px] peer-focus:text-sky-700 lg:bg-white">
        {label}
      </span>
    </label>
  );
}

function ArrayEmptyState({
  title,
  description,
  action,
  onAction,
}: {
  title: string;
  description: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-4 text-center transition-all duration-300 ease-out hover:border-sky-200 hover:bg-sky-50/60">
      <p className="text-sm font-semibold tracking-tight text-slate-800">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
      <Button type="button" variant="outline" size="sm" className="mt-3 transition-all duration-200 hover:-translate-y-0.5" onClick={onAction}>
        <Plus className="size-3.5" />
        {action}
      </Button>
    </div>
  );
}

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });
}

async function optimizePhotoFile(file: File): Promise<string> {
  const rawUrl = await readFileAsDataUrl(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const targetImage = new Image();
    targetImage.onload = () => resolve(targetImage);
    targetImage.onerror = () => reject(new Error("Could not process the selected image."));
    targetImage.src = rawUrl;
  });

  const isCompactViewport =
    typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
  const maxEdge = isCompactViewport ? 540 : 720;
  const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    return rawUrl;
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.88);
}

function buildId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function ResumeEditorComponent({ data, onChange }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [phoneCountryIso, setPhoneCountryIso] = useState(() => {
    const detectedCountry = detectCountryFromPhone(data.personal.phone);
    return detectedCountry?.iso2 ?? "IN";
  });

  const currentStepMeta = STEPS[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / STEP_COUNT) * 100);

  const setPersonal = useCallback(
    (patch: Partial<ResumeData["personal"]>) => {
      onChange({ ...data, personal: { ...data.personal, ...patch } });
    },
    [data, onChange],
  );

  const setSummary = useCallback(
    (summary: string) => {
      onChange({ ...data, summary });
    },
    [data, onChange],
  );

  useEffect(() => {
    const detectedCountry = detectCountryFromPhone(data.personal.phone);
    if (detectedCountry && detectedCountry.iso2 !== phoneCountryIso) {
      setPhoneCountryIso(detectedCountry.iso2);
    }
  }, [data.personal.phone, phoneCountryIso]);

  const updatePhoneCountry = useCallback(
    (nextIso: string) => {
      const selectedCountry = getCountryByIso(nextIso);
      const localPhoneNumber = stripPhoneDialCode(data.personal.phone);
      const formattedPhone = localPhoneNumber
        ? `${selectedCountry.dialCode} ${localPhoneNumber}`
        : `${selectedCountry.dialCode} `;

      setPhoneCountryIso(selectedCountry.iso2);
      setPersonal({ phone: formattedPhone });
    },
    [data.personal.phone, setPersonal],
  );

  const addLink = useCallback(() => {
    setPersonal({ links: [...data.personal.links, { label: "", url: "" }] });
  }, [data.personal.links, setPersonal]);

  const updateLink = useCallback(
    (index: number, patch: Partial<ResumeData["personal"]["links"][number]>) => {
      const links = [...data.personal.links];
      links[index] = { ...links[index], ...patch };
      setPersonal({ links });
    },
    [data.personal.links, setPersonal],
  );

  const removeLink = useCallback(
    (index: number) => {
      setPersonal({ links: data.personal.links.filter((_, itemIndex) => itemIndex !== index) });
    },
    [data.personal.links, setPersonal],
  );

  const handlePhotoUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file || !file.type.startsWith("image/")) {
        return;
      }

      try {
        const photoUrl = await optimizePhotoFile(file);
        setPersonal({ photoUrl });
      } catch {
        toast.error("Could not process the selected image.");
      }
    },
    [setPersonal],
  );

  const addExperience = useCallback(() => {
    onChange({
      ...data,
      experience: [
        ...data.experience,
        {
          id: buildId(),
          company: "",
          role: "",
          start: "",
          end: "",
          bullets: [""],
        },
      ],
    });
  }, [data, onChange]);

  const updateExperience = useCallback(
    (index: number, patch: Partial<ResumeData["experience"][number]>) => {
      const next = [...data.experience];
      next[index] = { ...next[index], ...patch };
      onChange({ ...data, experience: next });
    },
    [data, onChange],
  );

  const removeExperience = useCallback(
    (index: number) => {
      onChange({
        ...data,
        experience: data.experience.filter((_, itemIndex) => itemIndex !== index),
      });
    },
    [data, onChange],
  );

  const addBullet = useCallback(
    (experienceIndex: number) => {
      const next = [...data.experience];
      next[experienceIndex] = {
        ...next[experienceIndex],
        bullets: [...next[experienceIndex].bullets, ""],
      };
      onChange({ ...data, experience: next });
    },
    [data, onChange],
  );

  const updateBullet = useCallback(
    (experienceIndex: number, bulletIndex: number, value: string) => {
      const next = [...data.experience];
      const bullets = [...next[experienceIndex].bullets];
      bullets[bulletIndex] = value;
      next[experienceIndex] = { ...next[experienceIndex], bullets };
      onChange({ ...data, experience: next });
    },
    [data, onChange],
  );

  const removeBullet = useCallback(
    (experienceIndex: number, bulletIndex: number) => {
      const next = [...data.experience];
      next[experienceIndex] = {
        ...next[experienceIndex],
        bullets: next[experienceIndex].bullets.filter((_, itemIndex) => itemIndex !== bulletIndex),
      };
      onChange({ ...data, experience: next });
    },
    [data, onChange],
  );

  const addEducation = useCallback(() => {
    onChange({
      ...data,
      education: [
        ...data.education,
        {
          id: buildId(),
          school: "",
          degree: "",
          start: "",
          end: "",
        },
      ],
    });
  }, [data, onChange]);

  const updateEducation = useCallback(
    (index: number, patch: Partial<ResumeData["education"][number]>) => {
      const next = [...data.education];
      next[index] = { ...next[index], ...patch };
      onChange({ ...data, education: next });
    },
    [data, onChange],
  );

  const removeEducation = useCallback(
    (index: number) => {
      onChange({
        ...data,
        education: data.education.filter((_, itemIndex) => itemIndex !== index),
      });
    },
    [data, onChange],
  );

  const addSkillCategory = useCallback(() => {
    onChange({
      ...data,
      skills: [...data.skills, { id: buildId(), category: "", items: [""] }],
    });
  }, [data, onChange]);

  const updateSkillCategory = useCallback(
    (index: number, patch: Partial<ResumeData["skills"][number]>) => {
      const next = [...data.skills];
      next[index] = { ...next[index], ...patch };
      onChange({ ...data, skills: next });
    },
    [data, onChange],
  );

  const removeSkillCategory = useCallback(
    (index: number) => {
      onChange({ ...data, skills: data.skills.filter((_, itemIndex) => itemIndex !== index) });
    },
    [data, onChange],
  );

  const addSkillItem = useCallback(
    (categoryIndex: number) => {
      const next = [...data.skills];
      next[categoryIndex] = {
        ...next[categoryIndex],
        items: [...next[categoryIndex].items, ""],
      };
      onChange({ ...data, skills: next });
    },
    [data, onChange],
  );

  const updateSkillItem = useCallback(
    (categoryIndex: number, itemIndex: number, value: string) => {
      const next = [...data.skills];
      const items = [...next[categoryIndex].items];
      items[itemIndex] = value;
      next[categoryIndex] = { ...next[categoryIndex], items };
      onChange({ ...data, skills: next });
    },
    [data, onChange],
  );

  const removeSkillItem = useCallback(
    (categoryIndex: number, itemIndex: number) => {
      const next = [...data.skills];
      next[categoryIndex] = {
        ...next[categoryIndex],
        items: next[categoryIndex].items.filter((_, index) => index !== itemIndex),
      };
      onChange({ ...data, skills: next });
    },
    [data, onChange],
  );

  const validateStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex === 0) {
        if (!data.personal.fullName.trim()) {
          return "Full name is required before moving forward.";
        }
        if (!data.personal.email.trim()) {
          return "Email is required before moving forward.";
        }
      }

      if (stepIndex === 1) {
        if (!data.summary.trim()) {
          return "Add a summary before moving forward.";
        }
      }

      if (stepIndex === 2) {
        if (data.experience.length === 0) {
          return "Add at least one experience entry.";
        }
        const hasInvalidExperience = data.experience.some(
          (job) => !job.role.trim() || !job.company.trim(),
        );
        if (hasInvalidExperience) {
          return "Each experience entry needs both role and company.";
        }
      }

      if (stepIndex === 3) {
        if (data.education.length === 0) {
          return "Add at least one education entry.";
        }
        const hasInvalidEducation = data.education.some(
          (entry) => !entry.school.trim() || !entry.degree.trim(),
        );
        if (hasInvalidEducation) {
          return "Each education entry needs both school and degree.";
        }
      }

      if (stepIndex === 4) {
        if (data.skills.length === 0) {
          return "Add at least one skill category.";
        }
        const hasInvalidSkillCategory = data.skills.some(
          (category) =>
            !category.category.trim() || !category.items.some((item) => item.trim().length > 0),
        );
        if (hasInvalidSkillCategory) {
          return "Each skill category needs a name and at least one skill item.";
        }
      }

      return null;
    },
    [data],
  );

  const goNext = useCallback(() => {
    const validationError = validateStep(currentStep);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (currentStep >= STEP_COUNT - 1) {
      toast.success("All sections complete. Review your preview and download.");
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, STEP_COUNT - 1));
  }, [currentStep, validateStep]);

  const goBack = useCallback(() => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }, []);

  const goToCompletedStep = useCallback((stepIndex: number) => {
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  }, [currentStep]);

  const stepContent = useMemo(() => {
    if (currentStep === 0) {
      return (
        <div className="space-y-3">
          <div className="grid gap-3 xl:grid-cols-[108px_minmax(0,1fr)]">
            <div className="mx-auto w-28 space-y-2 sm:mx-0 sm:w-[108px] xl:w-full">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                {data.personal.photoUrl ? (
                  <div className="relative aspect-square w-full">
                    <NextImage
                      src={data.personal.photoUrl}
                      alt="Profile"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-square items-center justify-center text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                    No photo
                  </div>
                )}
              </div>
              <label className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[11px] font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50">
                <Upload className="size-3.5" />
                Upload
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={(event) => {
                    void handlePhotoUpload(event);
                  }}
                />
              </label>
              {data.personal.photoUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setPersonal({ photoUrl: "" })}
                >
                  <Trash2 className="size-3.5" />
                  Remove photo
                </Button>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <FloatingInput
                label="Full Name"
                wrapperClassName="sm:col-span-2"
                value={data.personal.fullName}
                onChange={(event) => setPersonal({ fullName: event.target.value })}
              />

              <FloatingInput
                type="email"
                label="Email"
                value={data.personal.email}
                onChange={(event) => setPersonal({ email: event.target.value })}
              />

              <div className="grid grid-cols-[minmax(118px,0.64fr)_minmax(0,1fr)] gap-2 sm:grid-cols-[minmax(130px,0.52fr)_minmax(0,1fr)]">
                <label className="relative block">
                  <select
                    value={phoneCountryIso}
                    onChange={(event) => updatePhoneCountry(event.target.value)}
                    className="peer h-11 w-full appearance-none rounded-xl border border-sky-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(240,249,255,0.84)_100%)] px-2.5 pt-5 pb-1 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition-[border-color,box-shadow,background-color] duration-200 focus-visible:border-sky-400 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-sky-100 lg:border-slate-200 lg:bg-white lg:shadow-sm"
                  >
                    {PHONE_COUNTRIES.map((country) => (
                      <option key={country.iso2} value={country.iso2}>
                        {country.iso2} {country.dialCode}
                      </option>
                    ))}
                  </select>
                  <span className={floatingLabelClassName()}>Country</span>
                </label>

                <FloatingInput
                  type="tel"
                  label="Phone"
                  value={data.personal.phone}
                  onChange={(event) => setPersonal({ phone: event.target.value })}
                />
              </div>

              <FloatingInput
                label="Location"
                wrapperClassName="sm:col-span-2"
                value={data.personal.location}
                onChange={(event) => setPersonal({ location: event.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <SectionLabel>Links</SectionLabel>
              <Button type="button" variant="ghost" size="sm" onClick={addLink}>
                <Plus className="size-3.5" />
                Add Link
              </Button>
            </div>

            {data.personal.links.length === 0 ? (
              <ArrayEmptyState
                title="No links added"
                description="Add portfolio, GitHub, LinkedIn, or other relevant URLs."
                action="Add first link"
                onAction={addLink}
              />
            ) : (
              <div className="space-y-1.5">
                {data.personal.links.map((link, index) => (
                  <div
                    key={`${link.label}-${index}`}
                    className="grid items-center gap-1.5 rounded-lg border border-sky-200/80 bg-sky-50/70 p-2 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.45fr)_auto] lg:border-slate-200 lg:bg-slate-50/90"
                  >
                    <FloatingInput
                      label="Label"
                      value={link.label}
                      onChange={(event) => updateLink(index, { label: event.target.value })}
                      inputClassName="h-10"
                    />
                    <FloatingInput
                      label="URL"
                      value={link.url}
                      onChange={(event) => updateLink(index, { url: event.target.value })}
                      inputClassName="h-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 justify-center self-center p-0 text-slate-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => removeLink(index)}
                    >
                      <Trash2 className="size-3.5" />
                      <span className="sr-only">Remove link</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="space-y-1.5">
          <FloatingTextArea
            label="Professional Summary"
            rows={5}
            value={data.summary}
            onChange={(event) => setSummary(event.target.value)}
          />
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-end">
            <Button type="button" variant="outline" size="sm" onClick={addExperience}>
              <Plus className="size-3.5" />
              Add Role
            </Button>
          </div>

          {data.experience.length === 0 ? (
            <ArrayEmptyState
              title="No experience yet"
              description="Add your first role to start building a stronger resume narrative."
              action="Add role"
              onAction={addExperience}
            />
          ) : (
            <div className="space-y-3">
              {data.experience.map((job, experienceIndex) => (
                <div
                  key={job.id ?? `experience-${experienceIndex}`}
                  className="space-y-2.5 rounded-xl border border-sky-200/80 bg-sky-50/70 p-3 lg:border-slate-200 lg:bg-slate-50/85"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold tracking-tight text-slate-800">
                      Role {experienceIndex + 1}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-slate-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => removeExperience(experienceIndex)}
                    >
                      <Trash2 className="size-3.5" />
                      Remove Role
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <FloatingInput
                      label="Role"
                      wrapperClassName="sm:col-span-2"
                      value={job.role}
                      onChange={(event) => updateExperience(experienceIndex, { role: event.target.value })}
                    />
                    <FloatingInput
                      label="Company"
                      wrapperClassName="sm:col-span-2"
                      value={job.company}
                      onChange={(event) => updateExperience(experienceIndex, { company: event.target.value })}
                    />
                    <FloatingInput
                      label="Start"
                      value={job.start}
                      onChange={(event) => updateExperience(experienceIndex, { start: event.target.value })}
                    />
                    <FloatingInput
                      label="End"
                      value={job.end}
                      onChange={(event) => updateExperience(experienceIndex, { end: event.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <SectionLabel>Bullet Points</SectionLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addBullet(experienceIndex)}
                      >
                        <Plus className="size-3.5" />
                        Add Bullet
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {job.bullets.map((bullet, bulletIndex) => (
                        <div key={`${job.id ?? experienceIndex}-bullet-${bulletIndex}`} className="grid gap-1.5 sm:grid-cols-[minmax(0,1fr)_auto]">
                          <FloatingTextArea
                            label="Bullet Point"
                            rows={2}
                            value={bullet}
                            onChange={(event) => updateBullet(experienceIndex, bulletIndex, event.target.value)}
                            className="min-h-16 rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="sm:self-start text-slate-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => removeBullet(experienceIndex, bulletIndex)}
                          >
                            <Trash2 className="size-3.5" />
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (currentStep === 3) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-end">
            <Button type="button" variant="outline" size="sm" onClick={addEducation}>
              <Plus className="size-3.5" />
              Add School
            </Button>
          </div>

          {data.education.length === 0 ? (
            <ArrayEmptyState
              title="No education added"
              description="Add your most relevant academic credentials."
              action="Add school"
              onAction={addEducation}
            />
          ) : (
            <div className="space-y-3">
              {data.education.map((entry, educationIndex) => (
                <div
                  key={entry.id ?? `education-${educationIndex}`}
                  className="space-y-2.5 rounded-xl border border-sky-200/80 bg-sky-50/70 p-3 lg:border-slate-200 lg:bg-slate-50/85"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold tracking-tight text-slate-800">
                      Education {educationIndex + 1}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-slate-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => removeEducation(educationIndex)}
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <FloatingInput
                      label="School"
                      wrapperClassName="sm:col-span-2"
                      value={entry.school}
                      onChange={(event) => updateEducation(educationIndex, { school: event.target.value })}
                    />
                    <FloatingInput
                      label="Degree / Field"
                      wrapperClassName="sm:col-span-2"
                      value={entry.degree}
                      onChange={(event) => updateEducation(educationIndex, { degree: event.target.value })}
                    />
                    <FloatingInput
                      label="Start"
                      value={entry.start}
                      onChange={(event) => updateEducation(educationIndex, { start: event.target.value })}
                    />
                    <FloatingInput
                      label="End"
                      value={entry.end}
                      onChange={(event) => updateEducation(educationIndex, { end: event.target.value })}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-end">
          <Button type="button" variant="outline" size="sm" onClick={addSkillCategory}>
            <Plus className="size-3.5" />
            Add Category
          </Button>
        </div>

        {data.skills.length === 0 ? (
          <ArrayEmptyState
            title="No skills listed"
            description="Create categories like Frontend, Backend, Tools, or Design."
            action="Add category"
            onAction={addSkillCategory}
          />
        ) : (
          <div className="space-y-3">
            {data.skills.map((category, categoryIndex) => (
              <div
                key={category.id ?? `skills-${categoryIndex}`}
                className="space-y-2.5 rounded-xl border border-sky-200/80 bg-sky-50/70 p-3 lg:border-slate-200 lg:bg-slate-50/85"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold tracking-tight text-slate-800">
                    Skill Group {categoryIndex + 1}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => removeSkillCategory(categoryIndex)}
                  >
                    <Trash2 className="size-3.5" />
                    Remove
                  </Button>
                </div>

                <FloatingInput
                  label="Category"
                  value={category.category}
                  onChange={(event) => updateSkillCategory(categoryIndex, { category: event.target.value })}
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <SectionLabel>Items</SectionLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addSkillItem(categoryIndex)}
                    >
                      <Plus className="size-3.5" />
                      Add Skill
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <div
                        key={`${category.id ?? categoryIndex}-item-${itemIndex}`}
                        className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
                      >
                        <FloatingInput
                          label="Skill"
                          value={item}
                          onChange={(event) => updateSkillItem(categoryIndex, itemIndex, event.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="sm:self-center text-slate-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => removeSkillItem(categoryIndex, itemIndex)}
                        >
                          <Trash2 className="size-3.5" />
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }, [
    addBullet,
    addEducation,
    addExperience,
    addLink,
    addSkillCategory,
    addSkillItem,
    currentStep,
    data.education,
    data.experience,
    data.personal,
    data.skills,
    data.summary,
    handlePhotoUpload,
    phoneCountryIso,
    removeBullet,
    removeEducation,
    removeExperience,
    removeLink,
    removeSkillCategory,
    removeSkillItem,
    setPersonal,
    setSummary,
    updateBullet,
    updateEducation,
    updateExperience,
    updateLink,
    updatePhoneCountry,
    updateSkillCategory,
    updateSkillItem,
  ]);

  return (
    <div className="space-y-3 pb-5 [&_[data-slot=button][data-size=sm]]:h-9 [&_[data-slot=button][data-size=sm]]:px-3 [&_[data-slot=button][data-size=sm]]:text-[12px] lg:[&_[data-slot=button][data-size=sm]]:h-7 lg:[&_[data-slot=button][data-size=sm]]:px-2.5 lg:[&_[data-slot=button][data-size=sm]]:text-[0.8rem] [&_[data-slot=input]]:border-sky-200/90 [&_[data-slot=input]]:bg-sky-50/70 [&_[data-slot=input]]:shadow-[inset_0_1px_0_rgba(255,255,255,0.88)] [&_[data-slot=input]]:focus-visible:border-sky-400 [&_[data-slot=input]]:focus-visible:ring-sky-100 [&_textarea]:border-sky-200/90 [&_textarea]:bg-sky-50/70 [&_textarea]:shadow-[inset_0_1px_0_rgba(255,255,255,0.88)] [&_textarea]:focus-visible:border-sky-400 [&_textarea]:focus-visible:ring-sky-100 lg:[&_[data-slot=input]]:border-slate-200 lg:[&_[data-slot=input]]:bg-white lg:[&_[data-slot=input]]:shadow-none lg:[&_textarea]:border-slate-200 lg:[&_textarea]:bg-white lg:[&_textarea]:shadow-sm">
      <section className="rounded-2xl border border-sky-200/80 bg-[linear-gradient(140deg,rgba(240,249,255,0.86)_0%,rgba(250,252,255,0.96)_62%,rgba(236,254,255,0.84)_100%)] p-3.5 shadow-[0_18px_40px_-34px_rgba(14,116,144,0.45)] lg:border-slate-200/90 lg:bg-slate-50/85 lg:shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Step {currentStep + 1} of {STEP_COUNT}
          </p>
          <p className="text-[11px] font-semibold text-slate-600">{progressPercent}%</p>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-600 to-cyan-500 transition-[width] duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {STEPS.map((step, index) => {
            const isDone = index < currentStep;
            const isCurrent = index === currentStep;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => goToCompletedStep(index)}
                className={`h-9 rounded-lg border text-center text-[10px] font-semibold transition ${
                  isCurrent
                    ? "border-sky-300 bg-sky-50 text-sky-700"
                    : isDone
                      ? "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      : "cursor-not-allowed border-slate-100 bg-slate-50/60 text-slate-400"
                }`}
                aria-current={isCurrent ? "step" : undefined}
                disabled={!isDone && !isCurrent}
                title={step.title}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-sky-200/80 bg-[linear-gradient(150deg,rgba(255,255,255,0.96)_0%,rgba(240,249,255,0.72)_100%)] p-4 shadow-[0_20px_46px_-34px_rgba(14,116,144,0.5)] lg:border-slate-200 lg:bg-white lg:shadow-[0_18px_44px_-36px_rgba(15,23,42,0.68)]">
        <div className="mb-4 flex items-start gap-2.5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700">
            <currentStepMeta.icon className="size-4" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">{currentStepMeta.title}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{currentStepMeta.description}</p>
          </div>
        </div>

        {stepContent}
      </section>

      <section className="rounded-2xl border border-sky-200/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.95)_0%,rgba(236,254,255,0.72)_100%)] p-2.5 shadow-[0_16px_36px_-34px_rgba(14,116,144,0.5)] lg:border-slate-200 lg:bg-white/90 lg:shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={currentStep === 0}
            className="h-10 min-w-24 rounded-xl"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>

          <p className="hidden text-xs font-medium text-slate-500 sm:block">
            {currentStep < STEP_COUNT - 1 ? `Up next: ${STEPS[currentStep + 1].title}` : "Final step"}
          </p>

          <Button
            type="button"
            onClick={goNext}
            className="h-10 min-w-24 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
          >
            {currentStep === STEP_COUNT - 1 ? "Finish" : "Next"}
            {currentStep < STEP_COUNT - 1 ? <ArrowRight className="size-4" /> : null}
          </Button>
        </div>
      </section>
    </div>
  );
}

export const ResumeEditor = memo(ResumeEditorComponent);
