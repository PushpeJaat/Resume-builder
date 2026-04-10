export const luminaryCss = `
/* ─────────────────────────────────────────────────────────────
   LUMINARY  |  Magazine-quality resume with full-bleed photo
   Design language: editorial, warm gold accent, Fraunces serif
───────────────────────────────────────────────────────────────── */

@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

/* ── Base ──────────────────────────────────────────────────── */
body {
  font-family: "DM Sans", system-ui, -apple-system, sans-serif;
  font-size: 10.2pt;
  line-height: 1.55;
  color: #1c1917;
  background: #fff;
}

.resume-root {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  background: #fff;
}

/* ── Header ────────────────────────────────────────────────── */
.header {
  display: grid;
  grid-template-columns: 1fr 44mm;
  gap: 0;
  padding: 14mm 15mm 12mm;
  background: linear-gradient(125deg, #0f172a 0%, #1e293b 55%, #0f2944 100%);
  position: relative;
  overflow: hidden;
}

/* subtle background texture rings */
.header::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 80% 50%, rgba(202,157,66,0.12) 0%, transparent 55%),
    radial-gradient(circle at 10% 90%, rgba(56,189,248,0.08) 0%, transparent 40%);
  pointer-events: none;
}

.header-text {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-right: 8mm;
}

.header-label {
  margin: 0 0 2.5mm;
  font-family: "DM Sans", sans-serif;
  font-size: 7.8pt;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #ca9d42;
}

.header-name {
  margin: 0;
  font-family: "Fraunces", Georgia, serif;
  font-size: 30pt;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: #fff;
}

.header-summary {
  margin: 3.5mm 0 0;
  font-size: 9.8pt;
  line-height: 1.6;
  color: #94a3b8;
  max-width: 118mm;
}

.header-contact {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5mm 5mm;
  margin-top: 4mm;
}

.contact-item {
  font-size: 8.8pt;
  color: #cbd5e1;
}

.contact-link {
  font-size: 8.8pt;
  color: #ca9d42;
  text-decoration: none;
  font-weight: 500;
}

/* ── Photo ─────────────────────────────────────────────────── */
.header-photo-wrap {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-photo,
.header-photo-fallback {
  width: 40mm;
  height: 40mm;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  position: relative;
  z-index: 2;
}

.header-photo {
  border: 2mm solid #ca9d42;
  box-shadow: 0 4mm 14mm rgba(0,0,0,0.35);
}

.header-photo-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a8a, #0ea5e9);
  border: 2mm solid #ca9d42;
  box-shadow: 0 4mm 14mm rgba(0,0,0,0.35);
  font-family: "Fraunces", Georgia, serif;
  font-size: 15pt;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.04em;
}

.photo-ring {
  position: absolute;
  width: 46mm;
  height: 46mm;
  border-radius: 50%;
  border: 0.5mm solid rgba(202,157,66,0.35);
  pointer-events: none;
  z-index: 1;
}

/* ── Gold Rule ──────────────────────────────────────────────── */
.gold-rule {
  height: 2.5px;
  background: linear-gradient(90deg, #ca9d42 0%, #e8c96b 45%, #ca9d42 100%);
}

/* ── Body grid ─────────────────────────────────────────────── */
.body-grid {
  display: grid;
  grid-template-columns: 1fr 68mm;
  gap: 0;
  padding: 0 15mm 14mm;
}

.col-left {
  padding-right: 8mm;
  border-right: 1px solid #e2e8f0;
}

.col-right {
  padding-left: 8mm;
}

/* ── Sections ─────────────────────────────────────────────── */
.section {
  margin-top: 8mm;
  break-inside: avoid;
  page-break-inside: avoid;
}

.section-heading {
  margin: 0 0 4mm;
  font-family: "Fraunces", Georgia, serif;
  font-size: 12.5pt;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: -0.01em;
  border-bottom: 1.5px solid #f1f5f9;
  padding-bottom: 2mm;
}

/* ── Experience ───────────────────────────────────────────── */
.job {
  padding: 4mm 0;
  border-top: 1px solid #f1f5f9;
  break-inside: avoid;
  page-break-inside: avoid;
}

.job:first-of-type {
  padding-top: 0;
  border-top: none;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 3mm;
}

.job-role {
  margin: 0;
  font-family: "DM Sans", sans-serif;
  font-size: 10.8pt;
  font-weight: 600;
  color: #0f172a;
}

.job-company {
  margin: 0.5mm 0 0;
  font-size: 9.5pt;
  color: #ca9d42;
  font-weight: 500;
}

.job-period {
  flex-shrink: 0;
  font-size: 8.8pt;
  color: #64748b;
  margin-top: 0.5mm;
  white-space: nowrap;
}

.bullets {
  margin: 2.5mm 0 0;
  padding-left: 4mm;
  list-style: none;
}

.bullets li {
  position: relative;
  padding-left: 3.5mm;
  margin-bottom: 1.5mm;
  font-size: 9.8pt;
  color: #334155;
  line-height: 1.5;
}

.bullets li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 2.5mm;
  width: 1.5mm;
  height: 1.5mm;
  border-radius: 50%;
  background: #ca9d42;
}

/* ── Education ────────────────────────────────────────────── */
.edu {
  padding: 3.5mm 0;
  border-top: 1px solid #f1f5f9;
  break-inside: avoid;
  page-break-inside: avoid;
}

.edu:first-of-type {
  padding-top: 0;
  border-top: none;
}

.edu-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 3mm;
}

.edu-school {
  margin: 0;
  font-size: 10.5pt;
  font-weight: 600;
  color: #0f172a;
}

.edu-degree {
  margin: 0.5mm 0 0;
  font-size: 9.5pt;
  color: #64748b;
}

.edu-period {
  flex-shrink: 0;
  font-size: 8.8pt;
  color: #64748b;
  white-space: nowrap;
}

/* ── Skills (right column) ───────────────────────────────── */
.skill-group {
  margin-bottom: 5mm;
  break-inside: avoid;
  page-break-inside: avoid;
}

.skill-category {
  margin: 0 0 2mm;
  font-size: 8.5pt;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #475569;
}

.skill-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5mm;
}

.chip {
  display: inline-block;
  padding: 1mm 3mm;
  border-radius: 20mm;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  font-size: 8.8pt;
  color: #334155;
  white-space: nowrap;
  break-inside: avoid;
}
`;
