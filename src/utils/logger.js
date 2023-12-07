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
      const logsMediaDir = path.join(process.cwd(), STORAGE.LOGS_MEDIA);
      if (!fs.existsSync(logsMediaDir)) {
        fs.mkdirSync(logsMediaDir);
      }

      deleteOldLogs(logsMediaDir, 45);

      return path.join(logsMediaDir, `log_${moment().format('YYYY-MM-DD')}.txt`);
    } else {
      const logsErrorDir = path.join(process.cwd(), STORAGE.LOGS_ERROR);
      if (!fs.existsSync(logsErrorDir)) {
        fs.mkdirSync(logsErrorDir);
      }

      deleteOldLogs(logsErrorDir, 30);

      return path.join(logsErrorDir, `log-error_${moment().format('YYYY-MM-DD')}.txt`);
    }
  };
  log.transports.file.level = ['warn', 'error', 'verbose', 'debug', 'silly'];
}

export default log;
