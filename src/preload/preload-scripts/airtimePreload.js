import { store } from '../../utils';
import { generatePlaylistForDevice } from '../../workers/airtimeWorker';
export default {
  airtimePlaylist: () => {
    return new Promise((resolve, reject) => {
      try {
        const playlist = store.get('playlist');
        resolve(playlist);
      } catch (err) {
        reject(err);
      }
    });
  },

  generateAirtimePlaylist: () => {
    generatePlaylistForDevice();
  }
};
