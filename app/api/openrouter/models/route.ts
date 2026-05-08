import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Proxies the user's request to OpenRouter's /models endpoint with their key.
// We don't cache because the user might rotate keys per device.
export async function GET(request: Request) {
  const apiKey = request.headers.get("x-openrouter-key");
  if (!apiKey) {
    return NextResponse.json({ error: "Falta chave no header X-Openrouter-Key" }, { status: 400 });
  }
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `OpenRouter ${res.status}: ${text.slice(0, 300)}` },
        { status: 502 },
      );
    }
    const json = await res.json();
    return NextResponse.json(json);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
