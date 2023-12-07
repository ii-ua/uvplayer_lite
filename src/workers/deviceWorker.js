import { fetchDevice } from '../services/api/deviceApi';
import { devicesHandles } from '../services/socket';
import { store, scheduler } from '../utils';
import log from 'electron-log/main';
import moment from 'moment';
export async function updateDevice() {
  const savedKey = store.get('activationKey');
  try {
    const data = await fetchDevice(savedKey);
    store.set('device', data);
  } catch (error) {
    const msg = error.message;
    log.error(msg);
  }
  log.warn('updateDevice');
  scheduler.scheduleNext(5, updateDevice);
}

export async function updateStatusDevice() {
  try {
    const { _id } = store.get('device');
    devicesHandles.handleDeviceOnline({ deviceId: _id, lastPing: moment().format() });
  } catch (error) {
    const msg = error.message;
    log.error(msg);
  }
  log.warn('updateStatusDevice');
  scheduler.scheduleNext(2, updateStatusDevice);
}

export async function lastUpdateDevice() {
  try {
    const { _id } = store.get('device');
    const airtime = store.get('airtimeCurrent');
    const lastUpdate = airtime.updatedAt;
    devicesHandles.handleDeviceLastUpdate({ deviceId: _id, lastUpdate });
  } catch (error) {
    const msg = error.message;
    log.error(msg);
  }
  log.warn('lastUpdateDevice');
  scheduler.scheduleNext(2, lastUpdateDevice);
}
