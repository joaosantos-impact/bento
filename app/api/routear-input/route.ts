import { NextResponse } from "next/server";
import { z } from "zod";
import { routeInput } from "@/lib/claude/route-input";
import { configFromHeaders } from "@/lib/openrouter";

export const runtime = "nodejs";

const BodySchema = z.object({
  tipo: z.enum(["AT", "AUTO"]),
  inputBruto: z.string().min(1),
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
    const fragmentos = await routeInput(
      parsed.data.tipo,
      parsed.data.inputBruto,
      configFromHeaders(request.headers),
    );
    return NextResponse.json({ fragmentos });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
