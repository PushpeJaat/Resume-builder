"use client";

import { useRef } from "react";
import NextImage from "next/image";
import type { ResumeData } from "@/types/resume";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-sky-500/30 transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 ${props.className ?? ""}`}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-sky-500/30 transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 ${props.className ?? ""}`}
    />
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
    const nextImage = new Image();
    nextImage.onload = () => resolve(nextImage);
    nextImage.onerror = () => reject(new Error("Could not process the selected image."));
    nextImage.src = rawUrl;
  });

  const maxEdge = 640;
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
  return canvas.toDataURL("image/jpeg", 0.86);
}

const SECTIONS = [
  { id: "personal", label: "Personal Info", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { id: "summary", label: "Summary", icon: "M4 6h16M4 12h16M4 18h7" },
  { id: "experience", label: "Experience", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { id: "education", label: "Education", icon: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" },
  { id: "skills", label: "Skills", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
] as const;

type Props = {
  data: ResumeData;
  onChange: (next: ResumeData) => void;
};

export function ResumeEditor({ data, onChange }: Props) {
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const scrollToSection = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const setPersonal = (patch: Partial<ResumeData["personal"]>) => {
    onChange({ ...data, personal: { ...data.personal, ...patch } });
  };

  const addLink = () => {
    setPersonal({
      links: [...data.personal.links, { label: "", url: "" }],
    });
  };

  const updateLink = (i: number, patch: Partial<(typeof data.personal.links)[0]>) => {
    const links = [...data.personal.links];
    links[i] = { ...links[i], ...patch };
    setPersonal({ links });
  };

  const removeLink = (i: number) => {
    setPersonal({ links: data.personal.links.filter((_, j) => j !== i) });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const photoUrl = await optimizePhotoFile(file);
    setPersonal({ photoUrl });
  };

  const addExperience = () => {
    onChange({
      ...data,
      experience: [
        ...data.experience,
        {
          id: crypto.randomUUID(),
          company: "",
          role: "",
          start: "",
          end: "",
          bullets: [""],
        },
      ],
    });
  };

  const updateExp = (i: number, patch: Partial<(typeof data.experience)[0]>) => {
    const experience = [...data.experience];
    experience[i] = { ...experience[i], ...patch };
    onChange({ ...data, experience });
  };

  const removeExp = (i: number) => {
    onChange({ ...data, experience: data.experience.filter((_, j) => j !== i) });
  };

  const addBullet = (ei: number) => {
    const experience = [...data.experience];
    experience[ei] = {
      ...experience[ei],
      bullets: [...experience[ei].bullets, ""],
    };
    onChange({ ...data, experience });
  };

  const updateBullet = (ei: number, bi: number, value: string) => {
    const experience = [...data.experience];
    const bullets = [...experience[ei].bullets];
    bullets[bi] = value;
    experience[ei] = { ...experience[ei], bullets };
    onChange({ ...data, experience });
  };

  const removeBullet = (ei: number, bi: number) => {
    const experience = [...data.experience];
    experience[ei] = {
      ...experience[ei],
      bullets: experience[ei].bullets.filter((_, j) => j !== bi),
    };
    onChange({ ...data, experience });
  };

  const addEducation = () => {
    onChange({
      ...data,
      education: [
        ...data.education,
        {
          id: crypto.randomUUID(),
          school: "",
          degree: "",
          start: "",
          end: "",
        },
      ],
    });
  };

  const updateEdu = (i: number, patch: Partial<(typeof data.education)[0]>) => {
    const education = [...data.education];
    education[i] = { ...education[i], ...patch };
    onChange({ ...data, education });
  };

  const removeEdu = (i: number) => {
    onChange({ ...data, education: data.education.filter((_, j) => j !== i) });
  };

  const addSkillCat = () => {
    onChange({
      ...data,
      skills: [...data.skills, { id: crypto.randomUUID(), category: "", items: [""] }],
    });
  };

  const updateSkillCat = (i: number, patch: Partial<(typeof data.skills)[0]>) => {
    const skills = [...data.skills];
    skills[i] = { ...skills[i], ...patch };
    onChange({ ...data, skills });
  };

  const removeSkillCat = (i: number) => {
    onChange({ ...data, skills: data.skills.filter((_, j) => j !== i) });
  };

  const addSkillItem = (ci: number) => {
    const skills = [...data.skills];
    skills[ci] = { ...skills[ci], items: [...skills[ci].items, ""] };
    onChange({ ...data, skills });
  };

  const updateSkillItem = (ci: number, ii: number, value: string) => {
    const skills = [...data.skills];
    const items = [...skills[ci].items];
    items[ii] = value;
    skills[ci] = { ...skills[ci], items };
    onChange({ ...data, skills });
  };

  const removeSkillItem = (ci: number, ii: number) => {
    const skills = [...data.skills];
    skills[ci] = {
      ...skills[ci],
      items: skills[ci].items.filter((_, j) => j !== ii),
    };
    onChange({ ...data, skills });
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Section Navigator */}
      <nav className="sticky top-0 z-10 -mx-4 -mt-4 border-b border-slate-200 bg-white px-4">
        <div className="flex gap-1 overflow-x-auto py-2">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollToSection(s.id)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
              </svg>
              {s.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Personal Info */}
      <section
        ref={(el) => { sectionRefs.current.personal = el; }}
        className="scroll-mt-14 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-slate-900">Personal Info</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[112px_minmax(0,1fr)]">
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              {data.personal.photoUrl ? (
                <div className="relative aspect-square w-full">
                  <NextImage src={data.personal.photoUrl} alt="Profile" fill unoptimized className="object-cover" />
                </div>
              ) : (
                <div className="flex aspect-square items-center justify-center text-xs font-semibold uppercase tracking-widest text-slate-400">
                  No photo
                </div>
              )}
            </div>
            <label className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
              Upload photo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                className="hidden"
                onChange={(event) => void handlePhotoUpload(event)}
              />
            </label>
            {data.personal.photoUrl ? (
              <button
                type="button"
                onClick={() => setPersonal({ photoUrl: "" })}
                className="w-full rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-red-600"
              >
                Remove photo
              </button>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FieldLabel>Full name</FieldLabel>
              <Input
                value={data.personal.fullName}
                onChange={(e) => setPersonal({ fullName: e.target.value })}
                placeholder="Jordan Lee"
              />
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                value={data.personal.email}
                onChange={(e) => setPersonal({ email: e.target.value })}
                placeholder="you@email.com"
              />
            </div>
            <div>
              <FieldLabel>Phone</FieldLabel>
              <Input
                value={data.personal.phone}
                onChange={(e) => setPersonal({ phone: e.target.value })}
                placeholder="+1 555 0100"
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Location</FieldLabel>
              <Input
                value={data.personal.location}
                onChange={(e) => setPersonal({ location: e.target.value })}
                placeholder="San Francisco, CA"
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <FieldLabel>Links</FieldLabel>
            <button
              type="button"
              onClick={addLink}
              className="text-xs font-semibold text-sky-600 hover:text-sky-800"
            >
              + Add link
            </button>
          </div>
          <div className="space-y-2">
            {data.personal.links.map((link, i) => (
              <div key={i} className="flex flex-wrap gap-2">
                <Input
                  className="min-w-[120px] flex-1"
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) => updateLink(i, { label: e.target.value })}
                />
                <Input
                  className="min-w-[160px] flex-[2]"
                  placeholder="https://"
                  value={link.url}
                  onChange={(e) => updateLink(i, { url: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => removeLink(i)}
                  className="rounded-lg px-2 text-xs text-slate-500 hover:bg-slate-100"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Summary */}
      <section
        ref={(el) => { sectionRefs.current.summary = el; }}
        className="scroll-mt-14 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-slate-900">Summary</h2>
        <div className="mt-3">
          <TextArea
            rows={5}
            value={data.summary}
            onChange={(e) => onChange({ ...data, summary: e.target.value })}
            placeholder="Two or three sentences that frame your strengths and focus."
          />
        </div>
      </section>

      {/* Experience */}
      <section
        ref={(el) => { sectionRefs.current.experience = el; }}
        className="scroll-mt-14 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Experience</h2>
          <button
            type="button"
            onClick={addExperience}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
          >
            + Add role
          </button>
        </div>
        <div className="mt-4 space-y-6">
          {data.experience.map((job, ei) => (
            <div key={job.id ?? ei} className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeExp(ei)}
                  className="text-xs text-slate-500 hover:text-red-600"
                >
                  Remove role
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FieldLabel>Role</FieldLabel>
                  <Input value={job.role} onChange={(e) => updateExp(ei, { role: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel>Company</FieldLabel>
                  <Input value={job.company} onChange={(e) => updateExp(ei, { company: e.target.value })} />
                </div>
                <div>
                  <FieldLabel>Start</FieldLabel>
                  <Input value={job.start} onChange={(e) => updateExp(ei, { start: e.target.value })} placeholder="2021" />
                </div>
                <div>
                  <FieldLabel>End</FieldLabel>
                  <Input value={job.end} onChange={(e) => updateExp(ei, { end: e.target.value })} placeholder="Present" />
                </div>
              </div>
              <div className="mt-3">
                <div className="mb-2 flex items-center justify-between">
                  <FieldLabel>Bullet points</FieldLabel>
                  <button
                    type="button"
                    onClick={() => addBullet(ei)}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-800"
                  >
                    + Bullet
                  </button>
                </div>
                <div className="space-y-2">
                  {job.bullets.map((b, bi) => (
                    <div key={bi} className="flex gap-2">
                      <TextArea
                        rows={2}
                        className="flex-1"
                        value={b}
                        onChange={(e) => updateBullet(ei, bi, e.target.value)}
                        placeholder="Impact-focused accomplishment\u2026"
                      />
                      <button
                        type="button"
                        onClick={() => removeBullet(ei, bi)}
                        className="self-start rounded-lg px-2 text-xs text-slate-500 hover:bg-slate-200"
                      >
                        \u2715
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section
        ref={(el) => { sectionRefs.current.education = el; }}
        className="scroll-mt-14 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Education</h2>
          <button
            type="button"
            onClick={addEducation}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
          >
            + Add school
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {data.education.map((ed, i) => (
            <div key={ed.id ?? i} className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
              <div className="mb-2 flex justify-end">
                <button type="button" onClick={() => removeEdu(i)} className="text-xs text-slate-500 hover:text-red-600">
                  Remove
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FieldLabel>School</FieldLabel>
                  <Input value={ed.school} onChange={(e) => updateEdu(i, { school: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel>Degree / field</FieldLabel>
                  <Input value={ed.degree} onChange={(e) => updateEdu(i, { degree: e.target.value })} />
                </div>
                <div>
                  <FieldLabel>Start</FieldLabel>
                  <Input value={ed.start} onChange={(e) => updateEdu(i, { start: e.target.value })} />
                </div>
                <div>
                  <FieldLabel>End</FieldLabel>
                  <Input value={ed.end} onChange={(e) => updateEdu(i, { end: e.target.value })} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section
        ref={(el) => { sectionRefs.current.skills = el; }}
        className="scroll-mt-14 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Skills</h2>
          <button
            type="button"
            onClick={addSkillCat}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
          >
            + Add category
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {data.skills.map((cat, ci) => (
            <div key={cat.id ?? ci} className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeSkillCat(ci)}
                  className="text-xs text-slate-500 hover:text-red-600"
                >
                  Remove category
                </button>
              </div>
              <FieldLabel>Category name</FieldLabel>
              <Input
                className="mb-3"
                value={cat.category}
                onChange={(e) => updateSkillCat(ci, { category: e.target.value })}
                placeholder="Engineering"
              />
              <div className="mb-2 flex items-center justify-between">
                <FieldLabel>Items</FieldLabel>
                <button
                  type="button"
                  onClick={() => addSkillItem(ci)}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-800"
                >
                  + Skill
                </button>
              </div>
              <div className="space-y-2">
                {cat.items.map((item, ii) => (
                  <div key={ii} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateSkillItem(ci, ii, e.target.value)}
                      placeholder="TypeScript"
                    />
                    <button
                      type="button"
                      onClick={() => removeSkillItem(ci, ii)}
                      className="rounded-lg px-2 text-xs text-slate-500 hover:bg-slate-200"
                    >
                      \u2715
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
