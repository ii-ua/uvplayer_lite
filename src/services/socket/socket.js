import io from 'socket.io-client';
import log from 'electron-log/main';
import { store } from '../../utils';
const SERVER_URL = store.get('SERVER_URL');
const socket = io(SERVER_URL?.SOCKET_URL, {
  reconnectionDelayMax: 1000 * 120,
  reconnectionDelay: 1000 * 60
});

socket.on('connect', () => {
  log.warn('Connected to the server via Socket.IO');
});

socket.on('disconnect', () => {
  log.warn('Disconnected from the server Socket.IO');
});

socket.on('error', (error) => {
  log.error('socket error', error);
});

socket.on('connect_error', (error) => {
  log.error('socket error', error.message);
});

export default socket;
