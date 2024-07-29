import path, { resolve } from 'path';
import fs from 'fs';

const __dirname = import.meta.dirname;
const projectRoot = resolve(__dirname, '../');

export const cacheDirectory = path.join(projectRoot, 'cache');
export const thumbnailDirectory = path.join(cacheDirectory, 'thumbnails');
export const uploadsDirectory = path.join(cacheDirectory, 'uploads');
export const exportDirectory = path.join(cacheDirectory, 'exports');
export const filesDirectory = path.join(projectRoot, 'files');
export const imagesDirectory = path.join(filesDirectory, 'images');

export const initializeDirectories = () => {
  // Create the cache directory recursively if it does not exist
  if (!fs.existsSync(cacheDirectory)) {
    fs.mkdirSync(cacheDirectory, { recursive: true });
  }
  if (!fs.existsSync(thumbnailDirectory)) {
    fs.mkdirSync(thumbnailDirectory, { recursive: true });
  }
  if (!fs.existsSync(uploadsDirectory)) {
    fs.mkdirSync(uploadsDirectory, { recursive: true });
  }
  if (!fs.existsSync(exportDirectory)) {
    fs.mkdirSync(exportDirectory, { recursive: true });
  }
  if (!fs.existsSync(filesDirectory)) {
    fs.mkdirSync(filesDirectory, { recursive: true });
  }
  if (!fs.existsSync(imagesDirectory)) {
    fs.mkdirSync(imagesDirectory, { recursive: true });
  }
  console.log('Directories initialized');
  console.log('Cache directory:', cacheDirectory);
  console.log('Thumbnail directory:', thumbnailDirectory);
  console.log('Uploads directory:', uploadsDirectory);
  console.log('Export directory:', exportDirectory);
  console.log('Files directory:', filesDirectory);
  console.log('Images directory:', imagesDirectory);
};

initializeDirectories();
