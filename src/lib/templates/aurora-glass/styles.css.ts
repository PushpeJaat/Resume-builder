export const auroraGlassCss = `
body {
  font-family: "DM Sans", system-ui, -apple-system, sans-serif;
  font-size: 10pt;
  line-height: 1.52;
  color: #0b1020;
  background: #f8fbff;
}

.ag-root {
  position: relative;
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  padding: 10mm;
  overflow: hidden;
  background:
    radial-gradient(circle at 8% 12%, rgba(99, 102, 241, 0.26), transparent 36%),
    radial-gradient(circle at 88% 20%, rgba(14, 165, 233, 0.22), transparent 34%),
    linear-gradient(165deg, #eef4ff 0%, #f8fbff 45%, #ffffff 100%);
}

.ag-bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
  pointer-events: none;
  z-index: 0;
}

.ag-bg-orb-one {
  width: 52mm;
  height: 52mm;
  right: -18mm;
  top: 56mm;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.42) 0%, rgba(59, 130, 246, 0.06) 75%, transparent 100%);
}

.ag-bg-orb-two {
  width: 64mm;
  height: 64mm;
  left: -20mm;
  bottom: -8mm;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.36) 0%, rgba(168, 85, 247, 0.04) 70%, transparent 100%);
}

.ag-header {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 38mm;
  gap: 7mm;
  align-items: center;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 6mm;
  background: linear-gradient(130deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.65));
  backdrop-filter: blur(10px);
  padding: 6mm 7mm;
  box-shadow: 0 4mm 12mm rgba(30, 41, 59, 0.08);
}

.ag-kicker {
  margin: 0;
  font-size: 8pt;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  font-weight: 700;
  color: #4f46e5;
}

.ag-name {
  margin: 1.6mm 0 0;
  font-family: "Space Grotesk", "DM Sans", sans-serif;
  font-size: 27pt;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: #111827;
}

.ag-summary {
  margin: 2.6mm 0 0;
  max-width: 126mm;
  color: #334155;
  font-size: 9.4pt;
}

.ag-contact-row {
  margin-top: 3.4mm;
  display: flex;
  flex-wrap: wrap;
  gap: 1.2mm 4mm;
}

.ag-contact-row span {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.12);
  color: #1e3a8a;
  padding: 1mm 2.4mm;
  font-size: 8.1pt;
  font-weight: 600;
}

.ag-photo-wrap {
  justify-self: end;
}

.ag-photo,
.ag-photo-fallback {
  width: 34mm;
  height: 34mm;
  border-radius: 50%;
  object-fit: cover;
}

.ag-photo {
  border: 1.2mm solid rgba(59, 130, 246, 0.28);
}

.ag-photo-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Space Grotesk", sans-serif;
  font-size: 13pt;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #2563eb, #a855f7);
}

.ag-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 58mm;
  gap: 5mm;
  margin-top: 5mm;
}

.ag-section + .ag-section {
  margin-top: 4.5mm;
}

.ag-section-title,
.ag-side-title {
  margin: 0 0 2.7mm;
  font-size: 8pt;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-weight: 700;
}

.ag-section-title {
  color: #3730a3;
}

.ag-side-title {
  color: #0f172a;
}

.ag-card {
  break-inside: avoid;
  page-break-inside: avoid;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 4.5mm;
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.9), rgba(241, 245, 249, 0.72));
  padding: 4mm;
  box-shadow: 0 2.5mm 8mm rgba(15, 23, 42, 0.06);
}

.ag-card + .ag-card {
  margin-top: 3mm;
}

.ag-card-head {
  display: flex;
  justify-content: space-between;
  gap: 3mm 7mm;
  flex-wrap: wrap;
}

.ag-role {
  margin: 0;
  color: #111827;
  font-size: 10.6pt;
  font-weight: 700;
}

.ag-company {
  margin: 0.8mm 0 0;
  color: #475569;
  font-size: 9.1pt;
  font-weight: 600;
}

.ag-period {
  margin: 0;
  color: #4338ca;
  font-size: 8.5pt;
  font-weight: 600;
  white-space: nowrap;
}

.ag-bullets {
  margin: 2.3mm 0 0;
  padding-left: 4mm;
  color: #334155;
}

.ag-bullets li {
  font-size: 9pt;
}

.ag-bullets li + li {
  margin-top: 1mm;
}

.ag-side-col {
  display: flex;
  flex-direction: column;
  gap: 3mm;
}

.ag-side-block {
  break-inside: avoid;
  page-break-inside: avoid;
  border: 1px solid rgba(30, 41, 59, 0.08);
  border-radius: 4.5mm;
  background: rgba(255, 255, 255, 0.84);
  padding: 3.6mm;
}

.ag-links {
  margin: 0;
  padding: 0;
  list-style: none;
}

.ag-links li + li {
  margin-top: 1.6mm;
}

.ag-links a {
  color: #1d4ed8;
  text-decoration: none;
  font-size: 8.8pt;
  font-weight: 600;
}

.ag-skill-group + .ag-skill-group {
  margin-top: 2.7mm;
}

.ag-skill-category {
  margin: 0 0 1.8mm;
  font-size: 8.1pt;
  color: #334155;
  font-weight: 700;
}

.ag-chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2mm;
}

.ag-chip {
  display: inline-block;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(168, 85, 247, 0.14));
  color: #1e3a8a;
  border: 1px solid rgba(59, 130, 246, 0.2);
  padding: 0.85mm 2.1mm;
  font-size: 8.1pt;
  font-weight: 600;
}

@media print {
  .ag-root {
    min-height: auto;
  }
}
`;