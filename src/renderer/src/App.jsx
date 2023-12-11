import { Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import PlayerPage from './pages/PlayerPage/PlayerPage';
import { ConfigEditorPage } from './pages/ConfigEditorPage/ConfigEditorPage';
function App() {
  const navigate = useNavigate();

  useEffect(() => {
    window.api.navigate((path) => {
      navigate(path);
    });
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<PlayerPage />} />
      <Route path="/config-editor" element={<ConfigEditorPage />} />
    </Routes>
  );
}

export default App;
