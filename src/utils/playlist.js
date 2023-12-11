import { fileOperations, store } from '.';
import path from 'path';
import url from 'url';
export const generatePlaylist = () => {
  const contents = store.get('contents.current');
  const STORAGE = store.get('STORAGE');
  const playlist = [];
  for (const content of contents) {
    const destPath = path.join(process.cwd(), STORAGE.CONTENT, content.name);
    if (
      fileOperations.fileExists(destPath) &&
      fileOperations.isFileSizeCorrect(destPath, content.size)
    ) {
      const src = `localurl://${url.pathToFileURL(destPath).pathname}`;
      playlist.push({ ...content, src });
    }
  }
  return playlist;
};
