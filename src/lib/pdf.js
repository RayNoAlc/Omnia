import * as pdfjsLib from "pdfjs-dist";
// "?url" faz o Vite tratar o worker como um arquivo estático e devolver a URL final dele.
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/**
 * Extrai todo o texto "selecionável" de um PDF (não funciona para PDFs
 * que são apenas fotos escaneadas — para esses, oriente o usuário a
 * enviar como foto em vez de PDF, já que aí entra o modelo de visão).
 */
export async function extractPdfText(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    fullText += pageText + "\n\n";
  }
  return fullText.trim();
}
