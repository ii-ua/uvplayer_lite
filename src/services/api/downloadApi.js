import axios from 'axios';
import { store } from '../../utils';
import fs from 'fs';
import log from 'electron-log/main';

const SERVER_URL = store.get('SERVER_URL');

export async function downloadFile(id, projectId, filePath) {
  const writer = fs.createWriteStream(filePath);
  try {
    const response = await axios.get(
      `${SERVER_URL.API_URL}/contents/stream/${id}?projectId=${projectId}`,
      {
        responseType: 'stream'
      }
    );

    response.data.pipe(writer);

    // Якщо axios зазнає помилки, він не відправляє "end" event до свого потоку.
    // Тому, якщо відбулася мережева помилка, ми можемо вручну закінчити потік запису.
    response.data.on('error', (error) => {
      log.error(error);
      const isNetworkError =
        error.code === 'ECONNABORTED' || error.message.includes('Network Error') || 'ENOTFOUND';
      if (isNetworkError) {
        writer.end();
      }
    });

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        resolve(`Successful file download ${filePath}`);
      });
      writer.on('error', (err) => {
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            log.error(`Error deleting file: ${filePath}`, unlinkErr);
          } else {
            log.warn(`File deleted: ${filePath}`);
          }
        });
        reject(err);
      });
    });
  } catch (err) {
    log.error(`Error during file download:${filePath}`);
    writer.end(); // якщо відбувається помилка, вручну завершуємо потік запису
    throw err;
  }
}
