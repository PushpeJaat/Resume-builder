export const executivePortraitCss = `
body {
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  font-size: 10.3pt;
  line-height: 1.5;
  color: #162033;
  background: #fff;
}
.resume-root {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  padding: 16mm;
}
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 32mm;
  gap: 10mm;
  align-items: start;
  padding-bottom: 7mm;
  border-bottom: 1px solid #dbe4f0;
}
.eyebrow {
  margin: 0 0 2mm;
  font-size: 8.5pt;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #1d4ed8;
}
.name {
  margin: 0;
  font-size: 24pt;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #0f172a;
}
.summary-intro {
  margin: 3mm 0 0;
  color: #475569;
}
.contact-row,
.links-row {
  display: flex;
  flex-wrap: wrap;
  gap: 2mm 6mm;
  margin-top: 3mm;
  font-size: 9pt;
  color: #475569;
}
.links-row a {
  color: #1d4ed8;
  text-decoration: none;
  font-weight: 600;
}
.photo-shell {
  display: flex;
  justify-content: flex-end;
}
.photo,
.photo-fallback {
  width: 32mm;
  height: 32mm;
  border-radius: 8mm;
  object-fit: cover;
}
.photo {
  border: 1.5mm solid #dbeafe;
}
.photo-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1e3a8a;
  font-size: 13pt;
  font-weight: 700;
}
.section {
  margin-top: 8mm;
}
.section-title {
  margin: 0 0 4mm;
  font-size: 9pt;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}
.job {
  padding: 4mm 0;
  border-top: 1px solid #e2e8f0;
}
.job:first-of-type {
  border-top: 0;
  padding-top: 0;
}
.job-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 3mm 8mm;
}
.job-role,
.edu-school,
.skill-name {
  margin: 0;
  font-size: 11pt;
  font-weight: 700;
  color: #0f172a;
}
.job-company,
.edu-degree {
  margin: 1mm 0 0;
  font-size: 10pt;
  color: #334155;
}
.job-dates,
.edu-dates {
  font-size: 8.7pt;
  color: #64748b;
}
.bullets {
  margin: 2.5mm 0 0;
  padding-left: 4mm;
  color: #334155;
}
.bullets li {
  margin-bottom: 1.4mm;
}
.lower-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 8mm;
}
.edu {
  margin-bottom: 4mm;
}
.skills-grid {
  display: grid;
  gap: 3mm;
}
.skill-card {
  padding: 3mm 3.5mm;
  border: 1px solid #dbe4f0;
  border-radius: 3mm;
  background: #f8fafc;
}
.skill-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5mm;
  margin-top: 2mm;
}
.skill-pill {
  padding: 1.2mm 2.4mm;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0c4a6e;
  font-size: 8.3pt;
  font-weight: 600;
}
@media print {
  .resume-root {
    min-height: auto;
  }
}
`;
