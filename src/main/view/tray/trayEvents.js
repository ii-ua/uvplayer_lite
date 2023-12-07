import { store } from '../../../utils';
import { dialog, app } from 'electron';
export const handleDeleteConfig = () => {
  dialog
    .showMessageBox({
      type: 'warning',
      buttons: ['Yes', 'No'],
      defaultId: 1,
      title: 'Confirm',
      message: 'Are you sure you want to delete the configuration?'
    })
    .then((result) => {
      if (result.response === 0) {
        // User clicked 'Yes'
        store.clear();
        app.relaunch();
        app.exit(0);
        console.log('exit');
        // Add your code here to handle the deletion
      }
    });
};
