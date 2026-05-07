"use client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { type AtReport } from "@/lib/schemas/at-report";
import { type Processo } from "@/lib/types";
import { deleteProcesso, updateProcesso } from "@/lib/storage/local-store";
import { TextField } from "@/components/form/field";
import { Card } from "@/components/form/card";
import { NarrativeField } from "@/components/form/narrative-field";
import { useAutoSave } from "@/lib/hooks/use-autosave";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { SaveStatus } from "@/components/ui/save-status";

type Props = { processo: Extract<Processo, { tipo: "AT" }>; hideHeader?: boolean };

export function AtEditor({ processo, hideHeader }: Props) {
  const router = useRouter();
  const [data, setData] = useState<AtReport>(processo.data);
  const [exporting, setExporting] = useState(false);
  const confirm = useConfirm();
  const toast = useToast();

  const update = useCallback(<K extends keyof AtReport>(key: K, value: AtReport[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateNested = useCallback(
    <S extends "header" | "segurado" | "sinistrado">(
      section: S,
      key: keyof NonNullable<AtReport[S]>,
      value: string,
    ) => {
      setData((prev) => {
        const sectionData = (prev[section] ?? {}) as Record<string, string>;
        return { ...prev, [section]: { ...sectionData, [key]: value } };
      });
    },
    [],
  );

  const persist = useCallback(
    (next: AtReport) => {
      updateProcesso({ ...processo, data: next, titulo: next.header?.assunto ?? "" });
    },
    [processo],
  );

  const { status, lastSavedAt } = useAutoSave(data, persist);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/exportar/at", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
      a.download = `relatorio-at-${data.header?.numeroRelatorio || "sem-numero"}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Relatório exportado", "success");
    } catch {
      toast("Erro ao exportar relatório", "error");
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    const ok = await confirm({
      title: "Apagar processo",
      message: "Tens a certeza que queres apagar este processo? Esta acção não pode ser revertida.",
      confirmLabel: "Apagar",
      variant: "destructive",
    });
    if (!ok) return;
    deleteProcesso(processo.id);
    toast("Processo apagado", "success");
    router.push("/");
  }

  const h = data.header;
  const seg = data.segurado;
  const sin = data.sinistrado;

  return (
    <div className="space-y-6">
      {hideHeader ? (
        <SaveStatus status={status} lastSavedAt={lastSavedAt} fallbackAt={processo.updatedAt} />
      ) : (
        <header className="flex items-center justify-between">
          <div>
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
              AT
            </span>
            <h1 className="mt-2 text-2xl font-semibold">
              {data.header?.assunto || "Relatório sem título"}
            </h1>
            <SaveStatus status={status} lastSavedAt={lastSavedAt} fallbackAt={processo.updatedAt} />
          </div>
          <div className="flex items-center gap-2">
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
      )}

      <Card title="Identificação do processo">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Relatório nº" name="numeroRelatorio" value={h?.numeroRelatorio} onChange={(v) => updateNested("header", "numeroRelatorio", v)} />
          <TextField label="Seguradora" name="seguradora" value={h?.seguradora} onChange={(v) => updateNested("header", "seguradora", v)} />
          <TextField label="Supervisor" name="supervisor" value={h?.supervisor} onChange={(v) => updateNested("header", "supervisor", v)} />
          <TextField label="Apólice nº" name="apolice" value={h?.apolice} onChange={(v) => updateNested("header", "apolice", v)} />
          <TextField label="Proc./Ocorr. nº" name="processoOcorrencia" value={h?.processoOcorrencia} onChange={(v) => updateNested("header", "processoOcorrencia", v)} />
          <TextField label="Sinistro nº" name="numeroSinistro" value={h?.numeroSinistro} onChange={(v) => updateNested("header", "numeroSinistro", v)} />
          <TextField label="Assunto" name="assunto" value={h?.assunto} onChange={(v) => updateNested("header", "assunto", v)} />
          <TextField label="Enc./Serv. nº" name="encServ" value={h?.encServ} onChange={(v) => updateNested("header", "encServ", v)} />
        </div>
      </Card>

      <Card title="Segurado (entidade empregadora)">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Nome" name="seg_nome" value={seg?.nome} onChange={(v) => updateNested("segurado", "nome", v)} />
          <TextField label="NIF" name="seg_nif" value={seg?.nif} onChange={(v) => updateNested("segurado", "nif", v)} />
          <TextField label="Morada" name="seg_morada" value={seg?.morada} onChange={(v) => updateNested("segurado", "morada", v)} />
          <TextField label="Contacto" name="seg_contacto" value={seg?.contacto} onChange={(v) => updateNested("segurado", "contacto", v)} />
          <TextField label="Atividade" name="seg_atividade" value={seg?.atividade} onChange={(v) => updateNested("segurado", "atividade", v)} />
          <TextField label="CAE" name="seg_cae" value={seg?.cae} onChange={(v) => updateNested("segurado", "cae", v)} />
          <TextField label="Nº de trabalhadores" name="seg_n_trabalhadores" value={seg?.numeroTrabalhadores} onChange={(v) => updateNested("segurado", "numeroTrabalhadores", v)} />
          <TextField label="Serviços de SST" name="seg_sst" value={seg?.servicosSst} onChange={(v) => updateNested("segurado", "servicosSst", v)} />
        </div>
        <NarrativeField label="Resultado da avaliação do acidente por parte da empresa" name="seg_avaliacao" value={seg?.avaliacao} onChange={(v) => updateNested("segurado", "avaliacao", v)} tipo="AT" seccaoId="segurado.avaliacao" contexto={data} />
      </Card>

      <Card title="Sinistrado">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Nome" name="sin_nome" value={sin?.nome} onChange={(v) => updateNested("sinistrado", "nome", v)} />
          <TextField label="NIF" name="sin_nif" value={sin?.nif} onChange={(v) => updateNested("sinistrado", "nif", v)} />
          <TextField label="Morada" name="sin_morada" value={sin?.morada} onChange={(v) => updateNested("sinistrado", "morada", v)} />
          <TextField label="Contacto" name="sin_contacto" value={sin?.contacto} onChange={(v) => updateNested("sinistrado", "contacto", v)} />
          <TextField label="Idade" name="sin_idade" value={sin?.idade} onChange={(v) => updateNested("sinistrado", "idade", v)} />
          <TextField label="Profissão" name="sin_profissao" value={sin?.profissao} onChange={(v) => updateNested("sinistrado", "profissao", v)} />
        </div>
        <NarrativeField label="Lesões" name="sin_lesoes" value={sin?.lesoes} onChange={(v) => updateNested("sinistrado", "lesoes", v)} tipo="AT" seccaoId="sinistrado.lesoes" contexto={data} />
      </Card>

      <Card title="1. Data e hora · Horário">
        <TextField label="Data e hora do sinistro" name="dataHoraSinistro" value={data.dataHoraSinistro} onChange={(v) => update("dataHoraSinistro", v)} placeholder="ex: 13/03/2026 — 20h00" />
        <NarrativeField label="1.1 Horário de trabalho do sinistrado" name="horarioTrabalho" value={data.horarioTrabalho} onChange={(v) => update("horarioTrabalho", v)} tipo="AT" seccaoId="horarioTrabalho" contexto={data} />
      </Card>

      <Card title="2. Local do sinistro">
        <TextField label="Data e hora da visita ao local" name="dataHoraVisita" value={data.dataHoraVisita} onChange={(v) => update("dataHoraVisita", v)} />
        <TextField label="Local onde ocorreu o acidente" name="localAcidente" value={data.localAcidente} onChange={(v) => update("localAcidente", v)} />
        <TextField label="Localidade e concelho" name="localidadeConcelho" value={data.localidadeConcelho} onChange={(v) => update("localidadeConcelho", v)} />
        <NarrativeField label="2.2 Operação / Tarefa" name="operacaoTarefa" value={data.operacaoTarefa} onChange={(v) => update("operacaoTarefa", v)} tipo="AT" seccaoId="operacaoTarefa" contexto={data} />
      </Card>

      <Card title="3–7. Entidades oficiais">
        <NarrativeField label="3. Autoridades" name="autoridades" value={data.autoridades} onChange={(v) => update("autoridades", v)} tipo="AT" seccaoId="autoridades" contexto={data} />
        <NarrativeField label="4. Tribunais" name="tribunais" value={data.tribunais} onChange={(v) => update("tribunais", v)} tipo="AT" seccaoId="tribunais" contexto={data} />
        <NarrativeField label="5. Bombeiros / INEM" name="bombeirosInem" value={data.bombeirosInem} onChange={(v) => update("bombeirosInem", v)} tipo="AT" seccaoId="bombeirosInem" contexto={data} />
        <NarrativeField label="6. ACT" name="act" value={data.act} onChange={(v) => update("act", v)} tipo="AT" seccaoId="act" contexto={data} />
        <NarrativeField label="7. Unidades de Saúde" name="unidadesSaude" value={data.unidadesSaude} onChange={(v) => update("unidadesSaude", v)} tipo="AT" seccaoId="unidadesSaude" contexto={data} />
      </Card>

      <Card title="8–10. Acidente">
        <NarrativeField label="8. Contacto com Tomador de Seguro" name="contactoTomador" value={data.contactoTomador} onChange={(v) => update("contactoTomador", v)} tipo="AT" seccaoId="contactoTomador" contexto={data} />
        <NarrativeField label="9. Versão do sinistrado" name="versaoSinistrado" value={data.versaoSinistrado} onChange={(v) => update("versaoSinistrado", v)} tipo="AT" seccaoId="versaoSinistrado" contexto={data} />
        <NarrativeField label="10. Testemunha" name="testemunha" value={data.testemunha} onChange={(v) => update("testemunha", v)} tipo="AT" seccaoId="testemunha" contexto={data} />
      </Card>

      <Card title="11. Apreciação Técnica">
        <NarrativeField label="11. Apreciação Técnica do Sinistro" name="apreciacaoTecnica" value={data.apreciacaoTecnica} onChange={(v) => update("apreciacaoTecnica", v)} tipo="AT" seccaoId="apreciacaoTecnica" contexto={data} />
        <NarrativeField label="11.1 Análise do local" name="analiseLocal" value={data.analiseLocal} onChange={(v) => update("analiseLocal", v)} tipo="AT" seccaoId="analiseLocal" contexto={data} />
        <NarrativeField label="11.2 Análise do contacto com Tomador" name="analiseContactoTomador" value={data.analiseContactoTomador} onChange={(v) => update("analiseContactoTomador", v)} tipo="AT" seccaoId="analiseContactoTomador" contexto={data} />
        <NarrativeField label="11.3 Análise das condições SST" name="analiseSst" value={data.analiseSst} onChange={(v) => update("analiseSst", v)} tipo="AT" seccaoId="analiseSst" contexto={data} />
        <NarrativeField label="11.4 Elementos suspeitos" name="elementosSuspeitos" value={data.elementosSuspeitos} onChange={(v) => update("elementosSuspeitos", v)} tipo="AT" seccaoId="elementosSuspeitos" contexto={data} />
        <NarrativeField label="11.5 Elementos de prova" name="elementosProva" value={data.elementosProva} onChange={(v) => update("elementosProva", v)} tipo="AT" seccaoId="elementosProva" contexto={data} />
      </Card>

      <Card title="12. Definição / Conclusões + Encerramento">
        <NarrativeField label="12. Definição / Conclusões" name="conclusoes" value={data.conclusoes} onChange={(v) => update("conclusoes", v)} tipo="AT" seccaoId="conclusoes" contexto={data} />
        <TextField label="Data do relatório (linha final)" name="dataRelatorio" value={data.dataRelatorio} onChange={(v) => update("dataRelatorio", v)} placeholder="ex: Lisboa, 7 de Maio de 2026" />
      </Card>
    </div>
  );
}
