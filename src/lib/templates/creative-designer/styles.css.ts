export const creativeDesignerCss = `
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: "Space Grotesk", "DM Sans", system-ui, sans-serif;
  font-size: 10.5pt;
  line-height: 1.45;
  color: #0c0a09;
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.resume-root {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}
.top-band {
  height: 28mm;
  background: linear-gradient(110deg, #f97316 0%, #ec4899 45%, #8b5cf6 100%);
  clip-path: polygon(0 0, 100% 0, 100% 65%, 0 100%);
}
.inner { padding: 0 14mm 14mm; margin-top: -6mm; position: relative; z-index: 1; }
.name-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 6mm; flex-wrap: wrap; }
.name {
  font-family: "Playfair Display", Georgia, serif;
  font-size: 26pt;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
  line-height: 1.1;
}
.tag {
  font-size: 9pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #f97316;
  margin: 3mm 0 0;
}
.contact-strip {
  margin-top: 8mm;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3mm;
  font-size: 9pt;
}
.contact-cell {
  background: #fafaf9;
  border: 1px solid #e7e5e4;
  border-radius: 3mm;
  padding: 3mm 4mm;
  word-break: break-word;
}
.contact-label { font-size: 7pt; font-weight: 700; text-transform: uppercase; color: #a8a29e; margin: 0 0 1mm; }
.contact-value { margin: 0; color: #44403c; }
.links-row { margin-top: 3mm; display: flex; flex-wrap: wrap; gap: 2mm 5mm; font-size: 9pt; }
.links-row a { color: #c026d3; font-weight: 600; text-decoration: none; }
.grid-2 { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 10mm; margin-top: 10mm; align-items: start; }
.section-title {
  font-size: 9pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #78716c;
  margin: 0 0 4mm;
  display: flex;
  align-items: center;
  gap: 3mm;
}
.section-title::after {
  content: "";
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, #e7e5e4, transparent);
}
.summary { margin: 0; color: #44403c; }
.job { margin-bottom: 6mm; break-inside: avoid; padding-left: 3mm; border-left: 3px solid #f97316; }
.job-role { font-weight: 700; font-size: 11pt; margin: 0; }
.job-co { font-size: 10pt; color: #57534e; margin: 1mm 0 0; }
.job-dates { font-size: 8.5pt; color: #a8a29e; margin-top: 1mm; }
.bullets { margin: 2mm 0 0; padding-left: 4mm; color: #44403c; }
.bullets li { margin-bottom: 1.5mm; }
.edu { margin-bottom: 5mm; break-inside: avoid; background: #fafaf9; padding: 3mm 4mm; border-radius: 2mm; border: 1px solid #e7e5e4; }
.edu-school { font-weight: 700; margin: 0; }
.edu-degree { margin: 1mm 0 0; color: #57534e; font-size: 10pt; }
.edu-dates { font-size: 9pt; color: #a8a29e; margin-top: 1mm; }
.skill-block { margin-bottom: 4mm; break-inside: avoid; }
.skill-cat { font-weight: 700; font-size: 10pt; margin: 0 0 2mm; color: #0c0a09; }
.skill-chips { display: flex; flex-wrap: wrap; gap: 2mm; }
.chip {
  font-size: 8.5pt;
  font-weight: 600;
  padding: 1.5mm 3mm;
  border-radius: 2mm;
  background: #fff7ed;
  color: #9a3412;
  border: 1px solid #fed7aa;
}
@media print {
  .contact-strip { grid-template-columns: repeat(2, 1fr); }
}
`;
