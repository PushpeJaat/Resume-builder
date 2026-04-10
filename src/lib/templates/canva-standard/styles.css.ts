export const canvaStandardCss = `
body {
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  font-size: 10pt;
  line-height: 1.5;
  color: #163047;
  background: #ffffff;
}
.resume-root {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 62mm minmax(0, 1fr);
  background: #ffffff;
}
.resume-sidebar {
  background: linear-gradient(180deg, #255f8f 0%, #1c4b73 100%);
  color: #eff6ff;
  padding: 14mm 8.5mm;
}
.resume-main {
  background: #f8fbff;
  padding: 13mm 11mm;
}
.identity-block {
  text-align: left;
}
.profile-photo,
.profile-fallback {
  width: 31mm;
  height: 31mm;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 5mm;
}
.profile-photo {
  border: 1.5mm solid rgba(255, 255, 255, 0.2);
}
.profile-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dbeafe, #93c5fd);
  color: #1d4ed8;
  font-size: 13pt;
  font-weight: 700;
}
.resume-name {
  margin: 0;
  font-size: 19pt;
  line-height: 1.05;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #ffffff;
}
.resume-role {
  margin: 2mm 0 0;
  font-size: 8.5pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #bfdbfe;
}
.sidebar-block + .sidebar-block {
  margin-top: 7mm;
}
.sidebar-block {
  margin-top: 8mm;
}
.sidebar-title,
.section-title {
  margin: 0 0 3mm;
  font-size: 8.2pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}
.sidebar-title {
  color: #dbeafe;
}
.section-title {
  color: #255f8f;
}
.sidebar-line,
.sidebar-links,
.entry-subtitle,
.summary,
.entry-bullets {
  margin: 0;
  color: inherit;
}
.sidebar-line,
.sidebar-links li,
.entry-date,
.entry-bullets li,
.summary {
  font-size: 9pt;
}
.sidebar-line + .sidebar-line {
  margin-top: 2.2mm;
}
.sidebar-links {
  list-style: none;
  padding: 0;
}
.sidebar-links li + li {
  margin-top: 2.2mm;
}
.sidebar-links a {
  color: #eff6ff;
  text-decoration: none;
}
.skill-group + .skill-group {
  margin-top: 4mm;
}
.skill-group-name {
  margin: 0 0 2mm;
  font-size: 8.4pt;
  font-weight: 700;
  color: #ffffff;
}
.skill-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 1.7mm;
}
.skill-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #eff6ff;
  padding: 1.2mm 2.6mm;
  font-size: 8pt;
  line-height: 1.2;
}
.content-card + .content-card {
  margin-top: 6mm;
}
.content-card {
  background: #ffffff;
  border: 1px solid #dbeafe;
  border-radius: 4mm;
  padding: 4.5mm 5mm;
}
.summary-card {
  background: linear-gradient(180deg, #ffffff 0%, #f0f7ff 100%);
}
.summary {
  color: #35506a;
}
.entry-block + .entry-block {
  margin-top: 4.5mm;
}
.entry-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 4mm 8mm;
  flex-wrap: wrap;
}
.entry-title {
  margin: 0;
  font-size: 10.8pt;
  font-weight: 700;
  color: #17324a;
}
.entry-subtitle {
  margin-top: 1mm;
  color: #5d7690;
  font-size: 9.2pt;
  font-weight: 600;
}
.entry-date {
  color: #65829e;
  white-space: nowrap;
}
.entry-bullets {
  margin-top: 2.4mm;
  padding-left: 4mm;
  color: #35506a;
}
.entry-bullets li + li {
  margin-top: 1.2mm;
}
@media print {
  .resume-root {
    min-height: auto;
  }
}
`;