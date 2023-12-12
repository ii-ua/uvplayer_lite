import { useEffect, useState } from 'react';
import VideoPlayer from '../../module/VideoPlayer/VideoPlayer.jsx';
import log from 'electron-log/renderer.js';
import { useNavigate } from 'react-router-dom';

export default function PlayerPage() {
  const [playlist, setPlaylist] = useState([]);
  const getPlaylist = async () => {
    const pl = await window.api.getPlaylist();
    setPlaylist(pl);
  };
  const navigate = useNavigate();
  useEffect(() => {
    window.api.navigate((path) => {
      navigate(path);
    });
  }, [navigate]);
  useEffect(() => {
    getPlaylist();
    const handleStoreChange = () => {
      log.warn('Дані змінилися');
      getPlaylist();
    };

    window.api.subscribeToStore('contents.current', handleStoreChange);

    // Функція очищення, яка буде викликана при демонтуванні компонента
    return () => {
      window.api.unsubscribeFromStore('contents.current', handleStoreChange);
    };
  }, []);
  return (
    <div style={{ width: `100vw`, height: `100vh` }}>
      <VideoPlayer playlist={playlist} width="100vw" height="100vh" />
    </div>
  );
}
