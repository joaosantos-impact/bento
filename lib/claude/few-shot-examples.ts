// Real CAPT-issued reports used as fully-filled examples in the prompt.
// AT — case 20205716 (pedreiro joelho).
// AUTO — case 20205764 (Grândola, IDS, ambos viraram em entroncamento).
// The agent learns BOTH the tone AND that every field is always populated.

export const EXAMPLE_AT_INPUT = `[Caso real — pedreiro com lesão no joelho]

Sinistrado: José Carlos Alves da Glória, 50 anos, pedreiro de 1ª
NIF: 206 864 507
Morada: Rossio da Trindade Bloco 2 1ºF
Contacto: 910 214 103

Tomador (entidade empregadora): Nuno Alberto Marteniano Santos
NIF: 200 457 292
Morada: Av. de Ceuta — Edf. A Nora, Lote 2, Loja A
Contacto: 925 070 234
Atividade: construção de edifícios residenciais e não residenciais
CAE: 41000 — 7 trabalhadores
Sinistrado trabalha para o tomador desde 20/02/2018, vencimento mensal €958 + subsídios

Identificação do processo:
Relatório nº 20205716 / Seguradora Generali Tranquilidade / Sup. Jorge Deus
Apólice 0004852690 / Proc. 0026047009 / Sinistro 00290987758 / Enc. 4713992239
Assunto: Circunstâncias do sinistro

Acidente em 16/03/2026 (segunda) às 09h00 na Rua de Camões 17, Odiáxere, Algarve.
Horário do sinistrado: 08h00-17h00, segunda a sexta.
Tarefa: encontrava-se a rebocar um pilar junto à entrada da habitação, ao baixar-se sentiu dor aguda na parte posterior do joelho direito. Não houve queda, embate, escorregamento, torção, esforço excepcional.

Auxílio: inicialmente disse-me que foi um colega que o ajudou a encostar-se ao carro. Mais tarde, no contacto, alterou e disse que foi o próprio tomador.
Esposa estava perto, em Odiáxere, levou-o ao Hospital do Barlavento (Portimão).

Hospital: Barlavento, 16/03 às 09h30, episódio 86067816. Alta no próprio dia às 11h30. Confirmaram-me telefonicamente o nº de episódio mas não enviaram o relatório de urgência (pedido por email pendente). Foi administrado Paracetamol.
Depois clínica de São Gonçalo (HPA) episódio 426817, encaminhamento para ortopedia. ITA até 02/04/2026, depois alta.

Visita ao local: 21/04/2026 17h00. Vi a obra. Pequeno lanço de escadas, alvenaria revestida a pedra, materiais de construção visíveis. Compatível com tarefas de reboco mas sem vestígios de evento traumático típico (queda, embate, etc).

Tomador: várias chamadas telefónicas sem atender. Deslocação à obra, encontrava-se encerrada. Email de 21/04 a pedir documentação (horário, ponto, ficha de aptidão, procedimentos, avaliação de riscos, 3 últimos recibos, IBAN, relatório interno) — sem resposta. Nenhuma documentação SST facultada.

Sinistrado deu-me 2 recibos: fevereiro 2026 (30 dias, líquido €1095,70) e março 2026 (12 dias, líquido €553,33 — coincide com baixa por sinistro).

Testemunhas: nenhuma identificada.
Autoridades, tribunais, bombeiros/INEM, ACT: nada — não foram accionados, sem registo.

Inquietações para análise:
- Versão sobre quem o auxiliou mudou (colega → patrão)
- Trabalha para o tomador há ~9 anos, proximidade laboral relevante
- Mecanismo descrito (baixar-se) não é evento traumático típico
- Ausência total de documentação do empregador
- Hospital sem relatório clínico ainda

Data do relatório: Ourique, 23 de abril de 2026.
Avr: Gonçalo Bento.`;

export const EXAMPLE_AT_OUTPUT = {
  tipo: "AT" as const,
  header: {
    numeroRelatorio: "20205716",
    seguradora: "Generali Tranquilidade",
    supervisor: "Jorge Deus",
    apolice: "0004852690",
    processoOcorrencia: "0026047009",
    numeroSinistro: "00290987758",
    assunto: "Circunstâncias do sinistro",
    encServ: "4713992239",
  },
  segurado: {
    nome: "Nuno Alberto Marteniano Santos",
    nif: "200 457 292",
    morada: "Av. de Ceuta — Edf. A Nora, Lote 2, Loja A",
    contacto: "925 070 234",
    atividade: "Construção de edifícios residenciais e não residenciais",
    cae: "41000",
    numeroTrabalhadores: "7",
    servicosSst: "Sem informação",
    avaliacao: "Não enviado / não elaborado",
  },
  sinistrado: {
    nome: "José Carlos Alves da Glória",
    nif: "206 864 507",
    morada: "Rossio da Trindade, Bloco 2, 1.º F",
    contacto: "910 214 103",
    idade: "50",
    profissao: "Pedreiro",
    lesoes: "Dor aguda na região posterior do joelho direito.",
  },
  dataHoraSinistro: "16/03/2026 (segunda-feira), pelas 09h00",
  horarioTrabalho:
    "O regime de trabalho do sinistrado compreende o horário semanal das 08h00 às 17h00, de Segunda-feira a Sexta-feira, com descanso semanal aos sábados e domingos. No momento do alegado acidente, o sinistrado encontrava-se em pleno período normal de trabalho, tendo cumprido aproximadamente uma hora de actividade até à ocorrência.",
  dataHoraVisita: "21/04/2026, pelas 17h00",
  localAcidente: "Rua de Camões 17, 8500-250 Odiáxere",
  localidadeConcelho: "Odiáxere, concelho de Lagos, distrito de Faro",
  operacaoTarefa:
    "O sinistrado, José Carlos Alves da Glória, que exerce funções de pedreiro, encontrava-se a realizar trabalhos de reboco num pilar localizado junto ao contador da água, na entrada da habitação, quando, ao efectuar um movimento de flexão do corpo (ao baixar-se), referiu ter sentido uma dor aguda e súbita na região posterior do joelho direito, ficando com dificuldade em caminhar.",
  autoridades:
    "O sinistro em apreço não motivou a intervenção de quaisquer autoridades policiais no local da ocorrência, não constando da participação qualquer indicação nesse sentido.",
  tribunais: "Não participado a juízo.",
  bombeirosInem:
    "Não existiu intervenção de meios de socorro no acidente em análise, tendo o sinistrado sido transportado por familiar à unidade hospitalar.",
  act: "Não participado.",
  unidadesSaude:
    "Na sequência do acidente ocorrido em 16/03/2026, o sinistrado recorreu ao Serviço de Urgência do Hospital do Barlavento, onde deu entrada pelas 09h30, sob o episódio de urgência n.º 86067816, após transporte assegurado por familiar. De acordo com a informação recolhida, o sinistrado teve alta hospitalar no próprio dia, pelas 11h30. Foi estabelecido contacto telefónico com a referida unidade hospitalar, tendo sido possível confirmar o número do episódio de urgência, uma vez que o sinistrado já não dispunha do respectivo comprovativo documental, não tendo sido, contudo, remetida informação adicional. Paralelamente, foi remetido pedido, via correio electrónico, com vista à obtenção do respectivo episódio de urgência, encontrando-se até à presente data a aguardar resposta. No decurso da assistência prestada, foi administrada terapêutica analgésica, designadamente Paracetamol. Da análise à documentação clínica posteriormente disponibilizada, verifica-se que o sinistrado recorreu à Clínica de São Gonçalo (Grupo HPA Saúde), no âmbito do episódio n.º 426817, tendo sido encaminhado para consulta de ortopedia. Foi-lhe atribuída situação de Incapacidade Temporária Absoluta (ITA) até nova reavaliação em 02/04/2026, data em que lhe foi concedida alta clínica.",
  contactoTomador:
    "Foram encetadas diversas diligências com vista à realização de reunião com o tomador do seguro, designadamente através de múltiplos contactos telefónicos, todos sem sucesso. Procedeu-se igualmente a deslocação ao local da obra, verificando-se, contudo, que a mesma se encontrava encerrada, não tendo sido possível estabelecer contacto presencial. Não obstante, foi remetida comunicação electrónica ao tomador do seguro, com vista à obtenção de documentação relevante para instrução do processo, nomeadamente: horário de trabalho, registo de assiduidade/ponto, ficha de aptidão para o trabalho, procedimentos de trabalho para a tarefa executada, avaliação de riscos, três últimos recibos de vencimento, comprovativo de IBAN e relatório interno do acidente. Até à presente data, não foi recebida qualquer resposta por parte do tomador do seguro. Foi facultado pelo sinistrado os dois últimos recibos de vencimento, em anexo. Da análise aos referidos recibos, referentes aos meses de Fevereiro e Março de 2026, verifica-se a identificação do sinistrado como pedreiro de 1.ª, circunstância compatível com a categoria profissional indicada no processo. No que respeita à remuneração, observa-se retribuição mensal base de €958,00, acrescida de subsídios. Em termos gerais, os documentos apresentados indiciam a existência de relação laboral activa entre as partes, bem como compatibilidade entre a categoria profissional declarada, o vínculo remuneratório e a actividade exercida pelo sinistrado.",
  versaoSinistrado:
    'No âmbito da averiguação realizada, foi efectuada deslocação, sem aviso prévio, à residência do sinistrado em 09/04/2026, para a morada constante da participação de acidente de trabalho, indicada como Bairro dos Pescadores, Bloco C, 1.º Esq., em Lagos, não tendo sido possível identificar ou localizar o referido endereço. Perante tal circunstância, foi estabelecido contacto telefónico com o sinistrado, o qual informou encontrar-se a abastecer a sua viatura, após regressar do trabalho, esclarecendo ainda que a morada constante da participação se encontrava incorrecta. O sinistrado formalizou posteriormente a sua versão por escrito, tendo solicitado que a respectiva redacção fosse efectuada pela nossa parte, em virtude de a sua caligrafia ser pouco legível. O teor da declaração foi o seguinte: "Entrei ao serviço às 08 da manhã, estava a fazer o trabalho normal, estava a rebocar um pilar na entrada da obra, quando me abaixei senti uma dor aguda na parte de trás do joelho, já não consegui andar mais, pedi auxílio a um colega para me ajudar a encostar ao carro que estava lá ao pé e liguei à minha mulher que estava lá perto e levou-me para o Hospital de Portimão (Barlavento)." Verbalmente, o sinistrado referiu ainda que se encontrava a executar trabalhos de reboco num pilar situado junto à entrada da obra, tarefa habitual nas suas funções, e que ao baixar-se, sem que nada fizesse prever, sentiu uma dor aguda e repentina na parte de trás do joelho direito, ficando com dificuldade em andar. Referiu igualmente que trabalha para o tomador do seguro há cerca de 9 anos.',
  testemunha:
    "Não foram referidas, nem identificadas, quaisquer testemunhas oculares ou não oculares relativamente ao sinistro em apreço.",
  apreciacaoTecnica:
    "O sinistrado exerce funções de pedreiro para o Tomador desde 20/02/2018, auferindo um vencimento base mensal de €958,00, acrescido de subsídio de refeição e duodécimos, conforme recibos de vencimento juntos em anexo. O seu regime de trabalho compreende o horário das 08h00 às 17h00, de segunda a sexta-feira. O acidente participado, objecto do presente relatório, ocorreu no dia 16/03/2026, no decurso da execução de tarefas inerentes à actividade profissional do sinistrado. Em termos cronológicos, a ocorrência situa-se em período normal de trabalho e em contexto directamente relacionado com a prestação laboral, verificando-se compatibilidade entre o momento do evento, o horário praticado e a actividade profissional desempenhada. Da apreciação técnica da dinâmica participada, verifica-se que a mesma não evidencia, de forma objectiva e inequívoca, a ocorrência de um evento súbito, fortuito, externo e anormal, normalmente associado ao conceito clássico de Acidente de Trabalho. Com efeito, o mecanismo descrito reconduz-se a um movimento corrente e habitual de flexão corporal, sem notícia de incidente traumático identificável, acidente materializado ou causa externa concreta que permita individualizar um acontecimento lesivo autónomo. A mera manifestação súbita de dor durante a actividade laboral, desacompanhada de evento traumático determinado, pode igualmente ser compatível com processo de natureza interna, degenerativa, inflamatória ou patológica pré-existente, ainda que até então assintomático, hipótese que carece de adequada validação clínica.",
  analiseLocal:
    "Procedeu-se à observação do local indicado para a ocorrência, correspondendo o mesmo à entrada de uma habitação em fase de intervenção, onde se encontravam visíveis materiais de construção e zonas com trabalhos em curso. O acesso principal ao imóvel é efectuado através de pequeno lanço de escadas exteriores, ladeado por estruturas em alvenaria revestidas a pedra, existindo igualmente área lateral contígua onde se observavam baldes, recipientes de obra e outros materiais normalmente associados a trabalhos de construção civil. As características do local mostram-se compatíveis com a execução de tarefas de reboco, acabamento e manutenção, designadamente em pilares, muros e superfícies adjacentes à entrada da habitação, tal como descrito pelo sinistrado. Não foram identificados, no decurso da visita, elementos objectivos susceptíveis de evidenciar acidente por queda em altura, escorregamento, colapso estrutural, embate com objectos ou outro mecanismo traumático externo directamente relacionado com o episódio participado. A dinâmica relatada pelo sinistrado assenta, essencialmente, na execução de um movimento de flexão corporal ao baixar-se para realização da tarefa, momento em que refere ter sentido dor súbita na região posterior do joelho. Assim, em termos técnicos, o local apresenta compatibilidade com o contexto laboral descrito, porém não evidencia factores materiais externos determinantes do acidente. Face ao exposto, perante os elementos disponíveis, o episódio participado suscita reservas quanto ao preenchimento dos pressupostos técnico-jurídicos de acidente de trabalho.",
  analiseContactoTomador:
    "Foram realizadas diversas tentativas de contacto telefónico com o Tomador do seguro, sem sucesso. Foi igualmente efectuada deslocação ao local da obra, verificando-se que a mesma se encontrava encerrada. Não foi, por isso, possível recolher esclarecimentos presenciais junto do Tomador. Em 21/04/2026, foi remetido email ao Tomador, Nuno Alberto Marteniano Santos, solicitando documentação relevante para análise do sinistro, mas até à data não obtivemos qualquer resposta ao referido pedido. Não foi igualmente remetida qualquer documentação adicional pela entidade empregadora. O sinistrado facultou, contudo, os dois últimos recibos de vencimento, que permitiram confirmar, de forma indiciária, vínculo laboral activo, categoria profissional de pedreiro e vencimento base mensal de €958,00. A ausência de resposta do Tomador limitou a averiguação de elementos relevantes, nomeadamente presença ao serviço, organização do trabalho, tarefas executadas e registo interno da ocorrência. Tal postura revela reduzido grau de colaboração processual por parte da entidade empregadora.",
  analiseSst:
    "O sinistrado exercia funções de pedreiro, actividade integrada no sector da construção civil, contexto profissional que, pela sua natureza, apresenta riscos específicos e exige particular atenção ao nível da Segurança e Saúde no Trabalho. Atentas as tarefas normalmente associadas à função, impõe-se a existência de medidas preventivas adequadas, identificação prévia de riscos e definição de procedimentos de trabalho seguro. No âmbito do presente processo, não foi disponibilizada pelo Tomador do seguro qualquer documentação relativa a SST. Em concreto, não foram remetidos elementos como avaliação de riscos profissionais, procedimentos internos de segurança, registos de formação ministrada ao trabalhador, ficha de aptidão médica ou relatório interno referente ao acidente participado. Tal ausência documental impede confirmar, de forma objectiva, se se encontravam cumpridas as obrigações legais da entidade empregadora em matéria de prevenção e protecção do trabalhador. Nos termos da Lei n.º 98/2009, de 4 de Setembro, considera-se acidente de trabalho aquele que se verifique no local e no tempo de trabalho e produza, directa ou indirectamente, lesão corporal, perturbação funcional ou doença de que resulte redução na capacidade de trabalho ou de ganho. Para esse enquadramento, a doutrina tem vindo a exigir, em regra, a verificação de um acontecimento súbito, exterior ou objectivamente determinável, ocorrido por ocasião do trabalho e com nexo causal entre o evento e a lesão apurada. No caso em apreço, embora a queixa dolorosa tenha surgido durante o período normal de trabalho, a dinâmica descrita não evidencia, de forma objectiva, a ocorrência de queda, embate, esforço excepcional ou outro evento traumático concreto. Na ausência desses elementos, subsistem reservas quanto ao preenchimento integral dos pressupostos legais de acidente de trabalho.",
  elementosSuspeitos:
    "No decurso da averiguação, foram identificados os seguintes elementos susceptíveis de suscitar reservas quanto à consistência integral do relato apresentado:\n\n• Alteração do relato quanto à pessoa que terá prestado auxílio imediato ao sinistrado: inicialmente foi indicado um colega, vindo posteriormente a ser referido o próprio tomador do seguro como interveniente no auxílio prestado.\n\n• Manifestação de descontentamento perante o processo de averiguação no decurso de contacto efectuado, contexto em que se registaram esclarecimentos adicionais e reformulação parcial do relato anteriormente prestado.\n\n• Relação laboral entre o sinistrado e o tomador com duração relevante (desde 20/02/2018), circunstância que poderá traduzir natural proximidade profissional entre as partes.\n\n• Ausência total de colaboração documental por parte do Tomador, não tendo sido remetida qualquer documentação solicitada nem informação relativa às condições de SST.\n\n• Mecanismo descrito (mera flexão corporal ao baixar-se) que, por si só, não evidencia factor traumático externo apto a individualizar um acidente típico.\n\n• Inexistência, até à presente data, de relatório clínico do episódio inicial de urgência que permita confirmar diagnóstico objectivo de lesão aguda traumática compatível com o mecanismo descrito.",
  elementosProva:
    "Constituem elementos de prova obtidos no decurso da presente averiguação: depoimento escrito do sinistrado, recolhido por nossa via na sequência de deslocação efectuada; dois últimos recibos de vencimento facultados pelo próprio sinistrado, referentes aos meses de Fevereiro e Março de 2026, que permitiram aferir vínculo laboral activo, categoria profissional e remuneração; reportagem fotográfica do local da ocorrência, captada no decurso da diligência de 21/04/2026; confirmação telefónica junto do Hospital do Barlavento do número de episódio de urgência atribuído (n.º 86067816); documentação clínica parcial relativa ao acompanhamento na Clínica de São Gonçalo (HPA Saúde), incluindo período de Incapacidade Temporária Absoluta atribuído. Encontra-se pendente o envio do relatório de urgência hospitalar, solicitado por correio electrónico, cuja análise será objecto de oportuno aditamento.",
  conclusoes:
    "Para que determinado evento possa ser qualificado como Acidente de Trabalho, exige-se, em termos gerais, a verificação de um acontecimento súbito, fortuito, inesperado e causalmente relacionado com o trabalho, do qual resulte lesão corporal, perturbação funcional ou doença, nos termos do artigo 8.º da Lei n.º 98/2009, de 4 de Setembro. Face ao exposto e a tudo quanto anteriormente se analisou, é nosso entendimento que o sinistro participado suscita reservas quanto ao seu enquadramento como acidente de trabalho, porquanto, de acordo com os elementos apurados até à presente data, não se mostra objectivamente demonstrada a existência de qualquer agente ou factor externo apto a desencadear a lesão participada. Com efeito, o sinistrado descreveu que, quando se encontrava a executar tarefas habituais de reboco, ao baixar-se sentiu uma dor aguda na região posterior do joelho, não tendo sido relatada queda, embate, escorregamento, torção evidente, esforço excepcional ou outro acontecimento traumático concreto susceptível de individualizar um evento acidental típico. A dinâmica participada reconduz-se, assim, à manifestação súbita de sintomatologia dolorosa durante a execução de gesto funcional corrente, circunstância que pode igualmente revelar compatibilidade com processo de natureza interna, degenerativa, inflamatória ou patológica pré-existente, ainda que até então assintomático. Acresce que, apesar das diligências encetadas, não foi possível obter documentação clínica completa do episódio inicial de urgência que permitisse confirmar diagnóstico objectivo de lesão aguda traumática compatível com o mecanismo descrito. Importa ainda referir que, no decurso da averiguação, surgiram incongruências parciais no relato do sinistrado, designadamente quanto à identificação da pessoa que lhe terá prestado auxílio imediato após o evento, circunstância que, não sendo determinante por si só, deverá ser ponderada na apreciação global da consistência da versão apresentada. Assim, com os elementos actualmente disponíveis, não se mostra suficientemente demonstrado o nexo causal entre a dinâmica descrita e as queixas apresentadas pelo sinistrado, nem integralmente preenchidos os pressupostos legalmente exigidos para qualificação do evento como acidente de trabalho. Damos, assim, por terminada a nossa intervenção no presente processo, ficando ao dispor desta Companhia de Seguros para a realização de diligências complementares que entendam por convenientes, designadamente caso venha a ser disponibilizada documentação clínica adicional.",
  dataRelatorio: "Ourique, 23 de Abril de 2026",
};

export const EXAMPLE_AUTO_INPUT = `[Caso real — colisão em entroncamento, ambos viraram, IDS]

Identificação do processo:
Relatório nº 20205764 / Seguradora CA Seguros S.A. / Sup. SNunes
Apólice 03735461 / Proc. P226M06607 / Sinistro --- (não atribuído) / Enc. 260A1039D101
Assunto: Apuramento de Circunstâncias - Averiguação IDS

Segurado/Proprietária: Ana Cristina Simão Aniceto, NIF 198404239, mora na Rua do Comércio nº 2, 7900-319 Santa Margarida do Sado. Contacto 936768729. Local de trabalho/Sede: Grândola.
Veículo Seguro (VS): Dacia Duster, matrícula BZ-36-QD, branco, 101 CV.

Condutor do VS (CVS): Luana Isabel Aniceto Garcia (filha da segurada), NIF 247468363, mesma morada, contacto 926876046. Profissão: Logista. Lic. Condução SE-4210599, categorias B1, B. TAS não realizado. NÃO é condutora habitual. Concelho de circulação habitual: Grândola.

Terceiro 1: Bruno Miguel Bacalhau Costa, NIF 254861873, mora na Rua Tenente Coronel Salgueiro Maia nº10, 7570-316 Grândola, contacto 961640476. Profissão: desempregado. Veículo Terceiro (VT): Citroen Saxo, matrícula 75-96-RO, cinza. Seguradora: Zurich, apólice 010173948.
Condutor do VT é o próprio Bruno (mesmos dados). Lic. SE-434593, categorias B1, B. TAS não realizado.

Testemunhas:
- Testemunha 1 (do VS): Margarida da Costa Marino, NIF 207815540, mora R. Almirante Reis 3 7570-216 Grândola, contacto 936050019. Relação: amiga da CVS. No interior do VS na altura.
- Testemunha 2 (do VT): Roberto Manuel Serra Camacho, NIF 258929960, mora R. 1 de Maio 7570-154 Grândola, contacto 967001518. Relação: amigo do CVT. No interior do VT.

Sinistro:
Data: 03 de abril de 2026, 18h15.
Local: Rua António Dias dos Santos, Grândola. Entroncamento em zona urbana.
Visita ao local: 08/04/2026 14h00.

Características da via:
- Traçado: entroncamento. 2 vias de trânsito (uma por sentido). Visibilidade superior a 50m.
- Piso alcatroado, em bom estado.
- Faixa rodagem ~7m, sem bermas, sem valetas, com passeios de ~1m em ambos os lados.
- Declives: indeterminados.
- Sinalização vertical e horizontal: inexistente.
- Limite de velocidade: 50 km/h.
- Estado do tempo: bom, céu limpo. Iluminação diurna.
- Tráfego reduzido (zona rural dentro da localidade).
- Vestígios físicos no local: plásticos e estilhaços de vidro do VT.

Dinâmica:
- VS circulava em via secundária adjacente, fez manobra de mudança de direção à esquerda para entrar na Rua António Dias dos Santos.
- VT circulava na Rua António Dias dos Santos e fez mudança de direção à direita para entrar na via de onde o VS saía.
- Trajectórias convergiram no cruzamento. Embate entre frontal-esquerda do VS e frontal do VT.
- CVT diz que VS cortou a curva. Testemunha do VT confirma. Testemunha do VS diz que ambos têm culpa (VS encurtou, VT alargou). CVS diz que não consegue precisar a dinâmica, foi muito rápido.

Danos:
- VS (Dacia Duster, BZ-36-GD): para-choques frontal danificado lateral esquerda, plásticos partidos a 35-57cm de altimetria, deformações na pintura a 49-73cm. Reparador: AutoOne. IPO: ---
- VT (Citroen Saxo, 75-96-RO): danos frontal — para-choques, grelha, capot deformados/rotos, grupos óticos comprometidos. Reparador: --- (já estava em oficina antes da visita). IPO: ---

Outros:
- 0 feridos.
- Não foram chamadas autoridades. GNR de Aljezur confirmou que não há registo associado às matrículas.
- Tribunais: não participado.
- APS/Segurnet: VT esteve sem apólice activa entre 28/05/2024 e 04/11/2025 (CVT diz que era veículo da mãe parado, destinado a ser oferecido ao filho quando tirasse carta).
- Bombeiros/INEM: não accionados, sinistro só com danos materiais.
- Declaração amigável foi preenchida por uma terceira pessoa não identificada (residente nas proximidades). Progenitor do CVT diz que está mal preenchida e tentou contactar a pessoa, sem êxito.
- Sem elementos suspeitos relevantes.

Enquadramento provável: Caso 21 da Tabela Prática de Responsabilidades — dois veículos em sentidos contrários numa via de duas faixas, colisão sem prova de invasão de via. Responsabilidade 50/50.

Data do relatório: Ourique, 16 de abril de 2026. Avr: Gonçalo Bento. Sup: Cheila Ferreira.`;

export const EXAMPLE_AUTO_OUTPUT = {
  tipo: "AUTO" as const,
  header: {
    numeroRelatorio: "20205764",
    seguradora: "CA Seguros S.A.",
    supervisor: "SNunes",
    apolice: "03735461",
    processoOcorrencia: "P226M06607",
    numeroSinistro: "[a confirmar]",
    assunto: "Apuramento de Circunstâncias — Averiguação IDS",
    encServ: "260A1039D101",
  },
  segurado: {
    nome: "Ana Cristina Simão Aniceto",
    nif: "198404239",
    morada: "Rua do Comércio nº 2, 7900-319 Santa Margarida do Sado",
    contacto: "936768729",
    atividade: "[a confirmar]",
    localTrabalho: "Grândola",
    matricula: "BZ-36-QD",
    marcaModelo: "Dacia Duster",
    cor: "Branco",
    potencia: "101 CV",
  },
  condutor: {
    nome: "Luana Isabel Aniceto Garcia",
    nif: "247468363",
    morada: "Rua do Comércio nº 2, 7900-319 Santa Margarida do Sado",
    contacto: "926876046",
    profissao: "Logista",
    localTrabalho: "[a confirmar]",
    salario: "[a confirmar]",
    licenca: "SE-4210599",
    categorias: "B1, B",
    tas: "Não realizou",
    habitual: "Não",
    posicaoComissario: "[a confirmar]",
    concelhoCirculacao: "Grândola",
    relacaoProprietario: "Filha da proprietária",
    relacaoIntervenientes: "Sem relação prévia com o terceiro",
    outrosDanos: "Não foram reclamados",
  },
  terceiro: {
    nome: "Bruno Miguel Bacalhau Costa",
    nif: "254861873",
    morada: "Rua Tenente Coronel Salgueiro Maia nº 10, 7570-316 Grândola",
    contacto: "961640476",
    atividade: "Desempregado",
    localTrabalho: "[a confirmar]",
    matricula: "75-96-RO",
    marcaModelo: "Citroen Saxo",
    cor: "Cinza",
    potencia: "[a confirmar]",
    seguradora: "Zurich",
    apolice: "010173948",
  },
  condutorTerceiro: {
    nome: "Bruno Miguel Bacalhau Costa",
    nif: "254861873",
    morada: "Rua Tenente Coronel Salgueiro Maia nº 10, 7570-316 Grândola",
    contacto: "961640476",
    profissao: "Desempregado",
    localTrabalho: "[a confirmar]",
    salario: "[a confirmar]",
    licenca: "SE-434593",
    categorias: "B1, B",
    tas: "Não realizou",
    posicaoComissario: "[a confirmar]",
    relacaoIntervenientes: "Sem relação prévia com o segurado",
    outrosDanos: "Não foram reclamados",
  },
  testemunha: {
    nome: "Margarida da Costa Marino",
    nif: "207815540",
    morada: "R. Almirante Reis 3, 7570-216 Grândola",
    contacto: "936050019",
    relacao: "Amiga do CVS",
    local: "No interior do VS",
  },
  feridos: {
    total: "0",
    veiculoSeguro: "0",
    veiculoTerceiro: "0",
    peoes: "0",
  },
  dataHoraSinistro: "03 de Abril de 2026, pelas 18h15",
  dataHoraVisita: "08 de Abril de 2026, pelas 14h00",
  local: {
    estrada: "Rua António Dias dos Santos",
    localidadeConcelho: "Grândola",
    tracado: "Entroncamento",
    nVias: "2 (uma por sentido)",
    visibilidade: "Superior a 50 metros",
    estadoPiso: "Alcatroado, em bom estado de conservação",
    larguraFaixa: "Aproximadamente 7 metros",
    larguraBermas: "Inexistente",
    larguraPasseios: "Existentes, com aproximadamente 1 metro",
    larguraValetas: "Inexistente",
    decliveLongitudinal: "[a confirmar]",
    decliveTransversal: "[a confirmar]",
    sinalizacaoVertical: "Inexistente",
    sinalizacaoHorizontal: "Inexistente",
    limiteVelocidade: "50 km/h",
    estadoTempo: "Bom, sem precipitação, céu limpo",
    iluminacao: "Diurna",
    intensidadeTrafego: "Reduzido, zona rural dentro da localidade",
    vestigios:
      "Foram encontrados vestígios físicos do sinistro, designadamente plásticos e estilhaços de vidro provenientes do veículo terceiro.",
    caracterizacao:
      "O local do sinistro corresponde a um cruzamento em zona urbana, inserido na Rua António Dias dos Santos, no concelho de Grândola. A via apresenta duas faixas de rodagem, uma por sentido, com largura total de aproximadamente 7 metros, sem bermas nem valetas, e com passeios de aproximadamente 1 metro em ambos os lados. O traçado não apresenta curvas acentuadas na zona de confluência, sendo a visibilidade razoável, ainda que potencialmente condicionada pela proximidade de construções urbanas. Não se identifica sinalização vertical ou horizontal reguladora de prioridade na zona do entroncamento.",
  },
  autoridades:
    "Do contacto efectuado com a GNR de Aljezur, foi confirmado não existir qualquer registo associado às matrículas intervenientes. A informação está conforme com o mencionado pela CVS, no sentido de não terem sido chamadas autoridades a intervir, tendo os intervenientes procedido ao preenchimento da Declaração Amigável de Acidente Automóvel.",
  tribunais: "Não participado a juízo.",
  apsSegurnet:
    "Da consulta efectuada, verificou-se que o veículo terceiro permaneceu sem apólice de seguro activa no período compreendido entre 28/05/2024 e 04/11/2025. No âmbito da averiguação, o CVT, bem como o respectivo progenitor, foram questionados acerca da referida ausência de seguro, tendo ambos declarado que tal situação se deveu ao facto de o veículo se encontrar imobilizado. Segundo os mesmos, o veículo pertencia à mãe do CVT e destinava-se a ser oferecido ao filho aquando da obtenção da carta de condução, motivo pelo qual permaneceu parado durante o referido período, não tendo sido considerada necessária a contratação de seguro. Face ao exposto, a ausência de apólice no período indicado foi justificada pela inactividade do veículo.",
  assistencia: {
    dataHora: "[a confirmar]",
    local: "[a confirmar]",
    motivo: "Sem accionamento de assistência em viagem",
    solicitante: "[a confirmar]",
    rebocador: "[a confirmar]",
  },
  bombeirosInem:
    "Sinistro apenas com danos materiais, sem intervenção de meios de socorro nem accionamento de bombeiros ou INEM.",
  versaoSegurado:
    'No dia 8 de Abril de 2026, deslocámo-nos ao local indicado pela CVS, tendo procedido à sua audição. Solicitamos à CVS a sua descrição do ocorrido, tendo esta explicado e seguidamente declarado por escrito o seguinte: "Eu estava a sair da casa de uma amiga, porque a minha mãe me pediu para ir às compras. Como não queria ir sozinha fui buscá-la. Saímos pela parte de trás da rua, eu costumo sair por aquela estrada e ao fazer a curva para entrar para a rua António Dias dos Santos o outro carro também estava a fazer a curva para entrar por onde eu estava a sair e acabámos batendo." Verbalmente referiu ainda que costuma circular com frequência naquele cruzamento e conhece bem o respectivo traçado, tratando-se da primeira vez em que se deparou, naquele ponto exacto, com outro veículo a efectuar manobra de mudança de direcção em sentido contrário ao seu. Após o embate ficou em estado de nervosismo intenso, tendo sido a testemunha que a acompanhava a estabelecer contacto com o outro interveniente. Ambos os veículos foram imobilizados junto ao passeio para efeitos de preenchimento da declaração amigável, retomando posteriormente a marcha. Negou qualquer conhecimento prévio do outro interveniente e declarou não conseguir descrever com precisão a dinâmica do sinistro, dado o acontecimento ter decorrido de forma muito rápida.',
  versaoTerceiro:
    'No dia 8 de Abril de 2026, foi efectuado contacto telefónico com o CVT, tendo sido agendada deslocação para o mesmo dia. Deslocámo-nos ao local do sinistro, onde se encontravam o CVT e o seu progenitor. Foi-nos informado que o veículo terceiro contava com uma testemunha, um amigo que seguia no mesmo veículo, o qual se deslocou posteriormente ao local para prestar depoimento. O progenitor do CVT informou-nos que a declaração amigável havia sido preenchida de forma incorrecta por uma terceira pessoa residente nas proximidades, não identificada, com a qual não foi possível restabelecer contacto. Solicitámos ao CVT a sua descrição do ocorrido, tendo este declarado por escrito o seguinte: "Eu ia na minha via e a rapariga cortou a curva por dentro da minha sem reparar que o meu carro vinha e só se apercebeu depois de bater." Verbalmente referiu ainda que circulava na sua faixa de rodagem quando a CVS efectuou manobra de mudança de direcção, invadindo a sua trajectória e embatendo no veículo terceiro. Acrescentou que a CVS aparentava estar distraída no momento do embate. Negou qualquer conhecimento prévio da contraparte.',
  testemunhasSegurado:
    'A CVS indicou como testemunha presencial a sua amiga, Margarida da Costa Marino, que a acompanhava no interior do veículo seguro. No dia 8 de Abril de 2026, deslocámo-nos às bombas de combustível BP de Grândola, local combinado pela testemunha do VS, tendo procedido à sua audição. A testemunha declarou por escrito o seguinte: "A Luana apanhou-me em casa para irmos às compras, quando estávamos na rua onde ocorreu o acidente, ela vinha na faixa dela, a rua é apertada, o jipe é um carro largo e ambos fizeram a curva ao mesmo tempo, ela encurtou a curva e ele abriu um pouco. Depois de bater saí do carro porque a Luana estava nervosa, perguntei o que o rapaz queria fazer, ele assumiu logo a sua parte da culpa e todos chegámos à conclusão de fazer participação amigável." Verbalmente acrescentou que foi quem falou com o CVT, porque a CVS estava demasiado nervosa, e que, na sua leitura, ambos os condutores tiveram responsabilidade — a CVS terá encurtado a curva e o CVT alargado a sua.',
  testemunhasTerceiro:
    'O CVT indicou como testemunha o seu amigo, Roberto Manuel Serra Camacho, que seguia consigo no veículo terceiro. No dia 8 de Abril de 2026, deslocámo-nos ao local do sinistro, tendo a testemunha aí comparecido para prestar depoimento. A testemunha declarou por escrito o seguinte: "Nós íamos fazer a curva pela nossa mão, e o outro carro vinha no meio da estrada e bateram na nossa mão." Verbalmente reiterou a versão prestada pelo CVT, no sentido de o veículo terceiro circular regularmente na sua faixa de rodagem quando o veículo seguro invadiu a respectiva trajectória.',
  outrasTestemunhas:
    "Não foram identificadas outras testemunhas presenciais com conhecimento directo do sinistro.",
  danosSeguro: {
    intro:
      "Da análise presencial ao veículo seguro (Dacia Duster, matrícula BZ-36-QD), verificámos que o para-choques frontal apresentava-se danificado, designadamente na sua parte lateral esquerda, com plásticos partidos e deformações na pintura compatíveis com embate frontal.",
    altimetria:
      "Os danos identificados situam-se a aproximadamente 35 a 57 cm de altimetria, na face lateral esquerda do para-choques (plásticos partidos), e a 49 a 73 cm de altimetria, na pintura da lateral esquerda da viatura (deformações). A localização e tipologia dos danos são compatíveis com contacto com a zona frontal de outro veículo em manobra convergente.",
    reparador: "AutoOne",
    ipo: "[a confirmar]",
  },
  danosTerceiro: {
    intro:
      "Da análise presencial ao veículo terceiro (Citroen Saxo, matrícula 75-96-RO), foram observados danos na zona frontal, com especial incidência no para-choques dianteiro, grelha frontal e capot, apresentando deformações acentuadas, roturas e desencaixe de componentes, bem como danos nos grupos ópticos e exposição de elementos internos, compatíveis com impacto frontal.",
    altimetria:
      "Os danos verificados estendem-se desde a base do para-choques até à zona do capot, em altimetria sucessiva e contínua, evidenciando contacto frontal com outro veículo em trajectória convergente.",
    reparador: "[a confirmar]",
    ipo: "[a confirmar]",
  },
  outrosDanosMateriais: "Não foram reclamados outros danos materiais.",
  provaPropriedade:
    "A propriedade dos veículos foi aferida através dos respectivos Documentos Únicos Automóvel (DUA), facultados pelos intervenientes e juntos em anexo.",
  sequenciaEmbates:
    "O sinistro consistiu numa única colisão. O veículo seguro, em manobra de mudança de direcção à esquerda, e o veículo terceiro, em manobra de mudança de direcção à direita, convergiram no interior do entroncamento, ocorrendo contacto entre a zona frontal-esquerda do veículo seguro e a zona frontal do veículo terceiro. Após o embate, ambos os veículos foram imobilizados junto ao passeio para preenchimento da declaração amigável, retomando posteriormente a marcha.",
  sequenciaSemaforica:
    "Não aplicável — o entroncamento em causa não dispõe de regulação semafórica nem de sinalização vertical ou horizontal reguladora de prioridade.",
  apreciacaoTecnica:
    "Em resposta à solicitação de serviço, foram efectuadas as diligências consideradas necessárias para verificação dos factos comunicados e análise das circunstâncias em que ocorreu o sinistro, tendo sido possível apurar o seguinte: o sinistro ocorreu no dia 03 de Abril de 2026, pelas 18h15, na Rua António Dias dos Santos, no concelho de Grândola, num cruzamento inserido em zona urbana. O veículo seguro circulava numa via secundária adjacente e executava manobra de mudança de direcção à esquerda com o propósito de ingressar na Rua António Dias dos Santos. Em simultâneo, o veículo terceiro circulava na Rua António Dias dos Santos e executava manobra de mudança de direcção à direita para ingressar na mesma via de onde o veículo seguro saía. O local não dispõe de sinalização vertical nem horizontal, encontrando-se em vigor o limite de velocidade de 50 km/h, próprio de zonas urbanas. Segundo a versão do CVT, corroborada pela testemunha que o acompanhava, o veículo seguro terá cortado a curva, invadindo a via de trânsito do veículo terceiro. A testemunha que acompanhava a CVS declarou que ambos os intervenientes tiveram responsabilidade no sinistro, referindo que o veículo seguro encurtou a curva e o veículo terceiro alargou a mesma. A CVS afirmou não conseguir precisar com clareza a dinâmica do embate, declarando que o acontecimento foi muito rápido. As trajectórias de ambos os veículos convergiram no interior do cruzamento, tendo ocorrido colisão entre a zona frontal esquerda do veículo seguro e a zona frontal do veículo terceiro. A localização e tipologia dos danos em ambos os veículos apresentam correspondência entre si, sendo compatíveis com um embate ocorrido durante manobras de mudança de direcção em sentido convergente, no interior do entroncamento. Face às versões apresentadas, verifica-se divergência quanto à dinâmica exacta do sinistro, nomeadamente no que respeita ao posicionamento dos veículos na faixa de rodagem e eventual invasão de via por parte de qualquer dos intervenientes.",
  elementosSuspeitos: "Não foram identificados elementos suspeitos no decurso da averiguação.",
  elementosProva:
    "Constituem elementos de prova obtidos no decurso da presente averiguação: declaração escrita da CVS, recolhida em 8 de Abril de 2026; declaração escrita do CVT, recolhida no local do sinistro em 8 de Abril de 2026; declaração escrita da testemunha do veículo seguro, Sra. Margarida da Costa Marino; declaração escrita da testemunha do veículo terceiro, Sr. Roberto Manuel Serra Camacho; reportagem fotográfica do local do sinistro e dos danos verificados em ambos os veículos; Declaração Amigável de Acidente Automóvel preenchida pelos intervenientes (com reservas quanto ao seu valor probatório, atenta a redacção por terceiro não identificado); Documentos Únicos Automóvel de ambos os veículos; documentação pessoal e cartas de condução dos intervenientes e respectivas testemunhas; confirmação telefónica junto da GNR de Aljezur quanto à ausência de registo policial do evento.",
  conclusoes:
    "No decurso das diligências realizadas para a boa instrução do processo, apurou-se que o sinistro consistiu numa colisão ocorrida no dia 03 de Abril de 2026, pelas 18h15, na Rua António Dias dos Santos, no concelho de Grândola, num cruzamento em zona urbana, sem sinalização vertical ou horizontal reguladora de prioridade. O veículo seguro executava manobra de mudança de direcção à esquerda para ingressar na referida artéria. Em simultâneo, o veículo terceiro executava manobra de mudança de direcção à direita para a mesma via. As trajectórias de ambos os veículos convergiram no interior do cruzamento, tendo ocorrido colisão entre a zona frontal esquerda do veículo seguro e a zona frontal do veículo terceiro. As versões apresentadas pelos intervenientes são divergentes quanto ao posicionamento exacto de cada veículo no momento do embate. O CVT afirmou circular na sua via de trânsito, tendo o veículo seguro invadido a sua trajectória. A CVS não soube precisar a dinâmica do sinistro, declarando que o acontecimento decorreu de forma muito rápida. A testemunha que acompanhava a CVS, única testemunha presencial sem interesse directo declarado na versão de qualquer dos intervenientes, afirmou que ambos contribuíram para o sinistro, tendo o veículo seguro encurtado a curva e o veículo terceiro alargado a mesma. Não existem elementos objectivos que permitam determinar com certeza qual dos veículos invadiu a faixa de rodagem do outro. Não foram chamadas autoridades ao local, não existe registo policial do sinistro e a declaração amigável foi preenchida por uma terceira pessoa não identificada, não tendo valor probatório autónomo quanto à dinâmica. Face ao exposto, e na ausência de prova inequívoca de mudança de via por parte de qualquer dos intervenientes, o presente sinistro enquadra-se no Caso 21 da Tabela Prática de Responsabilidades, que prevê a situação em que dois veículos circulam em sentidos contrários numa via de duas faixas de rodagem e colidem, sem que exista prova de invasão de via por parte de nenhum deles. Neste caso, a responsabilidade é repartida em 50% para cada interveniente. Damos, assim, por concluída a nossa intervenção no presente processo, permanecendo ao dispor desta Companhia de Seguros para eventuais diligências complementares que venham a ser consideradas necessárias.",
  dataRelatorio: "Ourique, 16 de Abril de 2026",
};
