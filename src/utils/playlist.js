import { fileOperations, store } from '.';
import path from 'path';
import url from 'url';

const sortByName = (items) => {
  return items.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
};
export const generatePlaylist = () => {
  const contents = store.get('contents.current');
  const STORAGE = store.get('STORAGE');
  const playlist = [];
  const sortedContents = sortByName(contents);
  if (contents) {
    for (const content of sortedContents) {
      const destPath = path.join(STORAGE.CONTENT, content.name);
      if (
        fileOperations.fileExists(destPath) &&
        fileOperations.isFileSizeCorrect(destPath, content.size)
      ) {
        const src = `${url.pathToFileURL(destPath).href}`;
        playlist.push({ ...content, src });
      }
    }
  }

  return playlist;
};
