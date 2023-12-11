import { google } from 'googleapis';
import { store } from '../../utils';
import path from 'path';
import log from 'electron-log';
import fs from 'fs';
import { fileOperations } from '../../utils';

const pathConf = store.get('STORAGE.CONF');

function authorizeGoogleDrive() {
  const credentials = path.join(process.cwd(), pathConf, 'credentials.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: credentials,
    scopes: ['https://www.googleapis.com/auth/drive']
  });
  return google.drive({ version: 'v3', auth, timeout: 60000 });
}

export async function listFoldersGoogle() {
  const drive = authorizeGoogleDrive();
  const folders = [];

  try {
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder'",
      fields: 'nextPageToken, files(id, name)',
      spaces: 'drive'
    });

    const { files } = response.data;
    if (files.length) {
      files.forEach((file) => {
        folders.push({
          id: file.id,
          folderName: file.name
        });
      });
    } else {
      log.warn('No folders found.');
    }
    return folders;
  } catch (error) {
    log.error('The API returned an error:', error);
    return [];
  }
}

export async function downloadFiles() {
  const drive = authorizeGoogleDrive();

  const setting = store.get('setting');
  const STORAGE = store.get('STORAGE');
  const folderId = setting?.folder;
  let allFilesDownloaded = true;

  if (folderId) {
    const response = await drive.files.list({
      q: `'${folderId}' in parents`,
      fields: 'files(id, name, size, mimeType, videoMediaMetadata)'
    });

    const files = response.data.files;
    if (files.length === 0) {
      log.warn('No files found');
      return;
    }

    store.set('contents.next', files);

    for (const file of files) {
      const destPath = path.join(process.cwd(), STORAGE.CONTENT, file.name);

      if (
        fileOperations.fileExists(destPath) &&
        fileOperations.isFileSizeCorrect(destPath, file.size)
      ) {
        log.warn(`File ${file.name} already exists. Skipping download.`);
        continue;
      }

      log.warn(`Downloading ${file.name}...`);

      const dest = fs.createWriteStream(destPath);
      try {
        await new Promise((resolve, reject) => {
          drive.files.get(
            { fileId: file.id, alt: 'media' },
            { responseType: 'stream' },
            (err, res) => {
              if (err) {
                reject(err);
              }
              res.data
                .on('end', () => {
                  log.warn(`Downloaded ${file.name}`);
                  resolve();
                })
                .on('error', (err) => {
                  log.error('Error downloading file.', err);
                  reject(err);
                })
                .pipe(dest);
            }
          );
        });
      } catch (error) {
        allFilesDownloaded = false;
        log.error(`Failed to download ${file.name}: ${error.message}`);
      }
    }
  } else {
    log.error('Not found folder google');
    allFilesDownloaded = false;
  }

  return allFilesDownloaded;
}
