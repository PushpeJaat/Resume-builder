export const sunriseStrataCss = `
body {
  margin: 0;
  font-family: "DM Sans", system-ui, -apple-system, sans-serif;
  font-size: 10pt;
  line-height: 1.5;
  color: #1f2937;
  background: #fff6ee;
}

.ss-root {
  position: relative;
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  overflow: hidden;
  padding: 10mm;
  background:
    linear-gradient(160deg, #fff5ea 0%, #ffe8da 28%, #fffdf8 62%, #fff7ee 100%);
}

.ss-root::before,
.ss-root::after {
  content: "";
  position: absolute;
  pointer-events: none;
  border-radius: 999px;
  z-index: 0;
}

.ss-root::before {
  width: 160mm;
  height: 160mm;
  right: -84mm;
  top: -84mm;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.22) 0%, rgba(249, 115, 22, 0) 70%);
}

.ss-root::after {
  width: 190mm;
  height: 160mm;
  left: -120mm;
  bottom: -92mm;
  background: radial-gradient(circle, rgba(234, 179, 8, 0.25) 0%, rgba(234, 179, 8, 0) 72%);
}

.ss-glow,
.ss-gridline {
  position: absolute;
  pointer-events: none;
  z-index: 0;
}

.ss-glow {
  border-radius: 50%;
  filter: blur(1px);
}

.ss-glow-one {
  width: 48mm;
  height: 48mm;
  left: 12mm;
  top: 28mm;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.25) 0%, rgba(14, 165, 233, 0) 78%);
}

.ss-glow-two {
  width: 44mm;
  height: 44mm;
  right: 26mm;
  top: 104mm;
  background: radial-gradient(circle, rgba(244, 114, 182, 0.2) 0%, rgba(244, 114, 182, 0) 72%);
}

.ss-gridline {
  width: 120mm;
  height: 0.5mm;
  background: linear-gradient(90deg, rgba(148, 163, 184, 0), rgba(148, 163, 184, 0.45), rgba(148, 163, 184, 0));
}

.ss-gridline-one {
  left: 14mm;
  top: 86mm;
  transform: rotate(-8deg);
}

.ss-gridline-two {
  right: 12mm;
  top: 148mm;
  transform: rotate(5deg);
}

.ss-header,
.ss-content-grid {
  position: relative;
  z-index: 1;
}

.ss-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 38mm;
  gap: 7mm;
  align-items: center;
  border: 1px solid rgba(203, 213, 225, 0.8);
  background: rgba(255, 255, 255, 0.86);
  border-radius: 6mm;
  padding: 6mm 6.5mm;
  box-shadow: 0 4mm 10mm rgba(15, 23, 42, 0.07);
}

.ss-kicker {
  margin: 0;
  font-size: 8pt;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-weight: 700;
  color: #c2410c;
}

.ss-name {
  margin: 1.6mm 0 0;
  font-family: "Playfair Display", "DM Sans", serif;
  font-size: 30pt;
  line-height: 1.02;
  color: #7c2d12;
}

.ss-summary {
  margin: 2.6mm 0 0;
  font-size: 9.3pt;
  color: #374151;
  max-width: 128mm;
}

.ss-meta {
  margin-top: 3.2mm;
  display: flex;
  flex-wrap: wrap;
  gap: 1.3mm 3.4mm;
}

.ss-meta span {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(251, 146, 60, 0.35);
  background: linear-gradient(135deg, rgba(255, 237, 213, 0.95), rgba(255, 247, 237, 0.95));
  color: #9a3412;
  border-radius: 999px;
  padding: 0.9mm 2.5mm;
  font-size: 8pt;
  font-weight: 600;
}

.ss-photo,
.ss-photo-fallback {
  width: 34mm;
  height: 34mm;
  border-radius: 6mm;
}

.ss-photo {
  object-fit: cover;
  border: 1mm solid rgba(251, 146, 60, 0.32);
}

.ss-photo-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Space Grotesk", "DM Sans", sans-serif;
  font-size: 13pt;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(140deg, #f97316, #fb7185);
}

.ss-content-grid {
  margin-top: 5mm;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 58mm;
  gap: 4.6mm;
}

.ss-section + .ss-section {
  margin-top: 4.2mm;
}

.ss-section-title,
.ss-panel-title {
  margin: 0 0 2.3mm;
  font-size: 8pt;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-weight: 700;
}

.ss-section-title {
  color: #9a3412;
}

.ss-panel-title {
  color: #1e293b;
}

.ss-card,
.ss-panel {
  break-inside: avoid;
  page-break-inside: avoid;
}

.ss-card {
  border-radius: 4mm;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2.2mm 7.5mm rgba(15, 23, 42, 0.05);
  padding: 3.8mm;
  border-left: 1.2mm solid #f97316;
}

.ss-card + .ss-card {
  margin-top: 2.8mm;
}

.ss-card-head {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 2mm 5mm;
}

.ss-role {
  margin: 0;
  color: #111827;
  font-size: 10.2pt;
  font-weight: 700;
}

.ss-company {
  margin: 0.9mm 0 0;
  color: #6b7280;
  font-size: 8.8pt;
  font-weight: 600;
}

.ss-period {
  margin: 0;
  white-space: nowrap;
  color: #c2410c;
  font-size: 8.1pt;
  font-weight: 700;
}

.ss-bullets {
  margin: 2.2mm 0 0;
  padding-left: 4mm;
}

.ss-bullets li {
  color: #374151;
  font-size: 8.9pt;
}

.ss-bullets li + li {
  margin-top: 1mm;
}

.ss-side-col {
  display: flex;
  flex-direction: column;
  gap: 2.8mm;
}

.ss-panel {
  border-radius: 4mm;
  border: 1px solid rgba(203, 213, 225, 0.8);
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.94), rgba(255, 251, 245, 0.95));
  padding: 3.5mm;
}

.ss-line {
  margin: 0;
  color: #334155;
  font-size: 8.5pt;
}

.ss-line + .ss-line {
  margin-top: 1.4mm;
}

.ss-links {
  margin: 0;
  padding: 0;
  list-style: none;
}

.ss-links li + li {
  margin-top: 1.5mm;
}

.ss-links a {
  color: #0f766e;
  text-decoration: none;
  font-size: 8.6pt;
  font-weight: 700;
}

.ss-skill-group + .ss-skill-group {
  margin-top: 2.3mm;
}

.ss-skill-category {
  margin: 0 0 1.5mm;
  font-size: 8pt;
  color: #4b5563;
  font-weight: 700;
}

.ss-chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 1.1mm;
}

.ss-chip {
  display: inline-block;
  border-radius: 999px;
  border: 1px solid rgba(251, 146, 60, 0.26);
  background: linear-gradient(140deg, rgba(255, 237, 213, 0.95), rgba(255, 251, 235, 0.95));
  color: #9a3412;
  padding: 0.8mm 2mm;
  font-size: 7.9pt;
  font-weight: 700;
}

@media print {
  .ss-root {
    min-height: auto;
  }
}
`;