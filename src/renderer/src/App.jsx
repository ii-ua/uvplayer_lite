import { Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import PlayerPage from './pages/PlayerPage/PlayerPage';
function App() {
  const navigate = useNavigate();

  useEffect(() => {
    window.api.navigate((path) => {
      console.log(path);
      navigate(path);
    });
  }, [navigate]);
  <Routes>
    <Route path="/" element={<PlayerPage />} />
    <Route path="/config-editor" element={<PlayerPage />} />
  </Routes>;
  return <PlayerPage />;
}

export default App;
