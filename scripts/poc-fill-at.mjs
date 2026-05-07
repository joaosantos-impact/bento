// End-to-end test: fill templates/at-template-tagged.docx with sample data
// from the "Carlito" case and write to .tmp-inspect/at-carlito.docx for visual check.
import { readFile, writeFile } from "node:fs/promises";
import { TemplateHandler } from "easy-template-x";

const TAGGED = new URL("../templates/at-template-tagged.docx", import.meta.url);
const OUT = new URL("../.tmp-inspect/at-carlito.docx", import.meta.url);

const data = {
  // Header
  relatorio_numero: "20206000",
  seguradora: "Generali Tranquilidade",
  supervisor: "—",
  apolice: "0026047010",
  processo_ocorrencia: "—",
  numero_sinistro: "20260313-001",
  assunto: "Acidente de Trabalho — Vigilante",
  enc_serv: "—",

  // Segurado (entidade empregadora)
  segurado_nome: "RONSEGUR RONDAS SEGURANÇA LDA",
  segurado_nif: "—",
  segurado_morada: "—",
  segurado_contacto: "—",
  segurado_atividade: "Segurança privada",
  segurado_cae: "80100",
  segurado_n_trabalhadores: "—",
  segurado_sst: "—",
  segurado_avaliacao: "—",

  // Sinistrado
  sinistrado_nome: "Carlito (apelido a confirmar)",
  sinistrado_nif: "—",
  sinistrado_morada: "Portimão",
  sinistrado_contacto: "—",
  sinistrado_idade: "—",
  sinistrado_profissao: "Vigilante",
  sinistrado_lesoes: "Rotura de tendão bicípede braquial esquerdo",

  // Section 1
  data_hora_sinistro: "13/03/2026 — 20h00",
  horario_trabalho:
    "O sinistrado exerce a sua actividade profissional como vigilante por conta da empresa RONSEGUR RONDAS SEGURANÇA LDA, em regime de turnos nocturnos das 20h00 às 8h00.",

  // Section 2
  data_hora_visita: "21/04/2026 — 14h30",
  local_acidente: "Centro de Congressos do Arade, Encosta do Arade",
  localidade_concelho: "Parchal, Portimão",
  operacao_tarefa:
    "À data do alegado acidente, o sinistrado encontrava-se no exercício da sua actividade profissional, tendo descrito que, dez minutos antes do início do turno, terá procedido ao levantamento de painéis de protecção que se encontravam caídos junto à entrada do pavilhão.",

  // Sections 3–7
  autoridades: "Não foram accionadas autoridades.",
  tribunais: "Não participado a juízo.",
  bombeiros_inem: "Não foram accionados.",
  act: "Não participado.",
  unidades_saude:
    "O sinistrado deu entrada no Hospital de São Camilo em 17/03/2026, pelas 9h02. Foi posteriormente transferido para o Hospital Particular do Algarve (HPA), onde foi submetido a tratamento cirúrgico em 31/03/2026.",

  // Sections 8–10
  contacto_tomador:
    "Foi estabelecido contacto com a entidade empregadora, na pessoa da Sra. Patrícia Silva. Foi solicitada documentação por correio electrónico, não tendo a mesma sido remetida até à data.",
  versao_sinistrado:
    'No decurso da diligência, o sinistrado prestou as seguintes declarações: "Eu entrei como de costume cerca de 10 minutos mais cedo no trabalho no pavilhão do Arade. Ao chegar reparei que as baias de protecção estavam no chão. Fui levantar as mesmas e ao agarrar num dos blocos de cimento com o braço esquerdo aleijei-me, continuei o trabalho e fui lavar as mãos."',
  testemunha:
    "Foi contactado o Sr. Vito, colega de trabalho do sinistrado, que confirmou ter sido informado pelo próprio.",

  // Section 11
  apreciacao_tecnica: "[a confirmar]",
  analise_local:
    "Foi efectuada deslocação ao local em 21/04/2026, tendo sido obtidas fotografias das baias de protecção e do espaço envolvente. O Sr. José Carlos, responsável diurno do pavilhão, não foi notificado da ocorrência.",
  analise_contacto_tomador:
    "Apesar do contacto efectuado com a entidade empregadora, não foi remetida qualquer documentação solicitada.",
  analise_sst: "[a confirmar]",
  elementos_suspeitos:
    "Foram identificadas incongruências cronológicas entre a participação (13/04/2026, 1h de trabalho) e o relato do sinistrado (13/03/2026, turno completo); divergência no mecanismo da lesão; ausência de registo médico no dia da ocorrência.",
  elementos_prova: "[a confirmar]",

  // Section 12
  conclusoes:
    "Face aos elementos recolhidos, recomenda-se a não validação do presente sinistro como acidente de trabalho, atenta a inconsistência cronológica, a divergência do mecanismo descrito e a ausência de elementos objectivos que corroborem o evento participado.",

  // Closing
  data_relatorio: "Lisboa, 7 de Maio de 2026",
};

const handler = new TemplateHandler();
const buf = await readFile(TAGGED);
const filled = await handler.process(buf, data);
await writeFile(OUT, filled);
console.log(`Wrote ${OUT.pathname}`);
console.log(`Open it in Word/Pages to verify formatting and field placement.`);
