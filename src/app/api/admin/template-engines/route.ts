import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { runTemplateParityChecks } from "@/lib/layout/parityChecks";
import { TEMPLATES } from "@/lib/templates/registry";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const includeParity = url.searchParams.get("includeParity") === "1";

  const templates = TEMPLATES.map((template) => ({
    id: template.id,
    name: template.name,
    renderEngine: template.renderEngine,
  }));

  const layoutCount = templates.filter((template) => template.renderEngine === "layout").length;
  const htmlCount = templates.length - layoutCount;

  if (!includeParity) {
    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      summary: {
        total: templates.length,
        layout: layoutCount,
        html: htmlCount,
      },
      templates,
    });
  }

  const parityResults = await runTemplateParityChecks();
  const parityByTemplate = parityResults.map((result) => ({
    templateId: result.templateId,
    templateName: result.templateName,
    renderEngine: result.renderEngine,
    allFixturesMatched: result.allFixturesMatched,
    fixtures: result.fixtures,
  }));

  const parityCandidates = parityByTemplate
    .filter((template) => template.renderEngine === "html" && template.allFixturesMatched)
    .map((template) => ({
      id: template.templateId,
      name: template.templateName,
    }));

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    summary: {
      total: templates.length,
      layout: layoutCount,
      html: htmlCount,
      parityCandidates: parityCandidates.length,
    },
    templates,
    parity: {
      fixturesChecked: parityByTemplate[0]?.fixtures.length ?? 0,
      candidates: parityCandidates,
      templates: parityByTemplate,
    },
  });
}
