import axios from 'axios';
import { store } from '../../utils';
const SERVER_URL = store.get('SERVER_URL');

export const fetchAirtimeByDevice = async (id) => {
  const res = await axios.get(`${SERVER_URL.API_URL}/airtimes/devices/${id}`);
  return res.data;
};
