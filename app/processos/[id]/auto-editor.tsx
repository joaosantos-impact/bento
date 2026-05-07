"use client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { type AutoReport } from "@/lib/schemas/auto-report";
import { type Processo } from "@/lib/types";
import { deleteProcesso, updateProcesso } from "@/lib/storage/local-store";
import { TextField } from "@/components/form/field";
import { Card } from "@/components/form/card";
import { NarrativeField } from "@/components/form/narrative-field";
import { useAutoSave } from "@/lib/hooks/use-autosave";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { SaveStatus } from "@/components/ui/save-status";

type Props = { processo: Extract<Processo, { tipo: "AUTO" }>; hideHeader?: boolean };

export function AutoEditor({ processo, hideHeader }: Props) {
  const router = useRouter();
  const [data, setData] = useState<AutoReport>(processo.data);
  const [exporting, setExporting] = useState(false);
  const confirm = useConfirm();
  const toast = useToast();

  const update = useCallback(<K extends keyof AutoReport>(key: K, value: AutoReport[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateNested = useCallback(
    <S extends "header" | "segurado" | "condutor" | "terceiro" | "condutorTerceiro" | "testemunha" | "feridos" | "local" | "assistencia" | "danosSeguro" | "danosTerceiro">(
      section: S,
      key: string,
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
    (next: AutoReport) => {
      updateProcesso({ ...processo, data: next, titulo: next.header?.assunto ?? "" });
    },
    [processo],
  );

  const { status, lastSavedAt } = useAutoSave(data, persist);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/exportar/auto", {
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
      a.download = `relatorio-auto-${data.header?.numeroRelatorio || "sem-numero"}.docx`;
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
  const con = data.condutor;
  const ter = data.terceiro;
  const conT = data.condutorTerceiro;
  const tes = data.testemunha;
  const loc = data.local;

  return (
    <div className="space-y-6">
      {hideHeader ? (
        <SaveStatus status={status} lastSavedAt={lastSavedAt} fallbackAt={processo.updatedAt} />
      ) : (
        <header className="flex items-center justify-between">
          <div>
            <span className="rounded bg-sky-100 px-1.5 py-0.5 text-xs font-medium text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
              AUTO
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

      <Card title="Segurado + veículo">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Nome" name="seg_nome" value={seg?.nome} onChange={(v) => updateNested("segurado", "nome", v)} />
          <TextField label="NIF" name="seg_nif" value={seg?.nif} onChange={(v) => updateNested("segurado", "nif", v)} />
          <TextField label="Morada" name="seg_morada" value={seg?.morada} onChange={(v) => updateNested("segurado", "morada", v)} />
          <TextField label="Contacto" name="seg_contacto" value={seg?.contacto} onChange={(v) => updateNested("segurado", "contacto", v)} />
          <TextField label="Profissão / Atividade" name="seg_atividade" value={seg?.atividade} onChange={(v) => updateNested("segurado", "atividade", v)} />
          <TextField label="Local de trabalho / Sede" name="seg_local" value={seg?.localTrabalho} onChange={(v) => updateNested("segurado", "localTrabalho", v)} />
          <TextField label="Matrícula" name="seg_matricula" value={seg?.matricula} onChange={(v) => updateNested("segurado", "matricula", v)} />
          <TextField label="Marca / modelo" name="seg_marca" value={seg?.marcaModelo} onChange={(v) => updateNested("segurado", "marcaModelo", v)} />
          <TextField label="Cor" name="seg_cor" value={seg?.cor} onChange={(v) => updateNested("segurado", "cor", v)} />
          <TextField label="Potência do veículo" name="seg_potencia" value={seg?.potencia} onChange={(v) => updateNested("segurado", "potencia", v)} />
        </div>
      </Card>

      <Card title="Condutor (do segurado)">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Nome" name="con_nome" value={con?.nome} onChange={(v) => updateNested("condutor", "nome", v)} />
          <TextField label="NIF" name="con_nif" value={con?.nif} onChange={(v) => updateNested("condutor", "nif", v)} />
          <TextField label="Morada" name="con_morada" value={con?.morada} onChange={(v) => updateNested("condutor", "morada", v)} />
          <TextField label="Contacto" name="con_contacto" value={con?.contacto} onChange={(v) => updateNested("condutor", "contacto", v)} />
          <TextField label="Profissão" name="con_profissao" value={con?.profissao} onChange={(v) => updateNested("condutor", "profissao", v)} />
          <TextField label="Local de trabalho" name="con_local" value={con?.localTrabalho} onChange={(v) => updateNested("condutor", "localTrabalho", v)} />
          <TextField label="Salário" name="con_salario" value={con?.salario} onChange={(v) => updateNested("condutor", "salario", v)} />
          <TextField label="Lic. Condução" name="con_licenca" value={con?.licenca} onChange={(v) => updateNested("condutor", "licenca", v)} />
          <TextField label="Categorias" name="con_categorias" value={con?.categorias} onChange={(v) => updateNested("condutor", "categorias", v)} />
          <TextField label="TAS (g/l)" name="con_tas" value={con?.tas} onChange={(v) => updateNested("condutor", "tas", v)} />
          <TextField label="É condutor habitual?" name="con_habitual" value={con?.habitual} onChange={(v) => updateNested("condutor", "habitual", v)} />
          <TextField label="Posição de Comissário" name="con_pos" value={con?.posicaoComissario} onChange={(v) => updateNested("condutor", "posicaoComissario", v)} />
          <TextField label="Concelho de circulação habitual" name="con_concelho" value={con?.concelhoCirculacao} onChange={(v) => updateNested("condutor", "concelhoCirculacao", v)} />
          <TextField label="Relação Condutor / Proprietário" name="con_relprop" value={con?.relacaoProprietario} onChange={(v) => updateNested("condutor", "relacaoProprietario", v)} />
          <TextField label="Relação entre intervenientes" name="con_relint" value={con?.relacaoIntervenientes} onChange={(v) => updateNested("condutor", "relacaoIntervenientes", v)} />
          <TextField label="Outros danos materiais" name="con_outros" value={con?.outrosDanos} onChange={(v) => updateNested("condutor", "outrosDanos", v)} />
        </div>
      </Card>

      <Card title="Terceiro + veículo">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Nome" name="ter_nome" value={ter?.nome} onChange={(v) => updateNested("terceiro", "nome", v)} />
          <TextField label="NIF" name="ter_nif" value={ter?.nif} onChange={(v) => updateNested("terceiro", "nif", v)} />
          <TextField label="Morada" name="ter_morada" value={ter?.morada} onChange={(v) => updateNested("terceiro", "morada", v)} />
          <TextField label="Contacto" name="ter_contacto" value={ter?.contacto} onChange={(v) => updateNested("terceiro", "contacto", v)} />
          <TextField label="Profissão / Atividade" name="ter_ativ" value={ter?.atividade} onChange={(v) => updateNested("terceiro", "atividade", v)} />
          <TextField label="Local de trabalho / Sede" name="ter_local" value={ter?.localTrabalho} onChange={(v) => updateNested("terceiro", "localTrabalho", v)} />
          <TextField label="Matrícula" name="ter_matricula" value={ter?.matricula} onChange={(v) => updateNested("terceiro", "matricula", v)} />
          <TextField label="Marca / modelo" name="ter_marca" value={ter?.marcaModelo} onChange={(v) => updateNested("terceiro", "marcaModelo", v)} />
          <TextField label="Cor" name="ter_cor" value={ter?.cor} onChange={(v) => updateNested("terceiro", "cor", v)} />
          <TextField label="Potência do veículo" name="ter_potencia" value={ter?.potencia} onChange={(v) => updateNested("terceiro", "potencia", v)} />
          <TextField label="Seguradora (terceiro)" name="ter_seg" value={ter?.seguradora} onChange={(v) => updateNested("terceiro", "seguradora", v)} />
          <TextField label="Apólice (terceiro)" name="ter_apol" value={ter?.apolice} onChange={(v) => updateNested("terceiro", "apolice", v)} />
        </div>
      </Card>

      <Card title="Condutor terceiro">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Nome" name="cT_nome" value={conT?.nome} onChange={(v) => updateNested("condutorTerceiro", "nome", v)} />
          <TextField label="NIF" name="cT_nif" value={conT?.nif} onChange={(v) => updateNested("condutorTerceiro", "nif", v)} />
          <TextField label="Morada" name="cT_morada" value={conT?.morada} onChange={(v) => updateNested("condutorTerceiro", "morada", v)} />
          <TextField label="Contacto" name="cT_contacto" value={conT?.contacto} onChange={(v) => updateNested("condutorTerceiro", "contacto", v)} />
          <TextField label="Profissão" name="cT_profissao" value={conT?.profissao} onChange={(v) => updateNested("condutorTerceiro", "profissao", v)} />
          <TextField label="Local de trabalho" name="cT_local" value={conT?.localTrabalho} onChange={(v) => updateNested("condutorTerceiro", "localTrabalho", v)} />
          <TextField label="Salário" name="cT_salario" value={conT?.salario} onChange={(v) => updateNested("condutorTerceiro", "salario", v)} />
          <TextField label="Lic. Condução" name="cT_licenca" value={conT?.licenca} onChange={(v) => updateNested("condutorTerceiro", "licenca", v)} />
          <TextField label="Categorias" name="cT_categorias" value={conT?.categorias} onChange={(v) => updateNested("condutorTerceiro", "categorias", v)} />
          <TextField label="TAS (g/l)" name="cT_tas" value={conT?.tas} onChange={(v) => updateNested("condutorTerceiro", "tas", v)} />
          <TextField label="Posição de Comissário" name="cT_pos" value={conT?.posicaoComissario} onChange={(v) => updateNested("condutorTerceiro", "posicaoComissario", v)} />
          <TextField label="Relação entre intervenientes" name="cT_relint" value={conT?.relacaoIntervenientes} onChange={(v) => updateNested("condutorTerceiro", "relacaoIntervenientes", v)} />
          <TextField label="Outros danos materiais" name="cT_outros" value={conT?.outrosDanos} onChange={(v) => updateNested("condutorTerceiro", "outrosDanos", v)} />
        </div>
      </Card>

      <Card title="Testemunha">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Nome" name="tes_nome" value={tes?.nome} onChange={(v) => updateNested("testemunha", "nome", v)} />
          <TextField label="NIF" name="tes_nif" value={tes?.nif} onChange={(v) => updateNested("testemunha", "nif", v)} />
          <TextField label="Morada" name="tes_morada" value={tes?.morada} onChange={(v) => updateNested("testemunha", "morada", v)} />
          <TextField label="Contacto" name="tes_contacto" value={tes?.contacto} onChange={(v) => updateNested("testemunha", "contacto", v)} />
          <TextField label="Relação entre intervenientes" name="tes_relacao" value={tes?.relacao} onChange={(v) => updateNested("testemunha", "relacao", v)} />
          <TextField label="Local onde se encontrava aquando do acidente" name="tes_local" value={tes?.local} onChange={(v) => updateNested("testemunha", "local", v)} />
        </div>
      </Card>

      <Card title="1. Data e hora · 2. Local detalhado">
        <TextField label="Data e hora do sinistro" name="dataHoraSinistro" value={data.dataHoraSinistro} onChange={(v) => update("dataHoraSinistro", v)} />
        <TextField label="Data e hora da visita ao local" name="dataHoraVisita" value={data.dataHoraVisita} onChange={(v) => update("dataHoraVisita", v)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Estrada / Rua / Caminho" name="estrada" value={loc?.estrada} onChange={(v) => updateNested("local", "estrada", v)} />
          <TextField label="Localidade e concelho" name="loc_loc" value={loc?.localidadeConcelho} onChange={(v) => updateNested("local", "localidadeConcelho", v)} />
          <TextField label="Traçado" name="tracado" value={loc?.tracado} onChange={(v) => updateNested("local", "tracado", v)} />
          <TextField label="Nº de vias de trânsito" name="nVias" value={loc?.nVias} onChange={(v) => updateNested("local", "nVias", v)} />
          <TextField label="Visibilidade (m)" name="vis" value={loc?.visibilidade} onChange={(v) => updateNested("local", "visibilidade", v)} />
          <TextField label="Tipo e estado do piso" name="piso" value={loc?.estadoPiso} onChange={(v) => updateNested("local", "estadoPiso", v)} />
          <TextField label="Largura faixa de rodagem" name="largFaixa" value={loc?.larguraFaixa} onChange={(v) => updateNested("local", "larguraFaixa", v)} />
          <TextField label="Largura bermas" name="largBermas" value={loc?.larguraBermas} onChange={(v) => updateNested("local", "larguraBermas", v)} />
          <TextField label="Largura passeios" name="largPasseios" value={loc?.larguraPasseios} onChange={(v) => updateNested("local", "larguraPasseios", v)} />
          <TextField label="Largura valetas" name="largValetas" value={loc?.larguraValetas} onChange={(v) => updateNested("local", "larguraValetas", v)} />
          <TextField label="Declive longitudinal (%)" name="decLong" value={loc?.decliveLongitudinal} onChange={(v) => updateNested("local", "decliveLongitudinal", v)} />
          <TextField label="Declive transversal (%)" name="decTrans" value={loc?.decliveTransversal} onChange={(v) => updateNested("local", "decliveTransversal", v)} />
          <TextField label="Sinalização vertical" name="sinVer" value={loc?.sinalizacaoVertical} onChange={(v) => updateNested("local", "sinalizacaoVertical", v)} />
          <TextField label="Sinalização horizontal" name="sinHor" value={loc?.sinalizacaoHorizontal} onChange={(v) => updateNested("local", "sinalizacaoHorizontal", v)} />
          <TextField label="Limite de velocidade" name="limVel" value={loc?.limiteVelocidade} onChange={(v) => updateNested("local", "limiteVelocidade", v)} />
          <TextField label="Estado do tempo" name="tempo" value={loc?.estadoTempo} onChange={(v) => updateNested("local", "estadoTempo", v)} />
          <TextField label="Iluminação" name="ilum" value={loc?.iluminacao} onChange={(v) => updateNested("local", "iluminacao", v)} />
          <TextField label="Intensidade do tráfego" name="trafego" value={loc?.intensidadeTrafego} onChange={(v) => updateNested("local", "intensidadeTrafego", v)} />
        </div>
        <NarrativeField label="Vestígios encontrados" name="vest" value={loc?.vestigios} onChange={(v) => updateNested("local", "vestigios", v)} tipo="AUTO" seccaoId="local.vestigios" contexto={data} />
        <NarrativeField label="Caracterização do local / outros elementos relevantes" name="carac" value={loc?.caracterizacao} onChange={(v) => updateNested("local", "caracterizacao", v)} tipo="AUTO" seccaoId="local.caracterizacao" contexto={data} />
      </Card>

      <Card title="3–7. Entidades + Assistência em viagem">
        <NarrativeField label="3. Autoridades" name="autoridades" value={data.autoridades} onChange={(v) => update("autoridades", v)} tipo="AUTO" seccaoId="autoridades" contexto={data} />
        <NarrativeField label="4. Tribunais" name="tribunais" value={data.tribunais} onChange={(v) => update("tribunais", v)} tipo="AUTO" seccaoId="tribunais" contexto={data} />
        <NarrativeField label="5. APS / Segurnet" name="aps" value={data.apsSegurnet} onChange={(v) => update("apsSegurnet", v)} tipo="AUTO" seccaoId="apsSegurnet" contexto={data} />
        <NarrativeField label="7. Bombeiros / INEM" name="bom" value={data.bombeirosInem} onChange={(v) => update("bombeirosInem", v)} tipo="AUTO" seccaoId="bombeirosInem" contexto={data} />
      </Card>

      <Card title="9–11. Versões e testemunhas">
        <NarrativeField label="9. Versão do Segurado / CVS" name="vSeg" value={data.versaoSegurado} onChange={(v) => update("versaoSegurado", v)} tipo="AUTO" seccaoId="versaoSegurado" contexto={data} />
        <NarrativeField label="10. Versão do Terceiro" name="vTer" value={data.versaoTerceiro} onChange={(v) => update("versaoTerceiro", v)} tipo="AUTO" seccaoId="versaoTerceiro" contexto={data} />
        <NarrativeField label="11.1 Testemunhas indicadas pelo Segurado" name="tSeg" value={data.testemunhasSegurado} onChange={(v) => update("testemunhasSegurado", v)} tipo="AUTO" seccaoId="testemunhasSegurado" contexto={data} />
        <NarrativeField label="11.2 Testemunhas indicadas pelo Terceiro" name="tTer" value={data.testemunhasTerceiro} onChange={(v) => update("testemunhasTerceiro", v)} tipo="AUTO" seccaoId="testemunhasTerceiro" contexto={data} />
        <NarrativeField label="11.3 Outras testemunhas" name="oTest" value={data.outrasTestemunhas} onChange={(v) => update("outrasTestemunhas", v)} tipo="AUTO" seccaoId="outrasTestemunhas" contexto={data} />
      </Card>

      <Card title="12–15. Danos">
        <NarrativeField label="13. Outros danos materiais" name="outDan" value={data.outrosDanosMateriais} onChange={(v) => update("outrosDanosMateriais", v)} tipo="AUTO" seccaoId="outrosDanosMateriais" contexto={data} />
        <NarrativeField label="13.1 Prova de propriedade dos bens" name="prov" value={data.provaPropriedade} onChange={(v) => update("provaPropriedade", v)} tipo="AUTO" seccaoId="provaPropriedade" contexto={data} />
        <NarrativeField label="14. Sequência de Embates" name="sEmb" value={data.sequenciaEmbates} onChange={(v) => update("sequenciaEmbates", v)} tipo="AUTO" seccaoId="sequenciaEmbates" contexto={data} />
        <NarrativeField label="15. Sequência Semafórica" name="sSem" value={data.sequenciaSemaforica} onChange={(v) => update("sequenciaSemaforica", v)} tipo="AUTO" seccaoId="sequenciaSemaforica" contexto={data} />
      </Card>

      <Card title="16–17. Apreciação + Conclusões">
        <NarrativeField label="16. Apreciação Técnica do Sinistro" name="apre" value={data.apreciacaoTecnica} onChange={(v) => update("apreciacaoTecnica", v)} tipo="AUTO" seccaoId="apreciacaoTecnica" contexto={data} />
        <NarrativeField label="16.1 Elementos suspeitos" name="elS" value={data.elementosSuspeitos} onChange={(v) => update("elementosSuspeitos", v)} tipo="AUTO" seccaoId="elementosSuspeitos" contexto={data} />
        <NarrativeField label="16.2 Elementos de prova" name="elP" value={data.elementosProva} onChange={(v) => update("elementosProva", v)} tipo="AUTO" seccaoId="elementosProva" contexto={data} />
        <NarrativeField label="17. Definição / Conclusões" name="con" value={data.conclusoes} onChange={(v) => update("conclusoes", v)} tipo="AUTO" seccaoId="conclusoes" contexto={data} />
        <TextField label="Data do relatório (linha final)" name="dataRel" value={data.dataRelatorio} onChange={(v) => update("dataRelatorio", v)} placeholder="ex: Lisboa, 7 de Maio de 2026" />
      </Card>
    </div>
  );
}
