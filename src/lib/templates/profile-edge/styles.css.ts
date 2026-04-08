export const profileEdgeCss = `
body {
  font-family: "DM Sans", "Inter", system-ui, sans-serif;
  font-size: 10.2pt;
  line-height: 1.5;
  color: #0f172a;
  background: #fff;
}
.resume-root {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 64mm minmax(0, 1fr);
}
.sidebar {
  background: #0f172a;
  color: #e2e8f0;
  padding: 14mm 9mm;
}
.main {
  padding: 14mm 13mm;
  background: #fff;
}
.photo-wrap {
  margin-bottom: 5mm;
}
.photo,
.photo-fallback {
  width: 34mm;
  height: 34mm;
  border-radius: 50%;
  object-fit: cover;
}
.photo {
  border: 1.5mm solid rgba(255, 255, 255, 0.18);
}
.photo-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #38bdf8, #1d4ed8);
  color: #eff6ff;
  font-size: 13pt;
  font-weight: 700;
}
.name {
  margin: 0;
  font-size: 19pt;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: #fff;
}
.sidebar-kicker {
  margin: 2mm 0 0;
  color: #93c5fd;
  font-size: 8.5pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}
.side-block {
  margin-top: 8mm;
}
.side-title,
.section-title {
  margin: 0 0 3mm;
  font-size: 8.4pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}
.side-title {
  color: #7dd3fc;
}
.section-title {
  color: #64748b;
}
.side-line,
.side-links li,
.side-skill-items,
.summary,
.job-company,
.edu-degree {
  color: inherit;
  opacity: 0.92;
}
.side-line,
.side-skill-name,
.side-skill-items,
.side-links {
  margin: 0;
  font-size: 9pt;
}
.side-line + .side-line,
.side-skill-group + .side-skill-group {
  margin-top: 2.4mm;
}
.side-links {
  list-style: none;
  padding: 0;
}
.side-links li + li {
  margin-top: 2mm;
}
.side-links a {
  color: #e0f2fe;
  text-decoration: none;
}
.side-skill-name {
  font-weight: 700;
  color: #fff;
}
.section + .section {
  margin-top: 8mm;
}
.intro-card {
  padding: 4mm 4.5mm;
  border-radius: 4mm;
  background: #eff6ff;
}
.summary {
  margin: 0;
  color: #334155;
}
.job {
  padding-left: 4mm;
  border-left: 2px solid #bfdbfe;
}
.job + .job,
.edu + .edu {
  margin-top: 5mm;
}
.job-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 3mm 8mm;
  flex-wrap: wrap;
}
.job-role,
.edu-school {
  margin: 0;
  font-size: 11pt;
  font-weight: 700;
  color: #0f172a;
}
.job-company,
.edu-degree {
  margin: 1mm 0 0;
  font-size: 10pt;
  color: #475569;
}
.job-dates,
.edu-dates {
  font-size: 8.7pt;
  color: #64748b;
}
.bullets {
  margin: 2mm 0 0;
  padding-left: 4mm;
  color: #334155;
}
.bullets li {
  margin-bottom: 1.4mm;
}
@media print {
  .resume-root {
    min-height: auto;
  }
}
`;
