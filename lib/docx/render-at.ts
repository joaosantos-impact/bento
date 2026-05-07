import { readFile } from "node:fs/promises";
import path from "node:path";
import { TemplateHandler } from "easy-template-x";
import { renderValue } from "@/lib/schemas/common";
import { type AtReport } from "@/lib/schemas/at-report";

const TEMPLATE_PATH = path.join(process.cwd(), "templates", "at-template-tagged.docx");

function flatten(r: AtReport): Record<string, string> {
  const s = (v: string | undefined) => renderValue(v, "structured");
  const n = (v: string | undefined) => renderValue(v, "narrative");
  const h = r.header;
  const seg = r.segurado;
  const sin = r.sinistrado;
  return {
    relatorio_numero: s(h?.numeroRelatorio),
    seguradora: s(h?.seguradora),
    supervisor: s(h?.supervisor),
    apolice: s(h?.apolice),
    processo_ocorrencia: s(h?.processoOcorrencia),
    numero_sinistro: s(h?.numeroSinistro),
    assunto: s(h?.assunto),
    enc_serv: s(h?.encServ),

    segurado_nome: s(seg?.nome),
    segurado_nif: s(seg?.nif),
    segurado_morada: s(seg?.morada),
    segurado_contacto: s(seg?.contacto),
    segurado_atividade: s(seg?.atividade),
    segurado_cae: s(seg?.cae),
    segurado_n_trabalhadores: s(seg?.numeroTrabalhadores),
    segurado_sst: s(seg?.servicosSst),
    segurado_avaliacao: s(seg?.avaliacao),

    sinistrado_nome: s(sin?.nome),
    sinistrado_nif: s(sin?.nif),
    sinistrado_morada: s(sin?.morada),
    sinistrado_contacto: s(sin?.contacto),
    sinistrado_idade: s(sin?.idade),
    sinistrado_profissao: s(sin?.profissao),
    sinistrado_lesoes: s(sin?.lesoes),

    data_hora_sinistro: s(r.dataHoraSinistro),
    horario_trabalho: n(r.horarioTrabalho),

    data_hora_visita: s(r.dataHoraVisita),
    local_acidente: s(r.localAcidente),
    localidade_concelho: s(r.localidadeConcelho),
    operacao_tarefa: n(r.operacaoTarefa),

    autoridades: n(r.autoridades),
    tribunais: n(r.tribunais),
    bombeiros_inem: n(r.bombeirosInem),
    act: n(r.act),
    unidades_saude: n(r.unidadesSaude),

    contacto_tomador: n(r.contactoTomador),
    versao_sinistrado: n(r.versaoSinistrado),
    testemunha: n(r.testemunha),

    apreciacao_tecnica: n(r.apreciacaoTecnica),
    analise_local: n(r.analiseLocal),
    analise_contacto_tomador: n(r.analiseContactoTomador),
    analise_sst: n(r.analiseSst),
    elementos_suspeitos: n(r.elementosSuspeitos),
    elementos_prova: n(r.elementosProva),

    conclusoes: n(r.conclusoes),
    data_relatorio: s(r.dataRelatorio),
  };
}

export async function renderAtReport(report: AtReport): Promise<Uint8Array> {
  const template = await readFile(TEMPLATE_PATH);
  const handler = new TemplateHandler();
  const out = await handler.process(template, flatten(report));
  return out;
}
