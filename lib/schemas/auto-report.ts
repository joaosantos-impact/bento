import { z } from "zod";
import { HeaderSchema, PessoaSchema } from "./common";

const t = z.string().optional().default("");

export const VeiculoSchema = z.object({
  matricula: t,
  marcaModelo: t,
  cor: t,
  potencia: t,
});
export type Veiculo = z.infer<typeof VeiculoSchema>;

export const SeguradoAutoSchema = PessoaSchema.extend({
  atividade: t,
  localTrabalho: t,
}).merge(VeiculoSchema);

export const TerceiroAutoSchema = PessoaSchema.extend({
  atividade: t,
  localTrabalho: t,
  seguradora: t,
  apolice: t,
}).merge(VeiculoSchema);

export const CondutorSchema = PessoaSchema.extend({
  profissao: t,
  localTrabalho: t,
  salario: t,
  licenca: t,
  categorias: t,
  tas: t,
  habitual: t, // só para condutor do segurado
  posicaoComissario: t,
  concelhoCirculacao: t, // só para condutor do segurado
  relacaoProprietario: t, // só para condutor do segurado
  relacaoIntervenientes: t,
  outrosDanos: t,
});

export const TestemunhaAutoSchema = PessoaSchema.extend({
  relacao: t,
  local: t,
});

export const FeridosSchema = z.object({
  total: t,
  veiculoSeguro: t,
  veiculoTerceiro: t,
  peoes: t,
});

export const LocalAutoSchema = z.object({
  estrada: t,
  localidadeConcelho: t,
  tracado: t,
  nVias: t,
  visibilidade: t,
  estadoPiso: t,
  larguraFaixa: t,
  larguraBermas: t,
  larguraPasseios: t,
  larguraValetas: t,
  decliveLongitudinal: t,
  decliveTransversal: t,
  sinalizacaoVertical: t,
  sinalizacaoHorizontal: t,
  limiteVelocidade: t,
  estadoTempo: t,
  iluminacao: t,
  intensidadeTrafego: t,
  vestigios: t,
  caracterizacao: t,
});

export const AssistenciaViagemSchema = z.object({
  dataHora: t,
  local: t,
  motivo: t,
  solicitante: t,
  rebocador: t,
});

export const DanosVeiculoSchema = z.object({
  intro: t,
  altimetria: t,
  reparador: t,
  ipo: t,
});

export const AutoReportSchema = z.object({
  tipo: z.literal("AUTO").default("AUTO"),
  header: HeaderSchema.optional(),

  segurado: SeguradoAutoSchema.optional(),
  condutor: CondutorSchema.optional(),
  terceiro: TerceiroAutoSchema.optional(),
  condutorTerceiro: CondutorSchema.optional(),
  testemunha: TestemunhaAutoSchema.optional(),
  feridos: FeridosSchema.optional(),

  dataHoraSinistro: t,
  dataHoraVisita: t,
  local: LocalAutoSchema.optional(),

  autoridades: t,
  tribunais: t,
  apsSegurnet: t,
  assistencia: AssistenciaViagemSchema.optional(),
  bombeirosInem: t,

  versaoSegurado: t,
  versaoTerceiro: t,
  testemunhasSegurado: t,
  testemunhasTerceiro: t,
  outrasTestemunhas: t,

  danosSeguro: DanosVeiculoSchema.optional(),
  danosTerceiro: DanosVeiculoSchema.optional(),
  outrosDanosMateriais: t,
  provaPropriedade: t,
  sequenciaEmbates: t,
  sequenciaSemaforica: t,

  apreciacaoTecnica: t,
  elementosSuspeitos: t,
  elementosProva: t,
  conclusoes: t,

  dataRelatorio: t,
});

export type AutoReport = z.infer<typeof AutoReportSchema>;
