import { useEffect, useState } from 'react';
import VideoPlayer from '../../module/VideoPlayer/VideoPlayer.jsx';
import log from 'electron-log/renderer';
import moment from 'moment';
//import * as Sentry from "@sentry/react";

export default function PlayerPage() {
  const [playlist, setPlaylist] = useState([]);
  const [endTime, setEndTime] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [device, setDevice] = useState(null);
  const [screen, setScreen] = useState({
    width: '600',
    height: '600'
  });

  const handleReadPlaylist = async () => {
    try {
      const data = await window.api.airtimePlaylist();
      console.log('playlist', data ?? []);
      setPlaylist(data);
      // Зберегти час завершення останнього файлу в плейлисті
      if (data?.length > 0) {
        setEndTime(data[data?.length - 1]?.endTime);
        setStartTime(data[0]?.startTime);
      }
    } catch (error) {
      window.api.generateAirtimePlaylist();
      log.error('Error reading file:', error);
    }
  };

  const handleReadDevice = async () => {
    try {
      const data = await window.api.currentDevice();

      console.log('device', data);
      if (data) {
        setDevice(data);
      }
    } catch (error) {
      log.error('Error reading file:', error);
    }
  };

  useEffect(() => {
    handleReadPlaylist();
    // Перевірка кожну хвилину
    const interval = setInterval(() => {
      const now = moment();
      if (startTime && moment(startTime).isAfter(now)) {
        log.warn('Плейлист згенеровано для майбутнього часу. Генерую новий плейлист...');
        window.api.generateAirtimePlaylist();
        handleReadPlaylist();
      } else if (endTime && now.isSameOrAfter(moment(endTime))) {
        log.warn('Плейлист завершено. Генерую новий плейлист...');
        window.api.generateAirtimePlaylist();
        handleReadPlaylist();
      } else if (!endTime) {
        log.warn('Плейлист Відсутній. Генерую новий плейлист...');
        window.api.generateAirtimePlaylist();
        handleReadPlaylist();
      }
    }, 30000);

    // Очистити інтервал при знищенні компонента
    return () => clearInterval(interval);
  }, [endTime]);

  useEffect(() => {
    handleReadDevice();
    const interval = setInterval(() => {
      handleReadDevice();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // if (device) {
    //   Sentry.setUser({ id: device?._id, username: device?.deviceName });
    //   Sentry.setTag('deviceName', device?.deviceName);
    //   Sentry.setTag('location', device?.location);
    // }
  }, [device]);

  useEffect(() => {
    const handleStoreChange = () => {
      log.warn('Дані змінилися');
      window.api.generateAirtimePlaylist();
      handleReadPlaylist();
    };

    window.api.subscribeToStore('airtimeCurrent', handleStoreChange);

    // Функція очищення, яка буде викликана при демонтуванні компонента
    return () => {
      window.api.unsubscribeFromStore('airtimeCurrent', handleStoreChange);
    };
  }, []);

  useEffect(() => {
    const deviceScreen = device?.screens ?? '600x600';
    const [width, height] = deviceScreen.split('x');
    setScreen({ width, height });
  }, [device]);

  console.log(screen);

  return (
    <div style={{ width: `${screen.width}px`, height: `${screen.height}px` }}>
      <VideoPlayer playlist={playlist} />
    </div>
  );
}
