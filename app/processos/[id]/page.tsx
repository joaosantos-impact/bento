"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getProcesso } from "@/lib/storage/local-store";
import { type Processo } from "@/lib/types";
import { AtEditor } from "./at-editor";
import { AutoEditor } from "./auto-editor";

export default function ProcessoEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [processo, setProcesso] = useState<Processo | null | undefined>(undefined);

  useEffect(() => {
    setProcesso(getProcesso(id));
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

  if (processo.tipo === "AT") return <AtEditor processo={processo} />;
  return <AutoEditor processo={processo} />;
}
