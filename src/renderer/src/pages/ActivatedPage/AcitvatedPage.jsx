import { useState } from 'react';
import styles from './ActivatedPage.module.css';
import log from 'electron-log/renderer';

export default function ActivatedPage() {
  const [error, setError] = useState('');
  const [values, setValues] = useState({
    key: '',
    serverApi: ''
  });
  const handleSubmit = async (event) => {
    event.preventDefault();
    const { key, serverApi } = event.target;
    try {
      await window.api.setApiUrl(serverApi.value);
      const data = await window.api.fetchDevice(key.value);
      await window.api.saveKeyAndRelaunch(data);
    } catch (error) {
      log.error(error);
      setError('Activation error.');
      // Можливо, вивести діалогове вікно з помилкою тут
    }
  };
  const onFocus = () => {
    setError('');
    setValues({ ...values, key: '' });
  };

  const onChange = (event) => {
    const { value, name } = event.target;
    setValues({ ...values, [name]: value });
  };

  const { key, serverApi } = values;
  return (
    <div className={styles.containerForm}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>
          To register your device, enter the activation key and the link to the server
        </h2>
        <form id="activated" className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inner}>
            <input
              onChange={onChange}
              onFocus={onFocus}
              placeholder="Enter the key"
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              required
              type="text"
              name="key"
              value={key}
            />
            <input
              onChange={onChange}
              placeholder="Enter the server url"
              required
              className={styles.input}
              type="text"
              name="serverApi"
              value={serverApi}
            />
            {error && <p className={styles.errorText}>{error}</p>}
          </div>
        </form>
        <button form="activated" className={styles.button} type="submit">
          Activate
        </button>
      </div>
    </div>
  );
}
