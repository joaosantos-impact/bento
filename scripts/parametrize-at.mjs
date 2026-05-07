// Reads templates/at-template.docx (CAPT original), inserts {tag} placeholders
// for every fillable field, and writes templates/at-template-tagged.docx.
// Run once. Re-run when CAPT updates the template.
import { readFile, writeFile } from "node:fs/promises";
import JSZip from "jszip";

const SRC = new URL("../templates/at-template.docx", import.meta.url);
const OUT = new URL("../templates/at-template-tagged.docx", import.meta.url);

// Anchors in document order. Cursor only advances, so duplicate labels (NIF, Morada,
// Contacto, etc.) work as long as they appear in the same order as listed below.
//   "next-cell"  → replaces the first whitespace-only <w:t> after the anchor (table cells)
//   "after-para" → inserts a new <w:p>{tag}</w:p> right after the anchor's paragraph
const ANCHORS = [
  // Header — process identification
  { match: "Relatório n.º", tag: "relatorio_numero", kind: "next-cell" },
  { match: "Seguradora", tag: "seguradora", kind: "next-cell" },
  { match: "Sup", tag: "supervisor", kind: "next-cell" },
  { match: "Apólice n.º", tag: "apolice", kind: "next-cell" },
  { match: "Proc./", tag: "processo_ocorrencia", kind: "next-cell" },
  { match: "Sinistro n.º", tag: "numero_sinistro", kind: "next-cell" },
  { match: "Assunto", tag: "assunto", kind: "next-cell" },
  { match: "Enc./ Serv. n.º", tag: "enc_serv", kind: "next-cell" },

  // Segurado block
  { match: "Segurado", tag: "segurado_nome", kind: "next-cell" },
  { match: "NIF", tag: "segurado_nif", kind: "next-cell" },
  { match: "Morada", tag: "segurado_morada", kind: "next-cell" },
  { match: "Contacto", tag: "segurado_contacto", kind: "next-cell" },
  { match: "Atividade", tag: "segurado_atividade", kind: "next-cell" },
  { match: "CAE", tag: "segurado_cae", kind: "next-cell" },
  { match: "Nº de trabalhadores", tag: "segurado_n_trabalhadores", kind: "next-cell" },
  { match: "Serviços de SST", tag: "segurado_sst", kind: "next-cell" },
  { match: "Resultado da avaliação", tag: "segurado_avaliacao", kind: "next-cell" },

  // Sinistrado block (re-uses NIF/Morada/Contacto labels — order matters)
  { match: "Sinistrado", tag: "sinistrado_nome", kind: "next-cell" },
  { match: "NIF", tag: "sinistrado_nif", kind: "next-cell" },
  { match: "Morada", tag: "sinistrado_morada", kind: "next-cell" },
  { match: "Contacto", tag: "sinistrado_contacto", kind: "next-cell" },
  { match: "Idade", tag: "sinistrado_idade", kind: "next-cell" },
  { match: "Profissão", tag: "sinistrado_profissao", kind: "next-cell" },
  { match: "Lesões", tag: "sinistrado_lesoes", kind: "next-cell" },

  // Section 1 — date/time + work schedule
  { match: "1. Data e hora do sinistro", tag: "data_hora_sinistro", kind: "after-para" },
  { match: "1.1 Horário de trabalho do sinistrado", tag: "horario_trabalho", kind: "after-para" },

  // Section 2 — location
  { match: "Data e hora da visita ao local", tag: "data_hora_visita", kind: "after-para" },
  { match: "Local onde ocorreu o acidente", tag: "local_acidente", kind: "after-para" },
  { match: "Localidade e concelho", tag: "localidade_concelho", kind: "after-para" },
  { match: "Operação / Tarefa", tag: "operacao_tarefa", kind: "after-para" },

  // Sections 3–7 — entidades oficiais
  { match: "Autoridades:", tag: "autoridades", kind: "after-para" },
  { match: "Tribunais:", tag: "tribunais", kind: "after-para" },
  { match: "Bombeiros/INEM:", tag: "bombeiros_inem", kind: "after-para" },
  { match: "ACT:", tag: "act", kind: "after-para" },
  { match: "Unidades de Saúde:", tag: "unidades_saude", kind: "after-para" },

  // Sections 8–10 — acidente
  { match: "Contacto com Tomador de Seguro", tag: "contacto_tomador", kind: "after-para" },
  { match: "Versão do sinistrado", tag: "versao_sinistrado", kind: "after-para" },
  { match: "Testemunha:", tag: "testemunha", kind: "after-para" },

  // Section 11 — responsabilidade
  { match: "Apreciação Técnica do Sinistro", tag: "apreciacao_tecnica", kind: "after-para" },
  { match: "Análise do local", tag: "analise_local", kind: "after-para" },
  { match: "Análise do contacto", tag: "analise_contacto_tomador", kind: "after-para" },
  { match: "Análise das Condições", tag: "analise_sst", kind: "after-para" },
  { match: "Elementos Suspeitos:", tag: "elementos_suspeitos", kind: "after-para" },
  { match: "Elementos de Prova:", tag: "elementos_prova", kind: "after-para" },

  // Section 12 — conclusões
  { match: "Definição/Conclusões", tag: "conclusoes", kind: "after-para" },

  // Closing date
  { match: "Lisboa,", tag: "data_relatorio", kind: "after-para" },
];

const buf = await readFile(SRC);
const zip = await JSZip.loadAsync(buf);
const xml0 = await zip.file("word/document.xml").async("string");

// Index every <w:t> in document order (immutable).
const TEXT_RE = /<w:t([^>]*)>([^<]*)<\/w:t>/g;
const runs = [];
{
  let m;
  while ((m = TEXT_RE.exec(xml0))) {
    runs.push({ start: m.index, end: m.index + m[0].length, attrs: m[1], content: m[2] });
  }
}

// Concatenate all run content with cumulative positions, so we can do substring
// search and recover which runs were involved.
const concatenated = runs.map((r) => r.content).join("");
const runStartInText = [];
{
  let p = 0;
  for (const r of runs) {
    runStartInText.push(p);
    p += r.content.length;
  }
}

// Maps a position in `concatenated` back to a run index.
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

// PASS 1: find each anchor (cursor only advances).
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
  planned.push({ anchor: a, runIndex, textPos: idx });
  textCursor = idx + a.match.length;
}

// PASS 2: apply edits from bottom up so earlier offsets stay valid.
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
      applyFailures.push({ anchor, reason: "no empty cell after anchor" });
      continue;
    }
    const r = runs[target];
    const replacement = `<w:t${r.attrs}>{${anchor.tag}}</w:t>`;
    xml = xml.slice(0, r.start) + replacement + xml.slice(r.end);
    // Update offsets for the (immutable in our index) subsequent runs.
    // Since we apply bottom-up, only runs BEFORE target may still be edited;
    // their start/end are not affected. But we mutate runs[target] in case of duplicates.
    runs[target].content = `{${anchor.tag}}`;
    applied.push({ anchor, kind: "next-cell" });
  } else if (anchor.kind === "after-para") {
    const after = xml.slice(runs[runIndex].end);
    const closeIdx = after.indexOf("</w:p>");
    if (closeIdx === -1) {
      applyFailures.push({ anchor, reason: "no </w:p> after anchor" });
      continue;
    }
    const insertAt = runs[runIndex].end + closeIdx + "</w:p>".length;
    const newPara = `<w:p><w:r><w:t xml:space="preserve">{${anchor.tag}}</w:t></w:r></w:p>`;
    xml = xml.slice(0, insertAt) + newPara + xml.slice(insertAt);
    applied.push({ anchor, kind: "after-para" });
  }
}

// Report (sort applied by document order for readability).
const byDocOrder = [...applied].sort((x, y) => {
  const ix = ANCHORS.indexOf(x.anchor);
  const iy = ANCHORS.indexOf(y.anchor);
  return ix - iy;
});
for (const { anchor, kind } of byDocOrder) {
  console.log(`  [ok] ${kind.padEnd(10)} ${anchor.match.slice(0, 50).padEnd(50)} → {${anchor.tag}}`);
}
console.log(`\nApplied ${applied.length}/${ANCHORS.length} anchors.`);
if (failures.length) {
  console.log(`\nNot found in source XML:`);
  for (const f of failures) console.log(`  [!!] ${f.match} → {${f.tag}}`);
}
if (applyFailures.length) {
  console.log(`\nFound but action failed:`);
  for (const f of applyFailures) console.log(`  [!!] ${f.anchor.match} → {${f.anchor.tag}} (${f.reason})`);
}

zip.file("word/document.xml", xml);
const out = await zip.generateAsync({ type: "nodebuffer" });
await writeFile(OUT, out);
console.log(`\nWrote ${OUT.pathname}`);
