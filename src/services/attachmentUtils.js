// attachmentUtils.js

const MAX_TEXT_FILE_SIZE = 500 * 1024; // 500 KB
const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const SUPPORTED_TEXT_EXTENSIONS = ['.py', '.js', '.ts', '.html', '.css', '.java', '.c', '.cpp', '.json', '.txt', '.md'];
const SUPPORTED_IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export function validateFileAttachment(file) {
  if (!file) return { valid: false, error: 'No file provided.' };
  
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  
  if (!SUPPORTED_TEXT_EXTENSIONS.includes(ext)) {
    return { valid: false, error: 'This file type is not supported yet.' };
  }
  
  if (file.size > MAX_TEXT_FILE_SIZE) {
    return { valid: false, error: 'File is too large. Please upload a smaller file.' };
  }
  
  return { valid: true };
}

export function validateImageAttachment(file) {
  if (!file) return { valid: false, error: 'No image provided.' };
  
  if (!SUPPORTED_IMAGE_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'This file type is not supported yet.' };
  }
  
  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return { valid: false, error: 'File is too large. Please upload a smaller file.' };
  }
  
  return { valid: true };
}

export function processTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        name: file.name,
        size: file.size,
        content: e.target.result,
        ext: file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
      });
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}

export function processImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: e.target.result // Base64 data URL for preview and API
      });
    };
    reader.onerror = () => reject(new Error('Failed to read image.'));
    reader.readAsDataURL(file);
  });
}
