// Extracts all non-whitespace text from a DOCX in document order, with positions.
// Useful to plan label→tag mapping for parametrize scripts.
import { readFile } from "node:fs/promises";
import JSZip from "jszip";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/explore-template.mjs <path-to-docx>");
  process.exit(1);
}

const buf = await readFile(file);
const zip = await JSZip.loadAsync(buf);
const xml = await zip.file("word/document.xml").async("string");

// Walk text runs in order, collect groups separated by paragraph/cell boundaries.
const re = /<w:(t|tab|br|p|tc|tr)([^>]*)>([^<]*)?(?:<\/w:\1>)?/g;
const out = [];
let buffer = "";
let pos = 0;
let m;
while ((m = re.exec(xml))) {
  const [, tag, , content] = m;
  if (tag === "t") {
    buffer += content || "";
  } else if (tag === "tab") {
    buffer += "\t";
  } else if (tag === "br") {
    buffer += " ";
  } else if (tag === "p" || tag === "tc" || tag === "tr") {
    if (buffer.trim()) {
      out.push({ pos, text: buffer.trim() });
      pos++;
    }
    buffer = "";
  }
}
if (buffer.trim()) out.push({ pos, text: buffer.trim() });

for (const { pos, text } of out) {
  // truncate very long narrative paragraphs
  const t = text.length > 120 ? text.slice(0, 117) + "..." : text;
  console.log(`${String(pos).padStart(4)} | ${t}`);
}
console.log(`\nTotal: ${out.length} non-empty text blocks`);
