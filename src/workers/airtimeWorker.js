import { fetchAirtimeByDevice } from '../services/api/airtimeApi';
import { store, scheduler, contentItemUtils } from '../utils';
import path from 'path';
import moment from 'moment';
import log from 'electron-log/main';

const {
  isWithinDateRange,
  isDayActive,
  isDeviceIncluded,
  getCombinations,
  getBestCombination,
  isfileExists,
  //createStandardPlaylist,
  createAutoClipPlaylist
} = contentItemUtils;

export async function updateAirtime() {
  try {
    const { _id } = store.get('device');
    const data = await fetchAirtimeByDevice(_id);
    store.set('airtimeNext', data);
  } catch (error) {
    const msg = error.message;
    log.error(msg);
  }
  log.warn('updateAirtime');

  scheduler.scheduleNext(5, updateAirtime);
}

export function generatePlaylistForDevice() {
  const airtime = store.get('airtimeCurrent');
  const device = store.get('device');
  const STORAGE = store.get('STORAGE');
  if (!airtime) {
    return [];
  }
  const { items, type, clipFolder } = airtime;

  const dayOfWeek = moment().format('dddd').toLowerCase();
  const workHours = device.workTime[dayOfWeek];
  const startTime = moment(workHours.start, 'HH:mm');
  const endTime = moment(workHours.end, 'HH:mm');

  const validContents = [];
  const fixedSlots = [[], [], [], [], [], [], [], [], [], [], [], []];

  for (let contentItem of items) {
    if (!isfileExists(STORAGE.AIRTIME, contentItem?.content)) continue;
    if (!isWithinDateRange(startTime, contentItem)) continue;
    if (!isDayActive(contentItem, dayOfWeek)) continue;
    if (!isDeviceIncluded(contentItem, device)) continue;

    validContents.push({
      ...contentItem,
      count: contentItem.countDisplayHour
    });
  }

  for (let contentItem of validContents) {
    const combinations = getCombinations(contentItem.count);
    const chosenCombination = getBestCombination(combinations, fixedSlots);

    if (!chosenCombination) continue;

    for (let index of chosenCombination) {
      fixedSlots[index].push(contentItem);
    }
  }

  let playlist = [];

  switch (type) {
    case 'panel':
      playlist = createAutoClipPlaylist(fixedSlots, path.join(process.cwd(), STORAGE.AIRTIME));
      break;
    case 'auto clip':
      playlist = createAutoClipPlaylist({
        fixedSlots,
        clips: clipFolder?.contents,
        startPlaylist: startTime,
        endPlaylist: endTime
      });
      break;
    default:
      playlist = createAutoClipPlaylist(fixedSlots, path.join(process.cwd(), STORAGE.AIRTIME));
      break;
  }

  // // Виведення плейлисту для перевірки
  // console.log('playlist', playlist.length);
  // playlist.forEach((item) => {
  //   console.log(`content: ${item.content.fileName}, start: ${item.start}, end: ${item.end}`);
  // });

  store.set('playlist', playlist);

  return playlist;
}

// export function generatePlaylistForDevice() {
//   const airtime = store.get('airtimeCurrent');
//   const STORAGE = store.get('STORAGE');
//   if (!airtime) {
//     return [];
//   }
//   const { items, type, clipFolder } = airtime;
//   const device = store.get('device');

//   const currentTime = moment().startOf('day');
//   const currentDay = currentTime.format('dddd').toLowerCase();
//   const workHours = getWorkHours(device.workTime[currentDay]);

//   const hourlyPlaylists = workHours.map((hour) => {
//     const time = moment(currentTime);
//     generateHourlyPlaylist(time.add(hour, 'hour'), currentDay, items, device, STORAGE);
//   });

//   const validContents = [];
//   const fixedSlots = [[], [], [], [], [], [], [], [], [], [], [], []];

//   for (let contentItem of items) {
//     if (!isfileExists(STORAGE.AIRTIME, contentItem?.content)) continue;
//     if (!isWithinDateRange(currentTime, contentItem)) continue;
//     if (!isWithinTimeRange(currentTime, contentItem)) continue;
//     if (!isDayActive(contentItem, currentDay)) continue;
//     if (!isDeviceIncluded(contentItem, device)) continue;

//     validContents.push({
//       ...contentItem,
//       count: contentItem.countDisplayHour
//     });
//   }

//   validContents.sort(() => 0.5 - Math.random());
//   console.log(device);

//   for (let contentItem of validContents) {
//     const combinations = getCombinations(contentItem.count);
//     const chosenCombination = getBestCombination(combinations, fixedSlots);

//     if (!chosenCombination) continue;

//     for (let index of chosenCombination) {
//       fixedSlots[index].push(contentItem.content);
//     }
//   }

//   for (let i = 0; i < fixedSlots.length; i++) {
//     log.warn(`slot ${i}`, fixedSlots[i].length);
//   }

//   let playlist = [];

//   switch (type) {
//     case 'panel':
//       playlist = createAutoClipPlaylist(fixedSlots, path.join(process.cwd(), STORAGE.AIRTIME));
//       break;
//     case 'auto clip':
//       playlist = createAutoClipPlaylist(
//         fixedSlots,
//         path.join(process.cwd(), STORAGE.AIRTIME),
//         STORAGE.CLIPS,
//         clipFolder?.contents
//       );
//       break;
//     default:
//       playlist = createAutoClipPlaylist(fixedSlots, path.join(process.cwd(), STORAGE.AIRTIME));
//       break;
//   }

//   //fixedSlots.flatMap((slot, index) => console.log(`block ${index + 1}`, slot));
//   store.set('playlist', playlist);
//   return playlist;
// }

// function generateHourlyPlaylist(currentTime, currentDay, items, device, STORAGE) {
//   const validContents = [];
//   const fixedSlots = [[], [], [], [], [], [], [], [], [], [], [], []];

//   for (let contentItem of items) {
//     if (!isfileExists(STORAGE.AIRTIME, contentItem?.content)) continue;
//     if (!isWithinDateRange(currentTime, contentItem)) continue;
//     if (!isWithinTimeRange(currentTime, contentItem)) continue;
//     if (!isDayActive(contentItem, currentDay)) continue;
//     if (!isDeviceIncluded(contentItem, device)) continue;

//     validContents.push({
//       ...contentItem,
//       count: contentItem.countDisplayHour
//     });
//   }

//   validContents.sort(() => 0.5 - Math.random());

//   for (let contentItem of validContents) {
//     const combinations = getCombinations(contentItem.count);
//     const chosenCombination = getBestCombination(combinations, fixedSlots);

//     if (!chosenCombination) continue;

//     for (let index of chosenCombination) {
//       fixedSlots[index].push(contentItem.content);
//     }
//   }
//   log.warn(currentTime);
//   for (let i = 0; i < fixedSlots.length; i++) {
//     log.warn(
//       `slot ${i}`,
//       fixedSlots[i].map((item) => item.fileName)
//     );
//   }

//   return fixedSlots;
// }

// function getWorkHours(workTime) {
//   let startHour = parseInt(workTime.start.split(':')[0]);
//   let endHour = parseInt(workTime.end.split(':')[0]);
//   let hours = [];
//   for (let hour = startHour; hour <= endHour; hour++) {
//     hours.push(hour);
//   }
//   return hours;
// }
