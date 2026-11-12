import { FileAttachment } from '../types';

export const SUPPORTED_EXTENSIONS = [
  '.pdf',
  '.docx',
  '.txt',
  '.csv',
  '.xlsx',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.json',
  '.md',
];

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export async function processUploadedFile(file: File): Promise<FileAttachment> {
  const id = `att_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File "${file.name}" exceeds the maximum limit of 25MB.`);
  }

  // Determine file category
  const isImage = file.type.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
  const isPdf = file.type === 'application/pdf' || ext === '.pdf';
  const isTextLike =
    file.type.startsWith('text/') ||
    ['.txt', '.csv', '.json', '.md', '.html', '.ts', '.js', '.py'].includes(ext);

  if (isImage) {
    const base64 = await readFileAsBase64(file);
    const mimeType = file.type || (ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg');
    const previewUrl = URL.createObjectURL(file);

    return {
      id,
      name: file.name,
      size: file.size,
      type: 'image',
      mimeType,
      data: base64,
      previewUrl,
    };
  }

  if (isPdf) {
    const base64 = await readFileAsBase64(file);
    return {
      id,
      name: file.name,
      size: file.size,
      type: 'pdf',
      mimeType: 'application/pdf',
      data: base64,
    };
  }

  if (isTextLike) {
    const textContent = await readFileAsText(file);
    return {
      id,
      name: file.name,
      size: file.size,
      type: 'text',
      mimeType: file.type || 'text/plain',
      textContent: textContent.slice(0, 100000), // Protect against runaway text
    };
  }

  // Fallback for docx/xlsx/binary docs: read as text/binary extract
  try {
    const text = await readFileAsText(file);
    // Filter printable characters for simple inspection
    const sanitized = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ').slice(0, 50000);
    return {
      id,
      name: file.name,
      size: file.size,
      type: ext.replace('.', ''),
      mimeType: file.type || 'application/octet-stream',
      textContent: sanitized.length > 50 ? sanitized : `[Binary file: ${file.name}, size: ${formatFileSize(file.size)}]`,
    };
  } catch (err) {
    return {
      id,
      name: file.name,
      size: file.size,
      type: 'document',
      mimeType: file.type || 'application/octet-stream',
      textContent: `[Uploaded document: ${file.name}]`,
    };
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data:mime/type;base64, prefix so we pass pure base64 to Gemini API
      const commaIdx = result.indexOf(',');
      if (commaIdx !== -1) {
        resolve(result.substring(commaIdx + 1));
      } else {
        resolve(result);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}
