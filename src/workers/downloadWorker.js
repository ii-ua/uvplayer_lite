import path from 'path';
import { store, scheduler, fileOperations } from '../utils';
import { downloadFile } from '../services/api/downloadApi';
import log from 'electron-log/main';

const { fileExists, isFileSizeCorrect, cleanupFiles } = fileOperations;
const STORAGE = store.get('STORAGE');

export async function downloadAirtimeFiles() {
  log.warn('downloadAirtimeFiles');
  const airtime = store.get('airtimeNext');

  let allFilesAreCorrect = true;

  if (airtime) {
    const { items, type, clipFolder } = airtime;
    const contents = items.map(({ content }) => content);
    allFilesAreCorrect = await downloadFiles(contents, STORAGE.AIRTIME);
    if (type === 'auto clip') {
      allFilesAreCorrect = await downloadFiles(clipFolder.contents, STORAGE.CLIPS);
    }
    if (allFilesAreCorrect) {
      cleanupFiles(contents, STORAGE.AIRTIME);
      cleanupFiles(clipFolder.contents, STORAGE.CLIPS);
      store.set('airtimeCurrent', airtime);
    }
  }

  scheduler.scheduleNext(5, downloadAirtimeFiles);
}

async function downloadFiles(contents, fileDir) {
  let allFilesAreCorrect = true;
  for (let item of contents) {
    const { slug, _id, size, projectId } = item;
    const filePath = path.join(process.cwd(), fileDir, slug);

    if (!fileExists(filePath) || !isFileSizeCorrect(filePath, size)) {
      try {
        const result = await downloadFile(_id, projectId, filePath);
        log.warn(result);
        if (!isFileSizeCorrect(filePath, size)) {
          log.warn(`File ${slug} is corrupted. Redownloading.`);
          allFilesAreCorrect = false;
        }
      } catch (error) {
        log.error(error.message);
        allFilesAreCorrect = false;
      }
    }
  }
  return allFilesAreCorrect;
}
