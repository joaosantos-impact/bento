// Reads templates/auto-template.docx, inserts {tag} placeholders for every fillable
// field, and writes templates/auto-template-tagged.docx. Run once.
import { readFile, writeFile } from "node:fs/promises";
import JSZip from "jszip";

const SRC = new URL("../templates/auto-template.docx", import.meta.url);
const OUT = new URL("../templates/auto-template-tagged.docx", import.meta.url);

const ANCHORS = [
  // Header
  { match: "Relatório n.º", tag: "relatorio_numero", kind: "next-cell" },
  { match: "Seguradora", tag: "seguradora", kind: "next-cell" },
  { match: "Sup.:", tag: "supervisor", kind: "next-cell" },
  { match: "Apólice n.º", tag: "apolice", kind: "next-cell" },
  { match: "Proc./ Ocorr. n.º", tag: "processo_ocorrencia", kind: "next-cell" },
  { match: "Sinistro n.º", tag: "numero_sinistro", kind: "next-cell" },
  { match: "Assunto", tag: "assunto", kind: "next-cell" },
  { match: "Enc./ Serv. n.º", tag: "enc_serv", kind: "next-cell" },

  // Segurado + veículo
  { match: "Segurado /Nome", tag: "segurado_nome", kind: "next-cell" },
  { match: "NIF", tag: "segurado_nif", kind: "next-cell" },
  { match: "Morada", tag: "segurado_morada", kind: "next-cell" },
  { match: "Contacto", tag: "segurado_contacto", kind: "next-cell" },
  { match: "Profissão /Atividade", tag: "segurado_atividade", kind: "next-cell" },
  { match: "Local de trabalho / Sede", tag: "segurado_local_trabalho", kind: "next-cell" },
  { match: "Matrícula", tag: "segurado_matricula", kind: "next-cell" },
  { match: "Marca/modelo", tag: "segurado_marca_modelo", kind: "next-cell" },
  { match: "Cor", tag: "segurado_cor", kind: "next-cell" },
  { match: "Potencia do Veículo", tag: "segurado_potencia", kind: "next-cell" },

  // Condutor (do segurado)
  { match: "Condutor/Nome", tag: "condutor_nome", kind: "next-cell" },
  { match: "NIF", tag: "condutor_nif", kind: "next-cell" },
  { match: "Morada", tag: "condutor_morada", kind: "next-cell" },
  { match: "Contacto", tag: "condutor_contacto", kind: "next-cell" },
  { match: "Profissão", tag: "condutor_profissao", kind: "next-cell" },
  { match: "Local de trabalho", tag: "condutor_local_trabalho", kind: "next-cell" },
  { match: "Salário", tag: "condutor_salario", kind: "next-cell" },
  { match: "Lic. Condução", tag: "condutor_licenca", kind: "next-cell" },
  { match: "Categorias", tag: "condutor_categorias", kind: "next-cell" },
  { match: "TAS (g/l)", tag: "condutor_tas", kind: "next-cell" },
  { match: "É o condutor habitual do veículo?", tag: "condutor_habitual", kind: "next-cell" },
  { match: "Posição de Comissário", tag: "condutor_posicao_comissario", kind: "next-cell" },
  { match: "Concelho de circulação habitual", tag: "condutor_concelho_circulacao", kind: "next-cell" },
  { match: "Relação Condutor/Proprietário", tag: "condutor_relacao_proprietario", kind: "next-cell" },
  { match: "Relação entre intervenientes", tag: "condutor_relacao_intervenientes", kind: "next-cell" },
  { match: "Outros Danos Materiais", tag: "condutor_outros_danos", kind: "next-cell" },

  // Terceiro 1 + veículo
  { match: "Terceiro  1/Nome", tag: "terceiro_nome", kind: "next-cell" },
  { match: "NIF", tag: "terceiro_nif", kind: "next-cell" },
  { match: "Morada", tag: "terceiro_morada", kind: "next-cell" },
  { match: "Contacto", tag: "terceiro_contacto", kind: "next-cell" },
  { match: "Profissão /Atividade", tag: "terceiro_atividade", kind: "next-cell" },
  { match: "Local de trabalho / Sede", tag: "terceiro_local_trabalho", kind: "next-cell" },
  { match: "Matrícula", tag: "terceiro_matricula", kind: "next-cell" },
  { match: "Marca/modelo", tag: "terceiro_marca_modelo", kind: "next-cell" },
  { match: "Cor", tag: "terceiro_cor", kind: "next-cell" },
  { match: "Potencia do Veículo", tag: "terceiro_potencia", kind: "next-cell" },
  { match: "Seguradora", tag: "terceiro_seguradora", kind: "next-cell" },
  { match: "Apólice n.º", tag: "terceiro_apolice", kind: "next-cell" },

  // Condutor terceiro
  { match: "Condutor/Nome", tag: "condutor_terceiro_nome", kind: "next-cell" },
  { match: "NIF", tag: "condutor_terceiro_nif", kind: "next-cell" },
  { match: "Morada", tag: "condutor_terceiro_morada", kind: "next-cell" },
  { match: "Contacto", tag: "condutor_terceiro_contacto", kind: "next-cell" },
  { match: "Profissão", tag: "condutor_terceiro_profissao", kind: "next-cell" },
  { match: "Local de trabalho", tag: "condutor_terceiro_local_trabalho", kind: "next-cell" },
  { match: "Salário", tag: "condutor_terceiro_salario", kind: "next-cell" },
  { match: "Lic. Condução", tag: "condutor_terceiro_licenca", kind: "next-cell" },
  { match: "Categorias", tag: "condutor_terceiro_categorias", kind: "next-cell" },
  { match: "TAS (g/l)", tag: "condutor_terceiro_tas", kind: "next-cell" },
  { match: "Posição de Comissário", tag: "condutor_terceiro_posicao_comissario", kind: "next-cell" },
  { match: "Relação entre intervenientes", tag: "condutor_terceiro_relacao_intervenientes", kind: "next-cell" },
  { match: "Outros Danos Materiais", tag: "condutor_terceiro_outros_danos", kind: "next-cell" },

  // Testemunha 1
  { match: "Testemunha 1", tag: "testemunha_nome", kind: "next-cell" },
  { match: "NIF", tag: "testemunha_nif", kind: "next-cell" },
  { match: "Morada", tag: "testemunha_morada", kind: "next-cell" },
  { match: "Contacto", tag: "testemunha_contacto", kind: "next-cell" },
  { match: "Relação entre intervenientes", tag: "testemunha_relacao", kind: "next-cell" },
  { match: "Local onde se encontrava aquando do acidente", tag: "testemunha_local", kind: "next-cell" },

  // Feridos — "Feridos nº" é uma merged cell sem slot próprio para o total;
  // só preenchemos as 3 linhas (VS/VT/Peões). O total é info interna do JSON.
  { match: "Veículo Seguro", tag: "feridos_veiculo_seguro", kind: "next-cell" },
  { match: "Veículo Terceiro", tag: "feridos_veiculo_terceiro", kind: "next-cell" },
  { match: "Peões", tag: "feridos_peoes", kind: "next-cell" },

  // Section 1 — date/time
  { match: "1.   Data e hora do sinistro", tag: "data_hora_sinistro", kind: "after-para" },

  // Section 2 — local
  { match: "Data e hora da visita ao local", tag: "data_hora_visita", kind: "after-para" },
  { match: "Estrada/Rua/Caminho", tag: "estrada", kind: "after-para" },
  { match: "Localidade e concelho", tag: "localidade_concelho", kind: "after-para" },
  { match: "Traçado", tag: "tracado", kind: "after-para" },
  { match: "N.º de vias de trânsito", tag: "n_vias", kind: "after-para" },
  { match: "Visibilidade (metros)", tag: "visibilidade", kind: "after-para" },
  { match: "Tipo e estado do Piso", tag: "estado_piso", kind: "after-para" },
  { match: "Faixa de rodagem", tag: "largura_faixa", kind: "after-para" },
  { match: "Bermas", tag: "largura_bermas", kind: "after-para" },
  { match: "Passeios", tag: "largura_passeios", kind: "after-para" },
  { match: "Valetas", tag: "largura_valetas", kind: "after-para" },
  { match: "Longitudinal", tag: "declive_longitudinal", kind: "after-para" },
  { match: "Transversal", tag: "declive_transversal", kind: "after-para" },
  { match: "Vertical", tag: "sinalizacao_vertical", kind: "after-para" },
  { match: "Horizontal", tag: "sinalizacao_horizontal", kind: "after-para" },
  { match: "Limite de velocidade", tag: "limite_velocidade", kind: "after-para" },
  { match: "Estado do tempo", tag: "estado_tempo", kind: "after-para" },
  { match: "Iluminação", tag: "iluminacao", kind: "after-para" },
  { match: "2.5   Intensidade do tráfego", tag: "intensidade_trafego", kind: "after-para" },
  { match: "2.6   Vestígios Encontrados", tag: "vestigios", kind: "after-para" },
  { match: "2.7   Caracterização do local", tag: "caracterizacao_local", kind: "after-para" },

  // Sections 3–7 — entidades oficiais
  { match: "3.   Autoridades:", tag: "autoridades", kind: "after-para" },
  { match: "4.   Tribunais:", tag: "tribunais", kind: "after-para" },
  { match: "5.   APS/Segurnet:", tag: "aps_segurnet", kind: "after-para" },
  { match: "Data/hora da assistência", tag: "assistencia_data_hora", kind: "after-para" },
  { match: "Local –", tag: "assistencia_local", kind: "after-para" },
  { match: "Motivo", tag: "assistencia_motivo", kind: "after-para" },
  { match: "Quem solicitou", tag: "assistencia_solicitante", kind: "after-para" },
  { match: "Rebocador", tag: "assistencia_rebocador", kind: "after-para" },
  { match: "7.   Bombeiros/INEM:", tag: "bombeiros_inem", kind: "after-para" },

  // Sections 9–11 — versões + testemunhas
  { match: "9.  Versão do Segurado", tag: "versao_segurado", kind: "after-para" },
  { match: "10.  Versão do Terceiro", tag: "versao_terceiro", kind: "after-para" },
  { match: "11.1   Indicadas pelo n/Segurado", tag: "testemunhas_segurado", kind: "after-para" },
  { match: "11.2   Indicadas pelo Terceiro", tag: "testemunhas_terceiro", kind: "after-para" },
  { match: "11.3   Outras Testemunhas", tag: "outras_testemunhas", kind: "after-para" },

  // Sections 12–15 — danos
  { match: "12.1   Danos no Veículo Seguro", tag: "danos_seguro_intro", kind: "after-para" },
  { match: "Danos com altimetria:", tag: "danos_seguro_altimetria", kind: "after-para" },
  { match: "Reparador:", tag: "danos_seguro_reparador", kind: "after-para" },
  { match: "IPO:", tag: "danos_seguro_ipo", kind: "after-para" },
  { match: "12.2   Danos no Veículo Terceiro", tag: "danos_terceiro_intro", kind: "after-para" },
  { match: "Danos com altimetria:", tag: "danos_terceiro_altimetria", kind: "after-para" },
  { match: "Reparador:", tag: "danos_terceiro_reparador", kind: "after-para" },
  { match: "IPO:", tag: "danos_terceiro_ipo", kind: "after-para" },
  { match: "13.  Outros Danos Materiais", tag: "outros_danos_materiais", kind: "after-para" },
  { match: "13.1  Prova de propriedade", tag: "prova_propriedade", kind: "after-para" },
  { match: "14.  Sequencia de Embates", tag: "sequencia_embates", kind: "after-para" },
  { match: "15.  Sequencia Semafórica", tag: "sequencia_semaforica", kind: "after-para" },

  // Sections 16–17 — responsabilidade
  { match: "16.  Apreciação Técnica do Sinistro", tag: "apreciacao_tecnica", kind: "after-para" },
  { match: "16.1  Elementos Suspeitos", tag: "elementos_suspeitos", kind: "after-para" },
  { match: "16.2  Elementos de Prova", tag: "elementos_prova", kind: "after-para" },
  { match: "17.  Definição/Conclusões", tag: "conclusoes", kind: "after-para" },

  // Closing
  { match: "Lisboa,", tag: "data_relatorio", kind: "after-para" },
];

// --- shared engine (same as parametrize-at.mjs) ---
const buf = await readFile(SRC);
const zip = await JSZip.loadAsync(buf);
const xml0 = await zip.file("word/document.xml").async("string");

const TEXT_RE = /<w:t([^>]*)>([^<]*)<\/w:t>/g;
const runs = [];
{
  let m;
  while ((m = TEXT_RE.exec(xml0))) {
    runs.push({ start: m.index, end: m.index + m[0].length, attrs: m[1], content: m[2] });
  }
}
const concatenated = runs.map((r) => r.content).join("");
const runStartInText = [];
{
  let p = 0;
  for (const r of runs) {
    runStartInText.push(p);
    p += r.content.length;
  }
}
function runIndexFromTextPos(textPos) {
  let lo = 0;
  let hi = runs.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >>> 1;
    if (runStartInText[mid] <= textPos) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

let textCursor = 0;
const planned = [];
const failures = [];
for (const a of ANCHORS) {
  const idx = concatenated.indexOf(a.match, textCursor);
  if (idx === -1) {
    failures.push(a);
    continue;
  }
  const runIndex = runIndexFromTextPos(idx + a.match.length - 1);
  planned.push({ anchor: a, runIndex });
  textCursor = idx + a.match.length;
}

let xml = xml0;
const sorted = [...planned].sort((x, y) => y.runIndex - x.runIndex);
const applied = [];
const applyFailures = [];
for (const p of sorted) {
  const { anchor, runIndex } = p;
  if (anchor.kind === "next-cell") {
    let target = null;
    for (let i = runIndex + 1; i < runs.length; i++) {
      if (runs[i].content.trim() === "") {
        target = i;
        break;
      }
    }
    if (target === null) {
      applyFailures.push({ anchor, reason: "no empty cell" });
      continue;
    }
    const r = runs[target];
    const replacement = `<w:t${r.attrs}>{${anchor.tag}}</w:t>`;
    xml = xml.slice(0, r.start) + replacement + xml.slice(r.end);
    runs[target].content = `{${anchor.tag}}`;
    applied.push({ anchor, kind: "next-cell" });
  } else {
    const after = xml.slice(runs[runIndex].end);
    const closeIdx = after.indexOf("</w:p>");
    if (closeIdx === -1) {
      applyFailures.push({ anchor, reason: "no </w:p>" });
      continue;
    }
    const insertAt = runs[runIndex].end + closeIdx + "</w:p>".length;
    const newPara = `<w:p><w:r><w:t xml:space="preserve">{${anchor.tag}}</w:t></w:r></w:p>`;
    xml = xml.slice(0, insertAt) + newPara + xml.slice(insertAt);
    applied.push({ anchor, kind: "after-para" });
  }
}

const byDocOrder = [...applied].sort((x, y) => ANCHORS.indexOf(x.anchor) - ANCHORS.indexOf(y.anchor));
for (const { anchor, kind } of byDocOrder) {
  console.log(`  [ok] ${kind.padEnd(10)} ${anchor.match.slice(0, 50).padEnd(50)} → {${anchor.tag}}`);
}
console.log(`\nApplied ${applied.length}/${ANCHORS.length} anchors.`);
if (failures.length) {
  console.log(`\nNot found:`);
  for (const f of failures) console.log(`  [!!] ${f.match} → {${f.tag}}`);
}
if (applyFailures.length) {
  console.log(`\nAction failed:`);
  for (const f of applyFailures) console.log(`  [!!] ${f.anchor.match} → {${f.anchor.tag}} (${f.reason})`);
}

// Strip Word legacy form fields (FORMTEXT) — they shade grey by default.
xml = xml.replace(/<w:fldChar\b[^>]*?\/?>/g, "");
xml = xml.replace(/<\/w:fldChar>/g, "");
xml = xml.replace(/<w:instrText[^>]*>[^<]*<\/w:instrText>/g, "");

let settings = await zip.file("word/settings.xml").async("string");
if (!settings.includes("doNotShadeFormData")) {
  settings = settings.replace(
    /<\/w:settings>/,
    '<w:doNotShadeFormData/></w:settings>',
  );
  zip.file("word/settings.xml", settings);
}

zip.file("word/document.xml", xml);
const out = await zip.generateAsync({ type: "nodebuffer" });
await writeFile(OUT, out);
console.log(`\nWrote ${OUT.pathname}`);
