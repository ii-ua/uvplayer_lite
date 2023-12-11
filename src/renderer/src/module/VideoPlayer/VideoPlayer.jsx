// components/VideoPlayer.js
import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ReactPlayer from 'react-player';
import log from 'electron-log/renderer';
import style from './VideoPlayer.module.css';
function InnerPlayer({ setCurrentSrcIndex, currentSrcIndex, playlist }) {
  useEffect(() => {
    const playHandler = () => {};
    const errorHandler = (e) => {
      const current = playlist[currentSrcIndex];
      log.error(e.detail, `fileError: [name:${current?.name}]`);
      setCurrentSrcIndex(0);
    };
    const pauseHandler = () => {
      const current = playlist[currentSrcIndex];
      console.log('pause', current);
    };
    const playingHandler = () => {
      const current = playlist[currentSrcIndex];
      if (current) {
        const { name } = current;
        log.info(`Playing a file: [ name:${name}]`);
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
  const [currentSrc, setCurrentSrc] = useState(playlist[0]);
  console.log(currentSrc);

  const playNext = () => {
    const nextVideoIndex = currentSrcIndex + 1;

    if (nextVideoIndex < playlist.length) {
      setCurrentSrcIndex(nextVideoIndex);
    } else {
      setCurrentSrcIndex(0);
    }
  };
  const onStart = () => {
    log.info(`Playing a file: [ name: ${currentSrc?.name} ]`);
  };

  const onEnded = () => {
    console.log('play next');
    playNext();
  };

  const onError = (error) => {
    console.log('error', error);
  };

  const onDispose = () => {
    console.log('dis');
  };

  useEffect(() => {
    setCurrentSrc(playlist?.length > 0 ? playlist[currentSrcIndex] : playlist[0]);
  }, [currentSrcIndex, playlist]);

  return (
    <ReactPlayer
      width={width}
      height={height}
      url={currentSrc?.src}
      playing={true}
      onStart={onStart}
      onEnded={onEnded}
      onError={onError}
    />
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
