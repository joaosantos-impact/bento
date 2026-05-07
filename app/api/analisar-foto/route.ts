import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzePhoto } from "@/lib/claude/analyze-photo";
import { configFromHeaders } from "@/lib/openrouter";

export const runtime = "nodejs";

const BodySchema = z.object({
  imageDataUrl: z.string().startsWith("data:"),
  hint: z.string().optional(),
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
  try {
    const descricao = await analyzePhoto({
      imageDataUrl: parsed.data.imageDataUrl,
      hint: parsed.data.hint,
      config: configFromHeaders(request.headers),
    });
    return NextResponse.json({ descricao });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
