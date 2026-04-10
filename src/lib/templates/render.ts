import Handlebars from "handlebars/dist/handlebars.js";
import type { ResumeData } from "@/types/resume";
import { toTemplateContext } from "./context";
import { modernProfessionalBody } from "./modern-professional/body.hbs";
import { modernProfessionalCss } from "./modern-professional/styles.css";
import { minimalCleanBody } from "./minimal-clean/body.hbs";
import { minimalCleanCss } from "./minimal-clean/styles.css";
import { creativeDesignerBody } from "./creative-designer/body.hbs";
import { creativeDesignerCss } from "./creative-designer/styles.css";
import { executivePortraitBody } from "./executive-portrait/body.hbs";
import { executivePortraitCss } from "./executive-portrait/styles.css";
import { profileEdgeBody } from "./profile-edge/body.hbs";
import { profileEdgeCss } from "./profile-edge/styles.css";
import { canvaStandardBody } from "./canva-standard/body.hbs";
import { canvaStandardCss } from "./canva-standard/styles.css";
import { luminaryBody } from "./luminary/body.hbs";
import { luminaryCss } from "./luminary/styles.css";
import { slateSidebarBody } from "./slate-sidebar/body.hbs";
import { slateSidebarCss } from "./slate-sidebar/styles.css";
import { DEFAULT_TEMPLATE_ID } from "./registry";

const fontLinks = `
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;1,9..40,400&family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet"/>
`;

const basePrintCss = `
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #fff; }
body {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  text-rendering: optimizeLegibility;
  overflow-wrap: anywhere;
}
img {
  display: block;
  max-width: 100%;
}
a {
  overflow-wrap: anywhere;
}
p, li {
  orphans: 3;
  widows: 3;
}
section, article, .job, .edu, .skill-cat, .skill-row, .skill-block, .side-block, .contact-cell {
  break-inside: avoid;
  page-break-inside: avoid;
}
`;

const compilers: Record<string, { compile: Handlebars.TemplateDelegate; css: string }> = {
  "modern-professional": {
    compile: Handlebars.compile(modernProfessionalBody),
    css: modernProfessionalCss,
  },
  "minimal-clean": {
    compile: Handlebars.compile(minimalCleanBody),
    css: minimalCleanCss,
  },
  "creative-designer": {
    compile: Handlebars.compile(creativeDesignerBody),
    css: creativeDesignerCss,
  },
  "executive-portrait": {
    compile: Handlebars.compile(executivePortraitBody),
    css: executivePortraitCss,
  },
  "profile-edge": {
    compile: Handlebars.compile(profileEdgeBody),
    css: profileEdgeCss,
  },
  "canva-standard": {
    compile: Handlebars.compile(canvaStandardBody),
    css: canvaStandardCss,
  },
  "luminary": {
    compile: Handlebars.compile(luminaryBody),
    css: luminaryCss,
  },
  "slate-sidebar": {
    compile: Handlebars.compile(slateSidebarBody),
    css: slateSidebarCss,
  },
};

export function listTemplateIds(): string[] {
  return Object.keys(compilers);
}

export function renderResumeBody(templateId: string, data: ResumeData): string {
  const id = compilers[templateId] ? templateId : DEFAULT_TEMPLATE_ID;
  const ctx = toTemplateContext(data);
  return compilers[id].compile(ctx);
}

export function renderResumeStyles(templateId: string): string {
  const id = compilers[templateId] ? templateId : DEFAULT_TEMPLATE_ID;
  return compilers[id].css;
}

/**
 * Full HTML document — identical string used for iframe preview and Browserless PDF.
 */
export function renderResumeDocument(templateId: string, data: ResumeData): string {
  const body = renderResumeBody(templateId, data);
  const css = renderResumeStyles(templateId);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
${fontLinks}
<style>${basePrintCss}${css}</style>
</head>
<body>${body}</body>
</html>`;
}
