import { type RuntimeConfig, openrouter, resolveModel } from "@/lib/openrouter";
import { CAPT_BASE_RULES } from "./system-prompts";
import { AtReportSchema, type AtReport } from "@/lib/schemas/at-report";
import { AutoReportSchema, type AutoReport } from "@/lib/schemas/auto-report";

// JSON skeleton for each report type. The model fills these in.
const AT_SKELETON = {
  header: {
    numeroRelatorio: "",
    seguradora: "",
    supervisor: "",
    apolice: "",
    processoOcorrencia: "",
    numeroSinistro: "",
    assunto: "",
    encServ: "",
  },
  segurado: {
    nome: "",
    nif: "",
    morada: "",
    contacto: "",
    atividade: "",
    cae: "",
    numeroTrabalhadores: "",
    servicosSst: "",
    avaliacao: "",
  },
  sinistrado: {
    nome: "",
    nif: "",
    morada: "",
    contacto: "",
    idade: "",
    profissao: "",
    lesoes: "",
  },
  dataHoraSinistro: "",
  horarioTrabalho: "",
  dataHoraVisita: "",
  localAcidente: "",
  localidadeConcelho: "",
  operacaoTarefa: "",
  autoridades: "",
  tribunais: "",
  bombeirosInem: "",
  act: "",
  unidadesSaude: "",
  contactoTomador: "",
  versaoSinistrado: "",
  testemunha: "",
  apreciacaoTecnica: "",
  analiseLocal: "",
  analiseContactoTomador: "",
  analiseSst: "",
  elementosSuspeitos: "",
  elementosProva: "",
  conclusoes: "",
  dataRelatorio: "",
};

const AUTO_SKELETON = {
  header: {
    numeroRelatorio: "",
    seguradora: "",
    supervisor: "",
    apolice: "",
    processoOcorrencia: "",
    numeroSinistro: "",
    assunto: "",
    encServ: "",
  },
  segurado: {
    nome: "",
    nif: "",
    morada: "",
    contacto: "",
    atividade: "",
    localTrabalho: "",
    matricula: "",
    marcaModelo: "",
    cor: "",
    potencia: "",
  },
  condutor: {
    nome: "",
    nif: "",
    morada: "",
    contacto: "",
    profissao: "",
    localTrabalho: "",
    salario: "",
    licenca: "",
    categorias: "",
    tas: "",
    habitual: "",
    posicaoComissario: "",
    concelhoCirculacao: "",
    relacaoProprietario: "",
    relacaoIntervenientes: "",
    outrosDanos: "",
  },
  terceiro: {
    nome: "",
    nif: "",
    morada: "",
    contacto: "",
    atividade: "",
    localTrabalho: "",
    matricula: "",
    marcaModelo: "",
    cor: "",
    potencia: "",
    seguradora: "",
    apolice: "",
  },
  condutorTerceiro: {
    nome: "",
    nif: "",
    morada: "",
    contacto: "",
    profissao: "",
    localTrabalho: "",
    salario: "",
    licenca: "",
    categorias: "",
    tas: "",
    posicaoComissario: "",
    relacaoIntervenientes: "",
    outrosDanos: "",
  },
  testemunha: {
    nome: "",
    nif: "",
    morada: "",
    contacto: "",
    relacao: "",
    local: "",
  },
  feridos: { total: "", veiculoSeguro: "", veiculoTerceiro: "", peoes: "" },
  dataHoraSinistro: "",
  dataHoraVisita: "",
  local: {
    estrada: "",
    localidadeConcelho: "",
    tracado: "",
    nVias: "",
    visibilidade: "",
    estadoPiso: "",
    larguraFaixa: "",
    larguraBermas: "",
    larguraPasseios: "",
    larguraValetas: "",
    decliveLongitudinal: "",
    decliveTransversal: "",
    sinalizacaoVertical: "",
    sinalizacaoHorizontal: "",
    limiteVelocidade: "",
    estadoTempo: "",
    iluminacao: "",
    intensidadeTrafego: "",
    vestigios: "",
    caracterizacao: "",
  },
  autoridades: "",
  tribunais: "",
  apsSegurnet: "",
  assistencia: { dataHora: "", local: "", motivo: "", solicitante: "", rebocador: "" },
  bombeirosInem: "",
  versaoSegurado: "",
  versaoTerceiro: "",
  testemunhasSegurado: "",
  testemunhasTerceiro: "",
  outrasTestemunhas: "",
  danosSeguro: { intro: "", altimetria: "", reparador: "", ipo: "" },
  danosTerceiro: { intro: "", altimetria: "", reparador: "", ipo: "" },
  outrosDanosMateriais: "",
  provaPropriedade: "",
  sequenciaEmbates: "",
  sequenciaSemaforica: "",
  apreciacaoTecnica: "",
  elementosSuspeitos: "",
  elementosProva: "",
  conclusoes: "",
  dataRelatorio: "",
};

function buildPrompt(tipo: "AT" | "AUTO", contexto: string): string {
  const skeleton = tipo === "AT" ? AT_SKELETON : AUTO_SKELETON;
  const tipoTitulo = tipo === "AT" ? "Acidente de Trabalho" : "Sinistro Automóvel (CIDS/IDS)";
  return `TIPO DE RELATÓRIO: ${tipoTitulo}

CONTEXTO COMPLETO DO CASO (notas, transcrições de áudio, descrições de fotos — tudo o que o averiguador recolheu):
"""
${contexto.trim()}
"""

TAREFA:
Preenche TODOS os campos da estrutura JSON abaixo, baseando-te ESTRITAMENTE no contexto acima. Não inventes informação que não esteja lá.

REGRAS:
1. Para campos que não tenhas informação no contexto, devolve string vazia "". NÃO escrevas "[a confirmar]" — fica string vazia.
2. Campos curtos (nomes, NIFs, datas, números, matrículas, cores, etc.): apenas o valor exacto, sem floreado. Ex: "Generali Tranquilidade", "234567890", "13/03/2026 — 20h00".
3. Secções narrativas longas (versões, análises, apreciação técnica, conclusões, elementos suspeitos): parágrafos formais no estilo CAPT (3ª pessoa, formal, português de Portugal pré-acordo ortográfico, sem markdown, sem bullets a menos que o conteúdo natural exija).
4. Datas no formato DD/MM/AAAA, horas no formato HHhMM ou HH:MM.
5. Não inventes nomes próprios, moradas, datas ou valores. Usa exactamente o que está no contexto.
6. Se o contexto contém contradições, regista as duas versões na secção apropriada (ex: "elementosSuspeitos") em vez de escolher uma.
7. Se o contexto não menciona nada sobre uma secção (ex: nenhuma referência a tribunais), deixa o campo a string vazia.

ESTRUTURA JSON A DEVOLVER (preenche os valores; mantém a estrutura idêntica):
${JSON.stringify(skeleton, null, 2)}

Devolve APENAS o objecto JSON, sem markdown, sem explicações adicionais.`;
}

export type GenerateFullReportInput = {
  tipo: "AT" | "AUTO";
  contexto: string;
  config?: RuntimeConfig;
};

export async function generateFullReport(
  input: GenerateFullReportInput,
): Promise<AtReport | AutoReport> {
  const { tipo, contexto, config } = input;
  const client = openrouter(config);
  const model = resolveModel(config ?? {});

  const response = await client.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: CAPT_BASE_RULES },
      { role: "user", content: buildPrompt(tipo, contexto) },
    ],
    max_tokens: 8000,
  });

  const content = response.choices[0]?.message?.content?.trim() ?? "{}";
  const raw = JSON.parse(content) as Record<string, unknown>;
  // Inject the discriminator the schemas need.
  const merged = { tipo, ...raw };
  const schema = tipo === "AT" ? AtReportSchema : AutoReportSchema;
  const parsed = schema.safeParse(merged);
  if (!parsed.success) {
    throw new Error(`Resposta do modelo não bate certo com o schema: ${JSON.stringify(parsed.error.flatten())}`);
  }
  return parsed.data as AtReport | AutoReport;
}
