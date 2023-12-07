import fs from 'fs';
import path from 'path';
import store from './store';

const createFolder = (folder) => {
  const folderPath = path.join(process.cwd(), folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true }); // 'recursive' дозволяє створювати вкладені каталоги
  }
};

export const initialDefaultFolder = () => {
  const STORAGE = store.get('STORAGE');
  const folders = Object.values(STORAGE);
  folders.forEach((folder) => {
    createFolder(folder);
  });
};
