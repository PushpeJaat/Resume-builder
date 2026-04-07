/** A4-optimized print styles; same CSS used in preview iframe and PDF. */
export const modernProfessionalCss = `
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  font-size: 10.5pt;
  line-height: 1.45;
  color: #1a1a1a;
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.resume-root {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 72mm 1fr;
}
.resume-sidebar {
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  color: #e2e8f0;
  padding: 14mm 10mm;
}
.resume-main { padding: 14mm 12mm; background: #fff; }
.brand { font-size: 20pt; font-weight: 700; letter-spacing: -0.02em; color: #fff; margin: 0 0 2mm; }
.role-line { font-size: 9pt; color: #94a3b8; margin: 0 0 8mm; }
.side-block { margin-top: 8mm; }
.side-title {
  font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;
  color: #38bdf8; margin: 0 0 3mm;
}
.side-text { font-size: 9pt; color: #cbd5e1; margin: 0; word-break: break-word; }
.side-links { list-style: none; padding: 0; margin: 0; }
.side-links li { margin-bottom: 2mm; font-size: 9pt; }
.side-links a { color: #7dd3fc; text-decoration: none; }
.section-title {
  font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  color: #0f172a; border-bottom: 2px solid #0ea5e9; padding-bottom: 2mm; margin: 0 0 4mm;
}
.summary { margin: 0 0 8mm; font-size: 10pt; color: #334155; }
.job { margin-bottom: 7mm; break-inside: avoid; }
.job-head { display: flex; justify-content: space-between; align-items: baseline; gap: 4mm; flex-wrap: wrap; }
.job-title { font-weight: 700; font-size: 11pt; margin: 0; color: #0f172a; }
.job-company { font-weight: 600; font-size: 10pt; margin: 1mm 0 0; color: #475569; }
.job-dates { font-size: 9pt; color: #64748b; white-space: nowrap; }
.bullets { margin: 2mm 0 0; padding-left: 4mm; }
.bullets li { margin-bottom: 1.5mm; color: #334155; }
.edu { margin-bottom: 5mm; break-inside: avoid; }
.edu-school { font-weight: 700; margin: 0; font-size: 10.5pt; }
.edu-degree { margin: 1mm 0 0; color: #475569; font-size: 10pt; }
.edu-dates { font-size: 9pt; color: #64748b; margin-top: 1mm; }
.skills-grid { display: grid; gap: 4mm; }
.skill-cat { break-inside: avoid; }
.skill-cat-name { font-weight: 700; font-size: 9.5pt; margin: 0 0 1mm; color: #0f172a; }
.skill-pills { display: flex; flex-wrap: wrap; gap: 2mm; }
.skill-pill {
  font-size: 8.5pt; padding: 1.5mm 3mm; border-radius: 999px;
  background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0;
}
`;
