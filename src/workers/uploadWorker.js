import path from 'path';
import fs from 'fs';
import { store, scheduler } from '../utils';
import { postDeviceLog, getDeviceLogs } from '../services/api/deviceApi';
import log from 'electron-log/main';

export async function uploadLogs() {
  log.warn('uploadLogs');
  const STORAGE = store.get('STORAGE');
  const device = store.get('device');
  const logsMediaDir = path.join(process.cwd(), STORAGE.LOGS_MEDIA);
  if (device) {
    const { _id: id, projectId } = device;
    try {
      // Отримуємо список усіх файлів у директорії logs_media
      const files = fs.readdirSync(logsMediaDir);

      const logFiles = files.map((file) => {
        const filePath = path.join(logsMediaDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size // розмір файлу в байтах
        };
      });

      const res = await getDeviceLogs({ id, projectId });

      // Фільтруємо локальні лог-файли
      const filesToUpload = logFiles.filter((localFile) => {
        const serverFile = res.find((f) => f.name === localFile.name);
        return !serverFile || serverFile.size !== localFile.size;
      });

      // Ітеруємо через кожен файл і відправляємо його
      for (const { name } of filesToUpload) {
        const filePath = path.join(logsMediaDir, name);
        await postDeviceLog({ id, projectId, filePath, file: name });
      }
    } catch (error) {
      log.error('Помилка під час відправлення логів:', error);
    }
  }

  scheduler.scheduleNext(15, uploadLogs);
}
