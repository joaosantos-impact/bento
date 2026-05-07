import { NextResponse } from "next/server";
import { z } from "zod";
import { generateFullReport } from "@/lib/claude/generate-full-report";
import { configFromHeaders } from "@/lib/openrouter";

export const runtime = "nodejs";
export const maxDuration = 120; // up to 2 min for heavy reports

const BodySchema = z.object({
  tipo: z.enum(["AT", "AUTO"]),
  contexto: z.string().min(20, "Contexto demasiado curto"),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validação falhou", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const data = await generateFullReport({
      tipo: parsed.data.tipo,
      contexto: parsed.data.contexto,
      config: configFromHeaders(request.headers),
    });
    return NextResponse.json({ data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
