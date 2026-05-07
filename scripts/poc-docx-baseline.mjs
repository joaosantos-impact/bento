import { readFile, writeFile } from "node:fs/promises";
import { TemplateHandler } from "easy-template-x";

const handler = new TemplateHandler();
const buf = await readFile(new URL("../templates/at-template.docx", import.meta.url));

const doc = await handler.process(buf, {
  relatorio_numero: "TESTE-001",
  seguradora: "Generali Tranquilidade",
});

await writeFile(new URL("../.tmp-inspect/at-baseline-output.docx", import.meta.url), doc);
console.log("Baseline output written. Note: template has no tags, so values are not substituted.");
