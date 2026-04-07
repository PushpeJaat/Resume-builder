"use client";

import type { ResumeData } from "@/types/resume";
import { TEMPLATES } from "@/lib/templates/registry";

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

type Props = {
  data: ResumeData;
  onChange: (next: ResumeData) => void;
  templateId: string;
  onTemplateId: (id: string) => void;
  userPlan: "FREE" | "PREMIUM";
  onPremiumIntent: () => void;
};

export function ResumeEditor({
  data,
  onChange,
  templateId,
  onTemplateId,
  userPlan,
  onPremiumIntent,
}: Props) {
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
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Template</h2>
        <p className="mt-1 text-xs text-slate-500">Preview and PDF use the same HTML and CSS for each template.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {TEMPLATES.map((t) => {
            const locked = t.premium && userPlan !== "PREMIUM";
            const active = templateId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onTemplateId(t.id);
                  if (locked) onPremiumIntent();
                }}
                className={`relative rounded-xl border p-3 text-left transition ${
                  active
                    ? "border-sky-500 bg-sky-50 ring-2 ring-sky-200"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >
                {t.premium ? (
                  <span className="absolute right-2 top-2 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Pro
                  </span>
                ) : null}
                <p className="pr-14 text-sm font-semibold text-slate-900">{t.name}</p>
                <p className="mt-1 text-xs text-slate-600">{t.description}</p>
                {locked ? (
                  <p className="mt-2 text-xs font-medium text-violet-700">Preview unlocked · PDF export requires Pro</p>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Personal</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
                        placeholder="Impact-focused accomplishment…"
                      />
                      <button
                        type="button"
                        onClick={() => removeBullet(ei, bi)}
                        className="self-start rounded-lg px-2 text-xs text-slate-500 hover:bg-slate-200"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
                      ✕
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
