export const minimalCleanCss = `
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  font-size: 10.5pt;
  line-height: 1.55;
  color: #111827;
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.resume-root {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  padding: 18mm 22mm;
}
.header { border-bottom: 1px solid #e5e7eb; padding-bottom: 8mm; margin-bottom: 10mm; }
.name { font-size: 22pt; font-weight: 600; letter-spacing: -0.03em; margin: 0; }
.meta-row { display: flex; flex-wrap: wrap; gap: 3mm 8mm; margin-top: 4mm; font-size: 9.5pt; color: #6b7280; }
.meta-item { white-space: nowrap; }
.links { margin-top: 4mm; font-size: 9.5pt; }
.links a { color: #2563eb; text-decoration: none; margin-right: 6mm; }
.section { margin-bottom: 10mm; break-inside: avoid-page; }
.section-title {
  font-size: 9pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.14em;
  color: #9ca3af; margin: 0 0 4mm;
}
.summary { margin: 0; color: #374151; max-width: 100%; }
.job { margin-bottom: 7mm; break-inside: avoid; }
.job-top { display: flex; justify-content: space-between; gap: 4mm; flex-wrap: wrap; align-items: baseline; }
.job-role { font-weight: 600; font-size: 11pt; margin: 0; }
.job-co { font-size: 10pt; color: #4b5563; margin: 1mm 0 0; }
.job-dates { font-size: 9pt; color: #9ca3af; }
.bullets { margin: 2mm 0 0; padding-left: 4mm; color: #374151; }
.bullets li { margin-bottom: 1.5mm; }
.edu { margin-bottom: 5mm; break-inside: avoid; }
.edu-school { font-weight: 600; margin: 0; }
.edu-degree { margin: 1mm 0 0; color: #4b5563; font-size: 10pt; }
.edu-dates { font-size: 9pt; color: #9ca3af; margin-top: 1mm; }
.skills { display: grid; gap: 4mm; }
.skill-row { break-inside: avoid; }
.skill-cat { font-weight: 600; font-size: 10pt; margin: 0 0 1mm; }
.skill-items { font-size: 10pt; color: #4b5563; margin: 0; }
`;
