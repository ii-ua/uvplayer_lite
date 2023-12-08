import VideoPlayer from '../../module/VideoPlayer/VideoPlayer.jsx';

export default function PlayerPage() {
  return (
    <div style={{ width: `100vw`, height: `100vh` }}>
      <VideoPlayer playlist={[]} />
    </div>
  );
}
