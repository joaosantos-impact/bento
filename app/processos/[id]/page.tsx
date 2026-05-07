"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteProcesso, getProcesso, updateProcesso } from "@/lib/storage/local-store";
import { type Processo } from "@/lib/types";
import { type AtReport } from "@/lib/schemas/at-report";
import { type AutoReport } from "@/lib/schemas/auto-report";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { AtEditor } from "./at-editor";
import { AutoEditor } from "./auto-editor";
import { CaptureScreen } from "./capture-screen";

type Mode = "capture" | "review";

function hasContent(p: Processo): boolean {
  const d = p.data;
  if (d.header?.assunto?.trim()) return true;
  if (d.header?.numeroRelatorio?.trim()) return true;
  if (d.conclusoes?.trim()) return true;
  if (d.apreciacaoTecnica?.trim()) return true;
  return false;
}

export default function ProcessoEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const confirm = useConfirm();
  const toast = useToast();

  const [processo, setProcesso] = useState<Processo | null | undefined>(undefined);
  const [mode, setMode] = useState<Mode>("capture");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const p = getProcesso(id);
    setProcesso(p);
    if (p && hasContent(p)) setMode("review");
  }, [id]);

  if (processo === undefined) {
    return <p className="text-sm text-zinc-500">A carregar…</p>;
  }
  if (processo === null) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <h1 className="text-lg font-semibold">Processo não encontrado</h1>
        <p className="mt-2 text-sm text-zinc-500">
          O processo pode ter sido apagado ou o link está inválido.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Voltar à lista
        </Link>
      </div>
    );
  }

  function handleGenerated(data: AtReport | AutoReport) {
    if (!processo) return;
    const titulo = data.header?.assunto ?? "";
    let next: Processo;
    if (processo.tipo === "AT" && data.tipo === "AT") {
      next = { ...processo, data, titulo };
    } else if (processo.tipo === "AUTO" && data.tipo === "AUTO") {
      next = { ...processo, data, titulo };
    } else {
      toast("Erro: tipo de relatório inconsistente", "error");
      return;
    }
    const saved = updateProcesso(next);
    setProcesso(saved);
    setMode("review");
  }

  async function handleDelete() {
    if (!processo) return;
    const ok = await confirm({
      title: "Apagar processo",
      message: "Tens a certeza? Esta acção não pode ser revertida.",
      confirmLabel: "Apagar",
      variant: "destructive",
    });
    if (!ok) return;
    deleteProcesso(processo.id);
    toast("Processo apagado", "success");
    router.push("/");
  }

  async function handleExport() {
    if (!processo) return;
    setExporting(true);
    try {
      const path = processo.tipo === "AT" ? "/api/exportar/at" : "/api/exportar/auto";
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processo.data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast(`Erro ao exportar: ${err.error ?? "desconhecido"}`, "error");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-${processo.tipo.toLowerCase()}-${processo.data.header?.numeroRelatorio || "sem-numero"}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Relatório exportado", "success");
    } catch {
      toast("Erro ao exportar", "error");
    } finally {
      setExporting(false);
    }
  }

  const tipoColor =
    processo.tipo === "AT"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
      : "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200";

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${tipoColor}`}>
            {processo.tipo}
          </span>
          <h1 className="mt-2 text-2xl font-semibold">
            {processo.data.header?.assunto || "Relatório sem título"}
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Última gravação: {new Date(processo.updatedAt).toLocaleString("pt-PT")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setMode("capture")}
              className={
                "rounded-l-md px-3 py-1.5 text-sm transition " +
                (mode === "capture"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-800")
              }
            >
              Captura
            </button>
            <button
              type="button"
              onClick={() => setMode("review")}
              className={
                "rounded-r-md border-l border-zinc-200 px-3 py-1.5 text-sm transition dark:border-zinc-700 " +
                (mode === "review"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-800")
              }
            >
              Revisão
            </button>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-500 hover:border-red-400 hover:text-red-600 dark:border-zinc-700"
          >
            Apagar
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {exporting ? "A gerar…" : "Exportar DOCX"}
          </button>
        </div>
      </header>

      {mode === "capture" ? (
        <CaptureScreen processo={processo} onGenerated={handleGenerated} />
      ) : processo.tipo === "AT" ? (
        <AtEditor processo={processo} hideHeader />
      ) : (
        <AutoEditor processo={processo} hideHeader />
      )}
    </div>
  );
}
