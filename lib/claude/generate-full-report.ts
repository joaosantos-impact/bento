import { type RuntimeConfig, openrouter, resolveModel } from "@/lib/openrouter";
import { CAPT_BASE_RULES, captFewShot } from "./system-prompts";
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

CONTEXTO COMPLETO DO CASO (notas do averiguador, transcrições de áudio, descrições de fotos — tudo o que foi recolhido):
"""
${contexto.trim()}
"""

TAREFA:
Preenche TODOS os campos da estrutura JSON abaixo. NENHUM CAMPO PODE FICAR VAZIO. Aplica as regras do system prompt:

- Campos factuais sem informação no contexto → "[a confirmar]" (não inventes nomes/NIFs/datas).
- Campos de análise/descritivos (apreciacaoTecnica, analiseLocal, analiseSst, versoes, contactoTomador, etc.) → SEMPRE escreves um parágrafo profissional, deduzindo profissionalmente a partir do contexto e do enquadramento legal aplicável (Lei n.º 98/2009 para AT, regime do contrato de seguro automóvel para Auto).
- Para "apreciacaoTecnica": parágrafo factual e técnico, com observações de compatibilidade material/altimétrica/cronológica, sem dar veredicto. É AQUI (e não em "conclusoes" nem em "danosSeguro/danosTerceiro") que entram frases tipo "compatível com", "correspondência tipológica/altimétrica", "subsistem reservas".
- Para "conclusoes": APENAS síntese factual CRONOLÓGICA do que aconteceu e do que foi apurado — relato dos factos, não interpretação. NUNCA opina, NUNCA conclui sobre culpa/responsabilidade, NUNCA recomenda validação/não-validação, NUNCA aplica enquadramentos jurídicos opinativos, NUNCA usa linguagem de análise técnica ("compatível com", "correspondência tipológica/altimétrica", "indicia", "evidencia", "carece de validação", "subsistem reservas"). Estrutura: 1) cronologia do sinistro (data/hora/local/dinâmica), 2) o que foi confirmado pelas diligências (visitas, contactos, documentos recebidos), 3) o que ficou pendente, 4) fórmula de encerramento padrão.
- Para sub-objectos (ex: "segurado", "sinistrado", "header", "danosSeguro", "danosTerceiro"): preenche TODAS as keys sem excepção; usa "[a confirmar]" para os factuais ausentes.
- ATENÇÃO ESPECIAL para Auto: a secção 12 (Veículos) é OBRIGATÓRIA e os 4 sub-campos por veículo são preenchidos com FACTOS OBSERVADOS, sem análise:
  • "intro": 1-3 frases curtas OU bullets "✓" — cada bullet é UM FACTO OBSERVADO sobre uma peça/zona afectada (ex.: "✓ Para-choques frontal lateral esquerdo: plásticos partidos"; "✓ Capot: deformação acentuada"). NÃO usas "compatível com X impacto", "indicia eventual afectação Y", "compatível com manobra Z".
  • "altimetria": medidas concretas em cm + zona (ex.: "52 a 80 cm na chapa dianteira da porta direita"). NÃO usas "correspondência altimétrica com o outro veículo", "compatível com impacto X".
  • "reparador": nome ou "Não indicado" / "Não aplicável" / "[a confirmar]".
  • "ipo": data ou "---".

EXEMPLOS DE CAMPOS COMUNS (orientações tácticas):
- header.assunto: frase curta tipo "Acidente de trabalho — pedreiro — fractura na perna" (deduz da actividade + lesão).
- horarioTrabalho: parágrafo descrevendo regime laboral e horas cumpridas até ao acidente.
- operacaoTarefa: parágrafo descrevendo a tarefa em execução.
- versaoSinistrado: parágrafo em terceira pessoa com declarações; pode incluir trechos em discurso directo entre aspas se o contexto fornecer.
- testemunha: parágrafo; se nenhuma testemunha referida no contexto, escreve "Não foram referidas, nem identificadas, quaisquer testemunhas oculares ou não oculares, relativamente ao sinistro em apreço."
- autoridades/tribunais/bombeirosInem/act: parágrafo curto; se nada referido, escreve algo como "Não foram efectuados contactos com autoridades policiais, não constando da participação qualquer indicação nesse sentido."
- analiseSst: enquadramento legal (Lei n.º 98/2009) + análise da actividade.
- elementosSuspeitos: lista de pontos com bullet points "•" para cada incongruência identificada (formato CAPT). Se não há incongruências, escreve "Não foram identificados, no decurso da averiguação, elementos susceptíveis de configurar reservas relevantes quanto à veracidade do evento participado."
- conclusoes: parágrafos longos com enquadramento legal e recomendação final.
- dataRelatorio: se a data não está no contexto, usa "Lisboa, [data a confirmar]".

ESTRUTURA JSON A DEVOLVER (preenche todos os valores; mantém a estrutura idêntica):
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
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: `${CAPT_BASE_RULES}\n\n${captFewShot(tipo)}` },
      { role: "user", content: buildPrompt(tipo, contexto) },
    ],
    max_tokens: 12000,
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
