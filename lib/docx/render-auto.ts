import { readFile } from "node:fs/promises";
import path from "node:path";
import { TemplateHandler } from "easy-template-x";
import { renderValue } from "@/lib/schemas/common";
import { type AutoReport } from "@/lib/schemas/auto-report";

const TEMPLATE_PATH = path.join(process.cwd(), "templates", "auto-template-tagged.docx");

function flatten(r: AutoReport): Record<string, string> {
  const s = (v: string | undefined) => renderValue(v, "structured");
  const n = (v: string | undefined) => renderValue(v, "narrative");

  const h = r.header;
  const seg = r.segurado;
  const con = r.condutor;
  const ter = r.terceiro;
  const conT = r.condutorTerceiro;
  const tes = r.testemunha;
  const fer = r.feridos;
  const loc = r.local;
  const ass = r.assistencia;
  const dS = r.danosSeguro;
  const dT = r.danosTerceiro;

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
    segurado_local_trabalho: s(seg?.localTrabalho),
    segurado_matricula: s(seg?.matricula),
    segurado_marca_modelo: s(seg?.marcaModelo),
    segurado_cor: s(seg?.cor),
    segurado_potencia: s(seg?.potencia),

    condutor_nome: s(con?.nome),
    condutor_nif: s(con?.nif),
    condutor_morada: s(con?.morada),
    condutor_contacto: s(con?.contacto),
    condutor_profissao: s(con?.profissao),
    condutor_local_trabalho: s(con?.localTrabalho),
    condutor_salario: s(con?.salario),
    condutor_licenca: s(con?.licenca),
    condutor_categorias: s(con?.categorias),
    condutor_tas: s(con?.tas),
    condutor_habitual: s(con?.habitual),
    condutor_posicao_comissario: s(con?.posicaoComissario),
    condutor_concelho_circulacao: s(con?.concelhoCirculacao),
    condutor_relacao_proprietario: s(con?.relacaoProprietario),
    condutor_relacao_intervenientes: s(con?.relacaoIntervenientes),
    condutor_outros_danos: s(con?.outrosDanos),

    terceiro_nome: s(ter?.nome),
    terceiro_nif: s(ter?.nif),
    terceiro_morada: s(ter?.morada),
    terceiro_contacto: s(ter?.contacto),
    terceiro_atividade: s(ter?.atividade),
    terceiro_local_trabalho: s(ter?.localTrabalho),
    terceiro_matricula: s(ter?.matricula),
    terceiro_marca_modelo: s(ter?.marcaModelo),
    terceiro_cor: s(ter?.cor),
    terceiro_potencia: s(ter?.potencia),
    terceiro_seguradora: s(ter?.seguradora),
    terceiro_apolice: s(ter?.apolice),

    condutor_terceiro_nome: s(conT?.nome),
    condutor_terceiro_nif: s(conT?.nif),
    condutor_terceiro_morada: s(conT?.morada),
    condutor_terceiro_contacto: s(conT?.contacto),
    condutor_terceiro_profissao: s(conT?.profissao),
    condutor_terceiro_local_trabalho: s(conT?.localTrabalho),
    condutor_terceiro_salario: s(conT?.salario),
    condutor_terceiro_licenca: s(conT?.licenca),
    condutor_terceiro_categorias: s(conT?.categorias),
    condutor_terceiro_tas: s(conT?.tas),
    condutor_terceiro_posicao_comissario: s(conT?.posicaoComissario),
    condutor_terceiro_relacao_intervenientes: s(conT?.relacaoIntervenientes),
    condutor_terceiro_outros_danos: s(conT?.outrosDanos),

    testemunha_nome: s(tes?.nome),
    testemunha_nif: s(tes?.nif),
    testemunha_morada: s(tes?.morada),
    testemunha_contacto: s(tes?.contacto),
    testemunha_relacao: s(tes?.relacao),
    testemunha_local: s(tes?.local),

    feridos_veiculo_seguro: s(fer?.veiculoSeguro),
    feridos_veiculo_terceiro: s(fer?.veiculoTerceiro),
    feridos_peoes: s(fer?.peoes),

    data_hora_sinistro: s(r.dataHoraSinistro),

    data_hora_visita: s(r.dataHoraVisita),
    estrada: s(loc?.estrada),
    localidade_concelho: s(loc?.localidadeConcelho),
    tracado: s(loc?.tracado),
    n_vias: s(loc?.nVias),
    visibilidade: s(loc?.visibilidade),
    estado_piso: s(loc?.estadoPiso),
    largura_faixa: s(loc?.larguraFaixa),
    largura_bermas: s(loc?.larguraBermas),
    largura_passeios: s(loc?.larguraPasseios),
    largura_valetas: s(loc?.larguraValetas),
    declive_longitudinal: s(loc?.decliveLongitudinal),
    declive_transversal: s(loc?.decliveTransversal),
    sinalizacao_vertical: s(loc?.sinalizacaoVertical),
    sinalizacao_horizontal: s(loc?.sinalizacaoHorizontal),
    limite_velocidade: s(loc?.limiteVelocidade),
    estado_tempo: s(loc?.estadoTempo),
    iluminacao: s(loc?.iluminacao),
    intensidade_trafego: s(loc?.intensidadeTrafego),
    vestigios: n(loc?.vestigios),
    caracterizacao_local: n(loc?.caracterizacao),

    autoridades: n(r.autoridades),
    tribunais: n(r.tribunais),
    aps_segurnet: n(r.apsSegurnet),
    assistencia_data_hora: s(ass?.dataHora),
    assistencia_local: s(ass?.local),
    assistencia_motivo: s(ass?.motivo),
    assistencia_solicitante: s(ass?.solicitante),
    assistencia_rebocador: s(ass?.rebocador),
    bombeiros_inem: n(r.bombeirosInem),

    versao_segurado: n(r.versaoSegurado),
    versao_terceiro: n(r.versaoTerceiro),
    testemunhas_segurado: n(r.testemunhasSegurado),
    testemunhas_terceiro: n(r.testemunhasTerceiro),
    outras_testemunhas: n(r.outrasTestemunhas),

    danos_seguro_intro: n(dS?.intro),
    danos_seguro_altimetria: n(dS?.altimetria),
    danos_seguro_reparador: s(dS?.reparador),
    danos_seguro_ipo: s(dS?.ipo),
    danos_terceiro_intro: n(dT?.intro),
    danos_terceiro_altimetria: n(dT?.altimetria),
    danos_terceiro_reparador: s(dT?.reparador),
    danos_terceiro_ipo: s(dT?.ipo),
    outros_danos_materiais: n(r.outrosDanosMateriais),
    prova_propriedade: n(r.provaPropriedade),
    sequencia_embates: n(r.sequenciaEmbates),
    sequencia_semaforica: n(r.sequenciaSemaforica),

    apreciacao_tecnica: n(r.apreciacaoTecnica),
    elementos_suspeitos: n(r.elementosSuspeitos),
    elementos_prova: n(r.elementosProva),
    conclusoes: n(r.conclusoes),
    data_relatorio: s(r.dataRelatorio),
  };
}

export async function renderAutoReport(report: AutoReport): Promise<Uint8Array> {
  const template = await readFile(TEMPLATE_PATH);
  const handler = new TemplateHandler();
  const out = await handler.process(template, flatten(report));
  return out;
}
