import { NextResponse } from "next/server";
import { AtReportSchema } from "@/lib/schemas/at-report";
import { renderAtReport } from "@/lib/docx/render-at";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = AtReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validação falhou", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const docx = await renderAtReport(parsed.data);
  const filename = `relatorio-at-${parsed.data.header?.numeroRelatorio || "sem-numero"}.docx`;
  return new NextResponse(docx as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
