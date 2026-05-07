import { NextResponse } from "next/server";
import { z } from "zod";
import { generateSection } from "@/lib/claude/generate-section";
import { seccaoPorId } from "@/lib/claude/sections";
import { configFromHeaders } from "@/lib/openrouter";

export const runtime = "nodejs";

const BodySchema = z.object({
  tipo: z.enum(["AT", "AUTO"]),
  seccaoId: z.string(),
  contexto: z.record(z.string(), z.unknown()).optional().default({}),
  factos: z.string().min(1, "factos é obrigatório"),
  modeloPesado: z.boolean().optional(),
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
    return NextResponse.json({ error: "Validação falhou", details: parsed.error.flatten() }, { status: 400 });
  }
  const seccao = seccaoPorId(parsed.data.tipo, parsed.data.seccaoId);
  if (!seccao) {
    return NextResponse.json({ error: `Secção desconhecida: ${parsed.data.seccaoId}` }, { status: 400 });
  }
  try {
    const texto = await generateSection({
      tipo: parsed.data.tipo,
      seccao,
      contexto: parsed.data.contexto,
      factos: parsed.data.factos,
      modeloPesado: parsed.data.modeloPesado,
      config: configFromHeaders(request.headers),
    });
    return NextResponse.json({ texto });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
