import { type RuntimeConfig, openrouter, resolveModel } from "@/lib/openrouter";
import { CAPT_VISION_RULES } from "./system-prompts";

export type AnalyzePhotoInput = {
  imageDataUrl: string;
  hint?: string;
  config?: RuntimeConfig;
};

export async function analyzePhoto(input: AnalyzePhotoInput): Promise<string> {
  const client = openrouter(input.config);
  const model = resolveModel(input.config ?? {});
  const userText = input.hint?.trim()
    ? `Contexto fornecido pelo utilizador: ${input.hint.trim()}\n\nDescreve/transcreve agora factualmente o que vês na imagem.`
    : `Descreve/transcreve factualmente o que vês na imagem.`;

  const response = await client.chat.completions.create({
    model,
    temperature: 0.1,
    messages: [
      { role: "system", content: CAPT_VISION_RULES },
      {
        role: "user",
        content: [
          { type: "text", text: userText },
          { type: "image_url", image_url: { url: input.imageDataUrl } },
        ],
      },
    ],
  });

  return response.choices[0]?.message?.content?.trim() ?? "";
}
