import { type AtReport } from "@/lib/schemas/at-report";
import { type AutoReport } from "@/lib/schemas/auto-report";

export type ProcessoTipo = "AT" | "AUTO";

export type Processo =
  | {
      id: string;
      tipo: "AT";
      titulo: string;
      data: AtReport;
      createdAt: string;
      updatedAt: string;
    }
  | {
      id: string;
      tipo: "AUTO";
      titulo: string;
      data: AutoReport;
      createdAt: string;
      updatedAt: string;
    };

export function processoTitulo(p: Processo): string {
  if (p.titulo?.trim()) return p.titulo;
  const h = p.data.header;
  if (h?.assunto) return h.assunto;
  if (h?.numeroRelatorio) return `Relatório ${h.numeroRelatorio}`;
  return "Sem título";
}
