import { z } from "zod";
import { HeaderSchema, PessoaSchema } from "./common";

const t = z.string().optional().default("");

export const SeguradoAtSchema = PessoaSchema.extend({
  atividade: t,
  cae: t,
  numeroTrabalhadores: t,
  servicosSst: t,
  avaliacao: t,
});

export const SinistradoAtSchema = PessoaSchema.extend({
  idade: t,
  profissao: t,
  lesoes: t,
});

export const AtReportSchema = z.object({
  tipo: z.literal("AT").default("AT"),
  header: HeaderSchema.optional(),
  segurado: SeguradoAtSchema.optional(),
  sinistrado: SinistradoAtSchema.optional(),

  dataHoraSinistro: t,
  horarioTrabalho: t,

  dataHoraVisita: t,
  localAcidente: t,
  localidadeConcelho: t,
  operacaoTarefa: t,

  autoridades: t,
  tribunais: t,
  bombeirosInem: t,
  act: t,
  unidadesSaude: t,

  contactoTomador: t,
  versaoSinistrado: t,
  testemunha: t,

  apreciacaoTecnica: t,
  analiseLocal: t,
  analiseContactoTomador: t,
  analiseSst: t,
  elementosSuspeitos: t,
  elementosProva: t,

  conclusoes: t,
  dataRelatorio: t,
});

export type AtReport = z.infer<typeof AtReportSchema>;
