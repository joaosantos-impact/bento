import { z } from "zod";

const optionalText = z.string().optional().default("");

export const HeaderSchema = z.object({
  numeroRelatorio: optionalText,
  seguradora: optionalText,
  supervisor: optionalText,
  apolice: optionalText,
  processoOcorrencia: optionalText,
  numeroSinistro: optionalText,
  assunto: optionalText,
  encServ: optionalText,
});
export type Header = z.infer<typeof HeaderSchema>;

export const PessoaSchema = z.object({
  nome: optionalText,
  nif: optionalText,
  morada: optionalText,
  contacto: optionalText,
});
export type Pessoa = z.infer<typeof PessoaSchema>;

export const PESSOA_FIELD_KEYS = ["nome", "nif", "morada", "contacto"] as const;

// Replaces empty strings according to the field type so the rendered DOCX is always
// readable. Caller decides whether a field is "structured" (short, like NIF) or
// "narrative" (long block, like Apreciação Técnica).
export function renderValue(value: string | undefined, kind: "structured" | "narrative"): string {
  const v = (value ?? "").trim();
  if (v) return v;
  return kind === "structured" ? "—" : "[a confirmar]";
}
