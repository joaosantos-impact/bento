import { readFile, writeFile } from "node:fs/promises";
import JSZip from "jszip";
import { TemplateHandler } from "easy-template-x";

const TEMPLATE = new URL("../templates/at-template.docx", import.meta.url);
const OUT_TAGGED = new URL("../.tmp-inspect/at-template-tagged.docx", import.meta.url);
const OUT_FILLED = new URL("../.tmp-inspect/at-filled.docx", import.meta.url);

// label visible in the doc → easy-template-x tag
const FIELD_MAP = [
  ["Relatório n.º", "relatorio_numero"],
  ["Seguradora", "seguradora"],
  ["Apólice n.º", "apolice"],
  ["Sinistro n.º", "numero_sinistro"],
  ["Assunto", "assunto"],
];

const buf = await readFile(TEMPLATE);
const zip = await JSZip.loadAsync(buf);
const xmlFile = zip.file("word/document.xml");
let xml = await xmlFile.async("string");

let replaced = 0;
let cursor = 0;
for (const [label, tagName] of FIELD_MAP) {
  const labelPattern = new RegExp(`<w:t[^>]*>${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</w:t>`);
  const labelMatch = labelPattern.exec(xml.slice(cursor));
  if (!labelMatch) {
    console.warn(`  ! label not found: ${label}`);
    continue;
  }
  const labelEnd = cursor + labelMatch.index + labelMatch[0].length;
  // find next <w:t ...>whitespace-only</w:t> after the label
  const empty = /<w:t([^>]*)>(\s+)<\/w:t>/;
  const tail = xml.slice(labelEnd);
  const emptyMatch = empty.exec(tail);
  if (!emptyMatch) {
    console.warn(`  ! no empty cell after: ${label}`);
    continue;
  }
  const tagText = `<w:t${emptyMatch[1] || ""}>{${tagName}}</w:t>`;
  xml = xml.slice(0, labelEnd) + tail.slice(0, emptyMatch.index) + tagText + tail.slice(emptyMatch.index + emptyMatch[0].length);
  cursor = labelEnd + emptyMatch.index + tagText.length;
  replaced++;
  console.log(`  ✓ tagged ${label} → {${tagName}}`);
}
console.log(`Tagged ${replaced}/${FIELD_MAP.length} fields.`);

zip.file("word/document.xml", xml);
const taggedBuf = await zip.generateAsync({ type: "nodebuffer" });
await writeFile(OUT_TAGGED, taggedBuf);

const handler = new TemplateHandler();
const filled = await handler.process(taggedBuf, {
  relatorio_numero: "TESTE-001",
  seguradora: "Generali Tranquilidade",
  apolice: "AP123456",
  numero_sinistro: "SN789",
  assunto: "Acidente de Trabalho - Teste POC",
});
await writeFile(OUT_FILLED, filled);

console.log("\nFiles written:");
console.log("  - .tmp-inspect/at-template-tagged.docx (with {tags})");
console.log("  - .tmp-inspect/at-filled.docx (with values)");
