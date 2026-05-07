"use client";
import { useRouter } from "next/navigation";
import { createProcesso } from "@/lib/storage/local-store";
import { type ProcessoTipo } from "@/lib/types";

const OPTIONS: Array<{
  tipo: ProcessoTipo;
  titulo: string;
  descricao: string;
}> = [
  {
    tipo: "AT",
    titulo: "Acidente de Trabalho",
    descricao:
      "Relatório de averiguação para acidentes de trabalho. ~30 campos estruturados e 5 secções narrativas.",
  },
  {
    tipo: "AUTO",
    titulo: "Sinistro Automóvel (CIDS / IDS)",
    descricao:
      "Relatório de averiguação para sinistros automóvel. Múltiplos intervenientes, perfil detalhado da via, danos com altimetria.",
  },
];

export default function NovoProcessoPage() {
  const router = useRouter();

  function handleSelect(tipo: ProcessoTipo) {
    const p = createProcesso(tipo);
    router.push(`/processos/${p.id}`);
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Novo processo</h1>
      <p className="mb-8 text-sm text-zinc-500">
        Escolhe o tipo de relatório que queres preencher.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.tipo}
            type="button"
            onClick={() => handleSelect(opt.tipo)}
            className="rounded-lg border border-zinc-200 bg-white p-6 text-left transition hover:border-zinc-400 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
          >
            <span
              className={
                "inline-block rounded px-1.5 py-0.5 text-xs font-medium " +
                (opt.tipo === "AT"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                  : "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200")
              }
            >
              {opt.tipo}
            </span>
            <h2 className="mt-3 text-lg font-medium">{opt.titulo}</h2>
            <p className="mt-2 text-sm text-zinc-500">{opt.descricao}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
