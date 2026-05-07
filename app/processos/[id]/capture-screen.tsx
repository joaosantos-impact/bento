"use client";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { SparkleIcon } from "@/components/ui/sparkle-icon";
import { AudioRecorder } from "@/components/capture/audio-recorder";
import { AttachmentsZone, type Attachment } from "@/components/capture/attachments-zone";
import { callAi } from "@/lib/client/api";
import { type Processo } from "@/lib/types";
import { type AtReport } from "@/lib/schemas/at-report";
import { type AutoReport } from "@/lib/schemas/auto-report";

type Props = {
  processo: Processo;
  onGenerated: (data: AtReport | AutoReport) => void;
};

export function CaptureScreen({ processo, onGenerated }: Props) {
  const [contexto, setContexto] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [generating, setGenerating] = useState(false);
  const toast = useToast();

  function appendText(text: string) {
    setContexto((c) => (c.trim() ? `${c.trim()}\n\n${text}` : text));
  }

  function buildFullContext(): string {
    const blocks: string[] = [];
    if (contexto.trim()) blocks.push(contexto.trim());
    attachments.forEach((a, i) => {
      if (a.description?.trim()) {
        blocks.push(`[Anexo ${i + 1} — ${a.name}]\n${a.description.trim()}`);
      }
    });
    return blocks.join("\n\n---\n\n");
  }

  const fullContext = buildFullContext();
  const stillAnalyzing = attachments.some((a) => a.analyzing);
  const hasMinimum = fullContext.trim().length >= 20;

  async function handleGenerate() {
    if (stillAnalyzing) {
      toast("Espera que as fotos acabem de ser analisadas.", "error");
      return;
    }
    if (!hasMinimum) {
      toast("Adiciona mais contexto antes de gerar.", "error");
      return;
    }
    setGenerating(true);
    try {
      const res = await callAi("/api/gerar-relatorio", {
        tipo: processo.tipo,
        contexto: fullContext,
      });
      const json = await res.json();
      if (!res.ok) {
        toast(`Erro a gerar: ${json.error ?? "desconhecido"}`, "error");
        return;
      }
      onGenerated(json.data);
      toast("Relatório gerado. Revê os campos antes de exportar.", "success");
    } catch {
      toast("Erro ao chamar o modelo", "error");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold">Notas, voz e anexos</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Cola, escreve, dita ou anexa <strong>TUDO</strong> o que sabes do caso. Quando terminares,
          o Claude lê o conjunto e preenche o relatório inteiro de uma vez.
        </p>

        <div className="mt-5">
          <div className="mb-1.5 flex items-end justify-between">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Notas (texto e voz)
            </span>
            <AudioRecorder onTranscript={appendText} />
          </div>
          <textarea
            value={contexto}
            onChange={(e) => setContexto(e.target.value)}
            rows={14}
            placeholder={`Exemplo:

O sinistrado é o sr. Carlito, vigilante na Ronsegur, em Portimão. Acidente em 13/03/2026 pelas 20h00 no Centro de Congressos do Arade.

Versão dele: chegou 10 min mais cedo, viu painéis de protecção caídos à entrada, levantou um bloco de cimento com o braço esquerdo. Lavou as mãos, fez a noite toda. No dia seguinte acordou com o bícipe caído.

Na ficha de participação dizia 13/04 às 21h e só 1h trabalhada. Inconsistência clara.

Hospital: deu entrada no S. Camilo a 17/03 (4 dias depois). Pré-existência: consulta de ortopedia em 04/02. Negou no internamento (escreveram "nega AP")...`}
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>

        <div className="mt-6">
          <div className="mb-1.5 flex items-end justify-between">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Fotos & documentos
            </span>
            <span className="text-xs text-zinc-400">
              fotos do local, documentos clínicos, declarações, prints…
            </span>
          </div>
          <AttachmentsZone attachments={attachments} onChange={setAttachments} />
        </div>

        <p className="mt-4 text-xs text-zinc-400">
          {fullContext.length} caracteres no total
          {attachments.length > 0
            ? ` · ${attachments.length} anexo${attachments.length === 1 ? "" : "s"}`
            : ""}
          {stillAnalyzing ? " · análise de fotos em curso…" : ""}
        </p>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={generating || !hasMinimum || stillAnalyzing}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-6 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <SparkleIcon className="h-5 w-5 text-white" />
        {generating
          ? "A gerar relatório completo… (pode demorar 30–60s)"
          : "Gerar relatório completo"}
      </button>
      {!hasMinimum && (
        <p className="text-center text-xs text-zinc-400">
          Escreve, dita ou anexa fotos com algum contexto antes de gerar.
        </p>
      )}
    </div>
  );
}
