import { NextResponse } from "next/server";
import { configFromHeaders, openrouter, resolveModel } from "@/lib/openrouter";

export const runtime = "nodejs";

// Cheap call to confirm the supplied OpenRouter key works and the chosen model
// is reachable. Returns 200 with `{ ok: true, model }` or 4xx/5xx with reason.
export async function POST(request: Request) {
  const config = configFromHeaders(request.headers);
  if (!config.apiKey) {
    return NextResponse.json({ error: "Falta a chave no header X-Openrouter-Key" }, { status: 400 });
  }
  try {
    const client = openrouter(config);
    const model = resolveModel(config);
    const r = await client.chat.completions.create({
      model,
      max_tokens: 5,
      temperature: 0,
      messages: [{ role: "user", content: "ping" }],
    });
    return NextResponse.json({
      ok: true,
      model,
      sample: r.choices[0]?.message?.content?.slice(0, 40) ?? "",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
