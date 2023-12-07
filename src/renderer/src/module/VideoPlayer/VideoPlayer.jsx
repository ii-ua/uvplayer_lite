// components/VideoPlayer.js
import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import '@vidstack/react/player/styles/base.css';
import { MediaPlayer, MediaProvider, useMediaPlayer } from '@vidstack/react';
import moment from 'moment';
import log from 'electron-log/renderer';
function InnerPlayer({ setCurrentSrcIndex, currentSrcIndex, playlist }) {
  const player = useMediaPlayer();
  const timeoutRef = useRef(null);

  // Функція для установки таймера до наступного відео
  const setNextVideoTimer = () => {
    const now = moment();
    const nextVideoIndex = currentSrcIndex + 1;

    if (nextVideoIndex < playlist.length) {
      // Перетворюємо час початку наступного відео з ISO строки до моменту і віднімаємо поточний час
      const timeToNextVideo = moment(playlist[nextVideoIndex].startTime).diff(now);

      timeoutRef.current = setTimeout(() => {
        setCurrentSrcIndex(nextVideoIndex);
      }, timeToNextVideo);
    }
  };

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current); // Видалити попередній таймер
    }
    setNextVideoTimer(); // Встановити новий таймер для поточного відео

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); // Очистити таймер при розмонтовуванні компоненту
      }
    };
  }, [currentSrcIndex, playlist]);

  useEffect(() => {
    const playHandler = () => {};
    const errorHandler = (e) => {
      const current = playlist[currentSrcIndex];
      const { content } = current;
      log.error(e.detail, `fileError: [id:${content._id} slug:${content.slug}]`);
      setCurrentSrcIndex(0);
    };
    const pauseHandler = () => {
      const current = playlist[currentSrcIndex];
      console.log('pause', current);
    };
    const playingHandler = () => {
      const current = playlist[currentSrcIndex];
      if (current) {
        const { content, startTime, endTime } = current;
        log.info(
          `Playing a file: [ id:${content._id} fileName:${content.fileName} slug:${content.slug} duration:${content.duration} startTime:${startTime} endTime:${endTime}]`
        );
      }
    };
    const endedHandler = () => {
      const nextIndex = currentSrcIndex < playlist.length - 1 ? currentSrcIndex + 1 : 0;
      setCurrentSrcIndex(nextIndex);
    };

    player.addEventListener('play', playHandler);
    player.addEventListener('pause', pauseHandler);
    player.addEventListener('playing', playingHandler);
    player.addEventListener('ended', endedHandler);
    player.addEventListener('error', errorHandler);

    // Видаляємо слухачі, коли компонент або ефект завершують роботу
    return () => {
      player.removeEventListener('play', playHandler);
      player.removeEventListener('pause', pauseHandler);
      player.removeEventListener('playing', playingHandler);
      player.removeEventListener('ended', endedHandler);
      player.removeEventListener('error', errorHandler);
    };
  }, [player, currentSrcIndex, playlist]);

  return null; // або повертайте якийсь JSX, якщо потрібно
}

export default function VideoPlayer({ playlist, width, height }) {
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(
    playlist?.length > 0 ? playlist[currentSrcIndex] : ''
  );

  useEffect(() => {
    setCurrentSrc(playlist?.length > 0 ? playlist[currentSrcIndex] : '');
  }, [currentSrcIndex, playlist]);

  const playerRef = useRef();
  return (
    <MediaPlayer
      ref={playerRef}
      preload
      style={{ width, height }}
      aspectRatio={`${width / height}`}
      autoplay
      title="Sprite Fight"
      src={currentSrc ?? ''}
    >
      <MediaProvider />
      <InnerPlayer
        setCurrentSrcIndex={setCurrentSrcIndex}
        currentSrcIndex={currentSrcIndex}
        playlist={playlist ?? []}
      />
    </MediaPlayer>
  );
}

InnerPlayer.propTypes = {
  setCurrentSrcIndex: PropTypes.func,
  currentSrcIndex: PropTypes.number,
  playlist: PropTypes.array
};

VideoPlayer.propTypes = {
  playlist: PropTypes.array,
  width: PropTypes.string,
  height: PropTypes.string
};
