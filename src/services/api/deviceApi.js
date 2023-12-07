import axios from 'axios';
import FormData from 'form-data';
import { store } from '../../utils';
const SERVER_URL = store.get('SERVER_URL');
import log from 'electron-log/main';
import fs from 'fs';

export const fetchDevice = async (key) => {
  const SERVER_URL = store.get('SERVER_URL');
  const res = await axios.get(`${SERVER_URL.API_URL}/devices/activate/${key}`);
  return res.data;
};

export const patchDeviceStatus = async (id) => {
  const res = await axios.patch(`${SERVER_URL.API_URL}/devices/${id}/online`, {
    isOnline: true
  });
  return res.data;
};

export const postDeviceLog = async ({ id, projectId, filePath, file }) => {
  try {
    const formData = new FormData();
    formData.append('file', fs.readFileSync(filePath), file);
    const res = await axios.post(
      `${SERVER_URL.API_URL}/devices/logs/${id}?projectId=${projectId}`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );
    return res.data;
  } catch (error) {
    log.error('Error sending log:', error.message);
  }
};

export const getDeviceLogs = async ({ id, projectId }) => {
  try {
    const res = await axios.get(`${SERVER_URL.API_URL}/devices/logs/${id}?projectId=${projectId}`);
    return res.data;
  } catch (error) {
    log.error(error.message);
    return [];
  }
};
