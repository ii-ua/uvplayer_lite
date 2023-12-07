import ActivatedPage from '../pages/ActivatedPage/AcitvatedPage.jsx';
import PlayerPage from '../pages/PlayerPage/PlayerPage.jsx';
import { useState, useEffect } from 'react';
export default function MainRoute() {
  const [isActive, setIsActive] = useState(false);

  async function checkKey() {
    try {
      const key = await window.api.getActivationKey();
      if (!key) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }
  useEffect(() => {
    const fetchKey = async () => {
      const check = await checkKey();
      setIsActive(check);
    };
    fetchKey();
  }, []);
  if (!isActive) {
    return <ActivatedPage />;
  }
  return <PlayerPage />;
}
