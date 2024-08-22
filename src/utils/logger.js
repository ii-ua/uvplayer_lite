import log from 'electron-log';
import fs from 'fs';
import path from 'path';
import moment from 'moment';
import store from './store';

log.initialize();

// Функція для видалення старих файлів
function deleteOldLogs(directoryPath, retentionPeriodDays) {
  const files = fs.readdirSync(directoryPath);

  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    const fileStat = fs.statSync(filePath);
    const fileDate = moment(fileStat.birthtime);
    const diffDays = moment().diff(fileDate, 'days');

    if (diffDays > retentionPeriodDays) {
      fs.unlinkSync(filePath);
    }
  });
}

if (log.transports.file) {
  log.transports.file.resolvePathFn = (variables, msg) => {
    const STORAGE = store.get('STORAGE');
    if (msg?.level === 'info') {
      if (!fs.existsSync(STORAGE.LOGS_MEDIA)) {
        fs.mkdirSync(STORAGE.LOGS_MEDIA);
      }

      deleteOldLogs(STORAGE.LOGS_MEDIA, 45);

      return path.join(STORAGE.LOGS_MEDIA, `log_${moment().format('YYYY-MM-DD')}.txt`);
    } else {
      if (!fs.existsSync(STORAGE.LOGS_ERROR)) {
        fs.mkdirSync(STORAGE.LOGS_ERROR);
      }

      deleteOldLogs(STORAGE.LOGS_ERROR, 30);

      return path.join(STORAGE.LOGS_ERROR, `log-error_${moment().format('YYYY-MM-DD')}.txt`);
    }
  };
  log.transports.file.level = ['warn', 'error', 'verbose', 'debug', 'silly'];
}

export default log;
