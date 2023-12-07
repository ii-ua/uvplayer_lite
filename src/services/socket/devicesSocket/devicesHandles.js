import socket from '../socket';
import DEVICE_EVENTS from './devicesEvents';
import { store } from '../../../utils';
import log from 'electron-log/main';
export const handleDeviceOnline = ({ deviceId, lastPing }) => {
  socket.emit(DEVICE_EVENTS.ONLINE, { deviceId, lastPing });
};

export const handleDeviceLastUpdate = ({ deviceId, lastUpdate }) => {
  socket.emit(DEVICE_EVENTS.LAST_UPDATE, { deviceId, lastUpdate });
};

socket.on(DEVICE_EVENTS.PLAYLIST, (data, callback) => {
  JSON.stringify();
  const playlist = store.get('playlist');
  log.warn(`socket get ${JSON.stringify(data)}`);
  // Відправлення даних назад на сервер
  callback(playlist);
});
