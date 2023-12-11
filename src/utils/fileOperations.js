import path from 'path';
import fs from 'fs';
// 2. Перевірте файли у папці і 3. Видаліть файли, які не знаходяться у списку
export function cleanupFiles(items, folder) {
  const filesInFolder = fs.readdirSync(folder);

  for (let file of filesInFolder) {
    if (!items.some(({ name }) => name === file)) {
      fs.unlinkSync(path.join(folder, file));
    }
  }
}

// Функція для перевірки наявності файлу
export function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Перевірка розміру файлу
export function isFileSizeCorrect(filePath, expectedSize) {
  const { size } = fs.statSync(filePath);
  return size === parseInt(expectedSize);
}
