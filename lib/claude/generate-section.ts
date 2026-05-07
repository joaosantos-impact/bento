import { type RuntimeConfig, openrouter, resolveModel } from "@/lib/openrouter";
import { CAPT_BASE_RULES, CAPT_OUTPUT_RULES_TEXT } from "./system-prompts";
import { type SectionDef } from "./sections";

export type GenerateSectionInput = {
  tipo: "AT" | "AUTO";
  seccao: SectionDef;
  contexto: Record<string, unknown>;
  factos: string;
  modeloPesado?: boolean;
  config?: RuntimeConfig;
};

export async function generateSection(input: GenerateSectionInput): Promise<string> {
  const { tipo, seccao, contexto, factos, modeloPesado, config } = input;
  const client = openrouter(config);
  const model = resolveModel(config ?? {}, modeloPesado);

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

Redige a secção "${seccao.titulo}" com base estritamente nestes factos brutos. Não inventes nada além do que está aqui. Se faltarem dados para uma frase, omite a frase ou marca "[a confirmar]".`;

  const response = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      { role: "system", content: `${CAPT_BASE_RULES}\n\n${CAPT_OUTPUT_RULES_TEXT}` },
      { role: "user", content: userPrompt },
    ],
  });

  return response.choices[0]?.message?.content?.trim() ?? "";
}
