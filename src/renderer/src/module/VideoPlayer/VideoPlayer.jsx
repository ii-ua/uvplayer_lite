import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { MediaPlayer, MediaProvider, useMediaPlayer } from '@vidstack/react';
import log from 'electron-log/renderer';
import style from './VideoPlayer.module.css';
function InnerPlayer({ currentSrcIndex, playlist }) {
  const player = useMediaPlayer();

  useEffect(() => {
    const playHandler = async () => {
      player.play();
    };

    player.addEventListener('ended', playHandler);

    // Видаляємо слухачі, коли компонент або ефект завершують роботу
    return () => {
      player.removeEventListener('ended', playHandler);
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

  const onError = (detail) => {
    console.log(playerRef);
    const current = playlist[currentSrcIndex];
    console.log(current);
    log.error(detail, `fileError: [name:${current?.name}]`);
    setCurrentSrcIndex(0);
  };

  const onPause = () => {
    const current = playlist[currentSrcIndex];
    console.log('pause', current);
  };
  const onPlay = () => {
    const current = playlist[currentSrcIndex];
    if (current) {
      const { name } = current;
      log.info(`Playing a file: [ name:${name} ]`);
    }
  };
  const onEnded = () => {
    const nextIndex = currentSrcIndex < playlist.length - 1 ? currentSrcIndex + 1 : 0;
    setCurrentSrcIndex(nextIndex);
  };

  const playerRef = useRef();
  return (
    <MediaPlayer
      className={style.player}
      ref={playerRef}
      preload
      autoPlay
      style={{ width, height, backgroundColor: 'black' }}
      aspectRatio={`${width / height}`}
      title={`${currentSrc?.name ?? ''}`}
      src={currentSrc?.src ?? ''}
      onError={onError}
      onPause={onPause}
      onPlay={onPlay}
      onEnded={onEnded}
      currentTime={0}
    >
      <MediaProvider className={style.player} />
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
