import Title from '../../shared/componens/Title/Title';
import style from './ConfigEditorPage.module.css';
import { useEffect, useState } from 'react';
import { Select, TimePicker, Switch, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import Label from '../../shared/componens/Label/Label';
import dayjs from 'dayjs';
export function ConfigEditorPage() {
  const [folders, setFolders] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [time, setTime] = useState('');
  const [isShutdown, setIsShutdown] = useState(false);
  const navigate = useNavigate();

  const onFolders = async () => {
    setFolders(await window.api.getFoldersGoogle());
  };

  useEffect(() => {
    const fetchSetting = async () => {
      const setting = await window.api.getSetting();
      setSelectedOption(setting?.folder ?? '');
      setTime(dayjs(setting?.time ?? '00:00', 'HH:mm'));
      setIsShutdown(setting?.isShutdown ?? false);
    };
    fetchSetting();
    onFolders();
  }, []);

  const onChangeTime = (time) => {
    setTime(time);
  };

  const onSave = async () => {
    window.api.saveSetting({
      folder: selectedOption,
      time: time.format('HH:mm'),
      isShutdown
    });
  };

  const onClose = () => {
    navigate('/');
  };

  const optionFolders = folders.map((folder) => ({ value: folder.id, label: folder.folderName }));
  optionFolders.unshift({ value: '', label: 'none' });

  return (
    <div className={style.container}>
      <div className={style.wrapper}>
        <Title
          title="Media player configuration.
Select the folder from Google drive and configure the player settings."
        />

        <div className={style.wrapperSetting}>
          <div className={style.inner}>
            <Label title="Select the google folder:" />
            <Select
              onFocus={onFolders}
              style={{ width: '300px' }}
              options={optionFolders}
              defaultValue={selectedOption}
              value={selectedOption}
              label="Select the google folder: "
              onChange={setSelectedOption}
            />
          </div>
          <div className={style.inner}>
            <Label title="Select a shutdown/restart time:" />
            <TimePicker format="HH:mm" onChange={onChangeTime} value={time} />
          </div>
          <div className={style.inner}>
            <Label title="Turn off the device:" />
            <Switch value={time ? isShutdown : false} onChange={() => setIsShutdown(!isShutdown)} />
          </div>
        </div>
        <div className={style.wrapperButton}>
          <Button type="primary" onClick={onSave}>
            Save
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
