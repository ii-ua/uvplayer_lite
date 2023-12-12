import fs from 'fs';
import path from 'path';
import store from './store';
import schedule from 'node-schedule';
import { exec } from 'child_process';
import log from 'electron-log/main';

const isWindows = process.platform === 'win32';
let shutdownJob;

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

export const initialShutdown = () => {
  const setting = store.get('setting');
  const isShutdown = setting?.isShutdown;
  const time = setting?.time !== '' ? setting?.time : '00:00';
  shutdown({ time, isShutdown });
};

const shutdown = ({ time, isShutdown }) => {
  // Скасування попередньої задачі, якщо вона існує
  if (shutdownJob) {
    shutdownJob.cancel();
  }

  // Розрахунок часу для виключення або перезавантаження
  const [hours, minutes] = time.split(':').map(Number);
  const rule = new schedule.RecurrenceRule();
  rule.hour = hours;
  rule.minute = minutes;

  // Планування задачі
  shutdownJob = schedule.scheduleJob(rule, () => {
    let command;
    if (isWindows) {
      command = `shutdown ${isShutdown ? '/s' : '/r'} /t 0`;
    } else {
      command = `sudo ${isShutdown ? 'poweroff' : 'reboot'}`;
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        log.error(`exec error: ${error}`);
        return;
      }
      log.warn(`stdout: ${stdout}`);
      log.error(`stderr: ${stderr}`);
    });
  });
};
