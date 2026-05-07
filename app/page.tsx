"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteProcesso, listProcessos } from "@/lib/storage/local-store";
import { type Processo, processoTitulo } from "@/lib/types";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

export default function ProcessosPage() {
  const [processos, setProcessos] = useState<Processo[] | null>(null);
  const confirm = useConfirm();
  const toast = useToast();

  useEffect(() => {
    setProcessos(listProcessos());
  }, []);

  async function handleDelete(id: string, titulo: string) {
    const ok = await confirm({
      title: "Apagar processo",
      message: `Tens a certeza que queres apagar "${titulo}"? Esta acção não pode ser revertida.`,
      confirmLabel: "Apagar",
      variant: "destructive",
    });
    if (!ok) return;
    deleteProcesso(id);
    setProcessos(listProcessos());
    toast("Processo apagado", "success");
  }

  if (processos === null) {
    return <p className="text-sm text-zinc-500">A carregar…</p>;
  }

  if (processos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <h1 className="text-lg font-semibold">Sem processos ainda</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Cria o teu primeiro relatório de averiguação.
        </p>
        <Link
          href="/processos/novo"
          className="mt-6 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Novo processo
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Processos</h1>
      <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
        {processos.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <Link href={`/processos/${p.id}`} className="flex-1 group">
              <div className="flex items-center gap-3">
                <span
                  className={
                    "rounded px-1.5 py-0.5 text-xs font-medium " +
                    (p.tipo === "AT"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                      : "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200")
                  }
                >
                  {p.tipo}
                </span>
                <span className="font-medium group-hover:underline">{processoTitulo(p)}</span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Actualizado {new Date(p.updatedAt).toLocaleString("pt-PT")}
              </p>
            </Link>
            <button
              type="button"
              onClick={() => handleDelete(p.id, processoTitulo(p))}
              className="text-xs text-zinc-400 hover:text-red-600"
            >
              Apagar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
