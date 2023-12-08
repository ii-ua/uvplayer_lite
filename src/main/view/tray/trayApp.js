import { Tray, nativeImage, Menu, app } from 'electron';
import * as trayEvents from './trayEvents';
export const initTray = () => {
  const path = `${app.getAppPath()}${'/resources/tray/tray_app.png'}`;
  const image = nativeImage.createFromPath(path);
  const tray = new Tray(image);

  return tray;
};

export const createContextMenu = (win) => {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Setting',
      type: 'submenu',
      submenu: [
        { label: 'Edit config', type: 'normal', click: () => trayEvents.handleEditConfig(win) },
        { label: 'Delete config', type: 'normal', click: trayEvents.handleDeleteConfig }
      ]
    },
    { label: 'About', type: 'normal' }
  ]);

  return contextMenu;
};
