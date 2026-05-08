import { type RuntimeConfig, openrouter, resolveModel } from "@/lib/openrouter";
import { CAPT_BASE_RULES, CAPT_OUTPUT_RULES_TEXT, captFewShot } from "./system-prompts";
import { type SectionDef } from "./sections";

export type GenerateSectionInput = {
  tipo: "AT" | "AUTO";
  seccao: SectionDef;
  contexto: Record<string, unknown>;
  factos: string;
  config?: RuntimeConfig;
};

export async function generateSection(input: GenerateSectionInput): Promise<string> {
  const { tipo, seccao, contexto, factos, config } = input;
  const client = openrouter(config);
  const model = resolveModel(config ?? {});

  const userPrompt = `TIPO DE RELATÓRIO: ${tipo === "AT" ? "Acidente de Trabalho" : "Sinistro Automóvel"}

SECÇÃO A REDIGIR:
- ID: ${seccao.id}
- Título: ${seccao.titulo}
- O que vai aqui: ${seccao.descricao}

CONTEXTO JÁ PREENCHIDO (referência apenas, não reescrever):
${JSON.stringify(contexto, null, 2)}

FACTOS BRUTOS PARA ESTA SECÇÃO (dados pelo utilizador):
"""
${factos.trim()}
"""

Redige a secção "${seccao.titulo}" no estilo CAPT (segue rigorosamente os exemplos do system prompt).

REGRAS:
- A secção tem de ser sempre preenchida com texto profissional, mesmo que os factos sejam escassos. Deduz, infere e analisa profissionalmente a partir do contexto disponível.
- Para factos verificáveis (nomes, NIFs, datas concretas) que não constem do contexto, usa "[a confirmar]" — NÃO inventes.
- Para conclusões / apreciações / análises, NUNCA deixes vazio. Escreve um parágrafo robusto com enquadramento técnico-jurídico.`;

  const response = await client.chat.completions.create({
    model,
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: `${CAPT_BASE_RULES}\n\n${captFewShot(tipo)}\n\n${CAPT_OUTPUT_RULES_TEXT}`,
      },
      { role: "user", content: userPrompt },
    ],
  });

  return response.choices[0]?.message?.content?.trim() ?? "";
}
