export const novaNoirCss = `
body {
  font-family: "DM Sans", system-ui, -apple-system, sans-serif;
  font-size: 10pt;
  line-height: 1.52;
  color: #dbe4ff;
  background: #020617;
}

.nn-root {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  background:
    radial-gradient(circle at 92% 18%, rgba(34, 211, 238, 0.18), transparent 30%),
    radial-gradient(circle at 18% 88%, rgba(99, 102, 241, 0.2), transparent 32%),
    linear-gradient(180deg, #050916 0%, #070d1d 46%, #090f1f 100%);
}

.nn-header {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 42mm;
  gap: 8mm;
  padding: 10mm 11mm 8mm;
  overflow: hidden;
  border-bottom: 1px solid rgba(148, 163, 184, 0.3);
}

.nn-header::before {
  content: "";
  position: absolute;
  width: 120mm;
  height: 120mm;
  right: -35mm;
  top: -74mm;
  border-radius: 50%;
  border: 1.5mm solid rgba(56, 189, 248, 0.24);
}

.nn-header::after {
  content: "";
  position: absolute;
  width: 160mm;
  height: 160mm;
  right: -64mm;
  top: -96mm;
  border-radius: 50%;
  border: 0.55mm solid rgba(56, 189, 248, 0.18);
}

.nn-header-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, rgba(15, 23, 42, 0.55) 0%, rgba(2, 6, 23, 0.25) 65%, transparent 100%);
  pointer-events: none;
}

.nn-header-content,
.nn-avatar-wrap {
  position: relative;
  z-index: 1;
}

.nn-kicker {
  margin: 0;
  color: #67e8f9;
  font-size: 8pt;
  text-transform: uppercase;
  letter-spacing: 0.24em;
  font-weight: 700;
}

.nn-name {
  margin: 1.8mm 0 0;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 30pt;
  letter-spacing: -0.02em;
  line-height: 1.06;
  color: #f8fbff;
}

.nn-contact {
  margin-top: 3.6mm;
  display: flex;
  flex-wrap: wrap;
  gap: 1.3mm 3.5mm;
}

.nn-contact span {
  border: 1px solid rgba(125, 211, 252, 0.32);
  border-radius: 999px;
  padding: 0.95mm 2.2mm;
  color: #bae6fd;
  font-size: 8.2pt;
}

.nn-summary {
  margin: 3.2mm 0 0;
  max-width: 126mm;
  font-size: 9.4pt;
  color: #c4d3ff;
}

.nn-avatar-wrap {
  justify-self: end;
  align-self: center;
}

.nn-avatar,
.nn-avatar-fallback {
  width: 35mm;
  height: 35mm;
  border-radius: 50%;
  object-fit: cover;
}

.nn-avatar {
  border: 1.2mm solid rgba(125, 211, 252, 0.56);
  box-shadow: 0 4mm 10mm rgba(15, 23, 42, 0.5);
}

.nn-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #082f49;
  background: linear-gradient(135deg, #67e8f9, #818cf8);
  font-family: "Space Grotesk", sans-serif;
  font-size: 13.5pt;
  font-weight: 700;
  border: 1.2mm solid rgba(125, 211, 252, 0.56);
}

.nn-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 60mm;
  gap: 5.5mm;
  padding: 6mm 11mm 11mm;
}

.nn-column {
  display: flex;
  flex-direction: column;
  gap: 4mm;
}

.nn-section,
.nn-side-block {
  border-radius: 4.5mm;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(160deg, rgba(15, 23, 42, 0.66), rgba(15, 23, 42, 0.42));
  backdrop-filter: blur(6px);
  padding: 3.8mm;
  break-inside: avoid;
  page-break-inside: avoid;
}

.nn-title,
.nn-side-title {
  margin: 0 0 2.4mm;
  font-size: 8pt;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-weight: 700;
}

.nn-title {
  color: #67e8f9;
}

.nn-side-title {
  color: #c4b5fd;
}

.nn-entry {
  break-inside: avoid;
  page-break-inside: avoid;
  border-top: 1px solid rgba(125, 211, 252, 0.12);
  padding-top: 2.7mm;
}

.nn-entry:first-of-type {
  border-top: none;
  padding-top: 0;
}

.nn-entry + .nn-entry {
  margin-top: 2.7mm;
}

.nn-entry-head {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.8mm 6mm;
}

.nn-role {
  margin: 0;
  color: #f1f5ff;
  font-size: 10.5pt;
  font-weight: 700;
}

.nn-company {
  margin: 0.9mm 0 0;
  color: #a5b4fc;
  font-size: 9pt;
  font-weight: 600;
}

.nn-time {
  margin: 0;
  color: #7dd3fc;
  font-size: 8.5pt;
  font-weight: 600;
  white-space: nowrap;
}

.nn-points {
  margin: 2.1mm 0 0;
  padding-left: 4mm;
}

.nn-points li {
  color: #dbeafe;
  font-size: 9pt;
}

.nn-points li + li {
  margin-top: 1mm;
}

.nn-links {
  margin: 0;
  padding: 0;
  list-style: none;
}

.nn-links li + li {
  margin-top: 1.7mm;
}

.nn-links a {
  color: #67e8f9;
  text-decoration: none;
  font-size: 8.7pt;
  font-weight: 600;
}

.nn-skill-group + .nn-skill-group {
  margin-top: 2.8mm;
}

.nn-skill-label {
  margin: 0 0 0.9mm;
  color: #c4b5fd;
  font-size: 8.2pt;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.nn-skill-line {
  margin: 0;
  color: #dbeafe;
  font-size: 8.9pt;
}

@media print {
  .nn-root {
    min-height: auto;
  }
}
`;