import { z } from "zod";
import { type RuntimeConfig, openrouter, resolveModel } from "@/lib/openrouter";
import { CAPT_BASE_RULES, CAPT_OUTPUT_RULES_JSON } from "./system-prompts";
import { seccoesPorTipo } from "./sections";

export type RouteInputResult = Array<{
  seccaoId: string;
  fragmento: string;
}>;

const FragmentoSchema = z.object({
  seccaoId: z.string(),
  fragmento: z.string(),
});

const ResultSchema = z.object({
  fragmentos: z.array(FragmentoSchema),
});

export async function routeInput(
  tipo: "AT" | "AUTO",
  inputBruto: string,
  config?: RuntimeConfig,
): Promise<RouteInputResult> {
  const client = openrouter(config);
  const model = resolveModel(config ?? {}, false);
  const seccoes = seccoesPorTipo(tipo);
  const seccoesList = seccoes
    .map((s) => `- "${s.id}" — ${s.titulo}: ${s.descricao}`)
    .join("\n");

  const userPrompt = `TIPO DE RELATÓRIO: ${tipo === "AT" ? "Acidente de Trabalho" : "Sinistro Automóvel"}

SECÇÕES DISPONÍVEIS:
${seccoesList}

INPUT BRUTO DO AVERIGUADOR (texto longo, possivelmente desorganizado):
"""
${inputBruto.trim()}
"""

TAREFA: divide este input em fragmentos relevantes e atribui cada um à secção correspondente.

REGRAS:
- Cada fragmento deve ser um trecho útil do input bruto, COPIADO sem alterações ou parafraseado de forma muito leve.
- Não inventes informação que não esteja no input.
- Um mesmo fragmento PODE ser atribuído a múltiplas secções se for relevante para várias.
- Se uma parte do input não se encaixa em nenhuma secção, ignora-a.
- Devolve JSON com a estrutura: { "fragmentos": [{ "seccaoId": "<id>", "fragmento": "<texto>" }] }`;

  const response = await client.chat.completions.create({
    model,
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: `${CAPT_BASE_RULES}\n\n${CAPT_OUTPUT_RULES_JSON}` },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices[0]?.message?.content?.trim() ?? "{}";
  const parsed = ResultSchema.safeParse(JSON.parse(content));
  if (!parsed.success) return [];
  return parsed.data.fragmentos;
}
