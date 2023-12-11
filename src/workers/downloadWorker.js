import { scheduler, store, fileOperations, playlist } from '../utils';
import log from 'electron-log/main';
import { googleApi } from '../services/api';
import path from 'path';

export async function downloadFiles() {
  log.warn('DownloadFiles');
  const isDownload = await googleApi.downloadFiles();
  if (isDownload) {
    const nextContent = store.get('contents.next');
    const STORAGE = store.get('STORAGE');
    store.set('contents.current', nextContent);
    fileOperations.cleanupFiles(nextContent, path.join(process.cwd(), STORAGE.CONTENT));
  }
  scheduler.scheduleNext(5, downloadFiles);
}
