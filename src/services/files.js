
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_DOCUMENT_CHARS = 100_000;
const IMAGE_TYPES = ['image/png', 'image/jpeg'];
const TEXT_TYPES = ['text/plain', 'text/markdown', 'text/csv'];

export const ACCEPTED_FILES = '.txt,.md,.csv,.pdf,.docx,.png,.jpg,.jpeg';

function dataUrlToBase64(dataUrl) {
  return dataUrl.slice(dataUrl.indexOf(',') + 1);
}

async function extractPdfText(file) {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
  GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
  const pdf = await getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => item.str).join(' '));
  }
  return pages.join('\n\n');
}

export async function parseChatFile(file) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (file.size > MAX_FILE_BYTES) throw new Error(`${file.name} is larger than the 20 MB limit.`);

  if (IMAGE_TYPES.includes(file.type) || ['png', 'jpg', 'jpeg'].includes(extension)) {
    const mimeType = file.type || (extension === 'png' ? 'image/png' : 'image/jpeg');
    if (!IMAGE_TYPES.includes(mimeType)) {
      throw new Error(`${file.name} must be a PNG or JPEG image.`);
    }
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
      reader.readAsDataURL(file);
    });
    return { name: file.name, type: 'image', mimeType, data: dataUrlToBase64(dataUrl), preview: dataUrl };
  }

  let text;
  if (TEXT_TYPES.includes(file.type) || ['txt', 'md', 'csv'].includes(extension)) {
    text = await file.text();
  } else if (extension === 'pdf' || file.type === 'application/pdf') {
    text = await extractPdfText(file);
  } else if (extension === 'docx' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const mammoth = (await import('mammoth/mammoth.browser')).default;
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    text = result.value;
  } else {
    throw new Error(`${file.name} is not supported. Choose TXT, MD, CSV, PDF, DOCX, PNG, JPG, or JPEG.`);
  }

  if (!text.trim()) throw new Error(`${file.name} contains no extractable text.`);
  return { name: file.name, type: 'text', text: text.slice(0, MAX_DOCUMENT_CHARS), truncated: text.length > MAX_DOCUMENT_CHARS };
}
