import { scheduler, store, fileOperations } from '../utils';
import log from 'electron-log/main';
import { googleApi } from '../services/api';

export async function downloadFiles() {
  log.warn('DownloadFiles');
  let isDownload = false;
  try {
    isDownload = await googleApi.downloadFiles();
  } catch (error) {
    log.error(error);
  }
  if (isDownload) {
    const nextContent = store.get('contents.next');
    const STORAGE = store.get('STORAGE');
    store.set('contents.current', nextContent);
    fileOperations.cleanupFiles(nextContent, STORAGE.CONTENT);
  }
  scheduler.scheduleNext(5, downloadFiles);
}
