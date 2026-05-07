// Catálogo das secções dos relatórios AT e Auto, usado pelos prompts do Claude
// (geração por secção e routing automático de inputs).

export type SectionDef = {
  id: string;
  titulo: string;
  descricao: string; // o que tipicamente vai aqui — ajuda o LLM
  tipo: "AT" | "AUTO" | "ambos";
};

export const SECCOES: SectionDef[] = [
  // Identificação (ambos)
  { id: "header.numeroRelatorio", titulo: "Nº Relatório", descricao: "Identificador interno do relatório.", tipo: "ambos" },
  { id: "header.seguradora", titulo: "Seguradora", descricao: "Companhia de seguros que mandou averiguar.", tipo: "ambos" },
  { id: "header.apolice", titulo: "Apólice", descricao: "Número de apólice.", tipo: "ambos" },
  { id: "header.numeroSinistro", titulo: "Sinistro", descricao: "Número de sinistro.", tipo: "ambos" },
  { id: "header.assunto", titulo: "Assunto", descricao: "Resumo curto do caso.", tipo: "ambos" },

  // AT — segurado/sinistrado
  { id: "segurado.nome", titulo: "Nome do segurado (entidade empregadora)", descricao: "Nome da empresa/empregador.", tipo: "AT" },
  { id: "segurado.atividade", titulo: "Actividade do segurado", descricao: "Sector de actividade da empresa.", tipo: "AT" },
  { id: "sinistrado.nome", titulo: "Nome do sinistrado", descricao: "Trabalhador acidentado.", tipo: "AT" },
  { id: "sinistrado.profissao", titulo: "Profissão do sinistrado", descricao: "Função desempenhada.", tipo: "AT" },
  { id: "sinistrado.lesoes", titulo: "Lesões do sinistrado", descricao: "Lesões verificadas, exames realizados e tratamentos clínicos.", tipo: "AT" },
  { id: "segurado.avaliacao", titulo: "Avaliação interna do empregador", descricao: "Resultado da avaliação do acidente feita pela própria empresa empregadora.", tipo: "AT" },

  // AT — narrativos
  { id: "horarioTrabalho", titulo: "1.1 Horário de trabalho", descricao: "Regime laboral, horas cumpridas até ao acidente.", tipo: "AT" },
  { id: "operacaoTarefa", titulo: "2.2 Operação / Tarefa", descricao: "Descrição factual da tarefa em execução no momento do acidente.", tipo: "AT" },
  { id: "autoridades", titulo: "3. Autoridades", descricao: "Contactos com GNR/PSP. Confirmar se há registo.", tipo: "AT" },
  { id: "tribunais", titulo: "4. Tribunais", descricao: "Houve participação a juízo?", tipo: "AT" },
  { id: "bombeirosInem", titulo: "5. Bombeiros / INEM", descricao: "Foram accionados? Há registo?", tipo: "AT" },
  { id: "act", titulo: "6. ACT", descricao: "Autoridade para as Condições do Trabalho — foi participado?", tipo: "AT" },
  { id: "unidadesSaude", titulo: "7. Unidades de Saúde", descricao: "Hospitais/clínicas onde o sinistrado foi assistido, datas, exames, diagnósticos.", tipo: "AT" },
  { id: "contactoTomador", titulo: "8. Contacto com Tomador de Seguro", descricao: "Resumo dos contactos com o empregador, documentação solicitada e recebida.", tipo: "AT" },
  { id: "versaoSinistrado", titulo: "9. Versão do sinistrado", descricao: "Declarações do sinistrado (idealmente em discurso directo entre aspas) e contexto da diligência.", tipo: "AT" },
  { id: "testemunha", titulo: "10. Testemunha", descricao: "Identificação e declarações de testemunhas.", tipo: "AT" },
  { id: "apreciacaoTecnica", titulo: "11. Apreciação Técnica do Sinistro", descricao: "Síntese técnica do caso, factos consolidados.", tipo: "AT" },
  { id: "analiseLocal", titulo: "11.1 Análise do local, circunstâncias e causa", descricao: "Análise da deslocação ao local, compatibilidade com a lesão.", tipo: "AT" },
  { id: "analiseContactoTomador", titulo: "11.2 Análise do contacto com Tomador", descricao: "Análise da documentação recebida ou em falta.", tipo: "AT" },
  { id: "analiseSst", titulo: "11.3 Análise SST e enquadramento legal", descricao: "Condições de Segurança e Saúde no Trabalho. Pesquisa em fontes públicas. Controlo de ITA.", tipo: "AT" },
  { id: "elementosSuspeitos", titulo: "11.4 Elementos suspeitos", descricao: "Lista numerada de incongruências, contradições, comportamento limitante.", tipo: "AT" },
  { id: "elementosProva", titulo: "11.5 Elementos de prova", descricao: "Provas objectivas obtidas.", tipo: "AT" },
  { id: "conclusoes", titulo: "12. Definição / Conclusões", descricao: "Conclusões finais e recomendação à seguradora.", tipo: "AT" },

  // Auto — versão simplificada (apenas as secções narrativas mais usadas)
  { id: "local.vestigios", titulo: "Vestígios encontrados no local", descricao: "Marcas de travagem, deformações, vidros, elementos físicos observados na via.", tipo: "AUTO" },
  { id: "local.caracterizacao", titulo: "Caracterização do local / outros elementos", descricao: "Detalhes adicionais sobre o local, contexto envolvente, particularidades.", tipo: "AUTO" },
  { id: "versaoSegurado", titulo: "9. Versão do Segurado / CVS", descricao: "Versão do segurado/condutor sobre o sinistro.", tipo: "AUTO" },
  { id: "versaoTerceiro", titulo: "10. Versão do Terceiro", descricao: "Versão do condutor terceiro.", tipo: "AUTO" },
  { id: "outrosDanosMateriais", titulo: "13. Outros danos materiais", descricao: "Descrição de outros bens danificados.", tipo: "AUTO" },
  { id: "sequenciaEmbates", titulo: "14. Sequência de embates", descricao: "Dinâmica reconstituída do impacto.", tipo: "AUTO" },
  { id: "apreciacaoTecnica", titulo: "16. Apreciação Técnica do Sinistro", descricao: "Síntese técnica do caso.", tipo: "AUTO" },
  { id: "elementosSuspeitos", titulo: "16.1 Elementos suspeitos", descricao: "Incongruências, contradições.", tipo: "AUTO" },
  { id: "elementosProva", titulo: "16.2 Elementos de prova", descricao: "Provas obtidas.", tipo: "AUTO" },
  { id: "conclusoes", titulo: "17. Definição / Conclusões", descricao: "Conclusões e recomendação.", tipo: "AUTO" },
];

export function seccoesPorTipo(tipo: "AT" | "AUTO"): SectionDef[] {
  return SECCOES.filter((s) => s.tipo === tipo || s.tipo === "ambos");
}

export function seccaoPorId(tipo: "AT" | "AUTO", id: string): SectionDef | undefined {
  return seccoesPorTipo(tipo).find((s) => s.id === id);
}
