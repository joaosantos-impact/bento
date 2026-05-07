import { NextResponse } from "next/server";
import { AutoReportSchema } from "@/lib/schemas/auto-report";
import { renderAutoReport } from "@/lib/docx/render-auto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = AutoReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validação falhou", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const docx = await renderAutoReport(parsed.data);
  const filename = `relatorio-auto-${parsed.data.header?.numeroRelatorio || "sem-numero"}.docx`;
  return new NextResponse(docx as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
