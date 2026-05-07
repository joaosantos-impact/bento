import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Garante que os templates DOCX são copiados para as funções serverless
  // que os lêem em runtime via fs.readFile.
  outputFileTracingIncludes: {
    "/api/exportar/at/route": ["./templates/at-template-tagged.docx"],
    "/api/exportar/auto/route": ["./templates/auto-template-tagged.docx"],
  },
};

export default nextConfig;
