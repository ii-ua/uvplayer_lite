import path from 'path';
import fs from 'fs';
import log from 'electron-log/main';
import moment from 'moment';
import url from 'url';
import { store } from '../utils';
export function isWithinDateRange(currentDate, contentItem) {
  const startDate = moment(contentItem.startDate).startOf('day');
  const endDate = moment(contentItem.endDate).startOf('day');

  const currentMoment = moment(currentDate);

  return currentMoment.isSameOrAfter(startDate) && currentMoment.isSameOrBefore(endDate);
}

export function isWithinTimeRange(currentTime, contentItem) {
  // Припускаємо, що currentTime - це об'єкт JavaScript Date, а contentItem містить startTime і endTime у форматі, який може бути розпізнаний Moment.js
  const startDate = moment(currentTime).format('YYYY-MM-DD');

  // Комбінуємо поточну дату з часами початку і завершення з contentItem
  const startTime = moment(`${startDate} ${contentItem.startTime}`, 'YYYY-MM-DD HH:mm');
  const endTime = moment(`${startDate} ${contentItem.endTime}`, 'YYYY-MM-DD HH:mm');

  // Конвертуємо currentTime в об'єкт Moment для порівняння
  const currentMoment = moment(currentTime);

  // Перевіряємо, чи поточний час знаходиться між часом початку та часом завершення (включно)
  return currentMoment.isSameOrAfter(startTime) && currentMoment.isSameOrBefore(endTime);
}

export function isfileExists(dirPath, { slug }) {
  // Додаткова перевірка на існування файлу
  try {
    const filePath = path.join(dirPath, slug);
    const isExists = fs.existsSync(filePath);
    return isExists;
  } catch (e) {
    return false;
  }
}

export function isDayActive(contentItem, currentDay) {
  return contentItem[currentDay];
}

export function isDeviceIncluded(contentItem, device) {
  return contentItem.devices.includes(device._id);
}

export function getCombinations(count) {
  let totalSlots = 12;
  let combinations = [];
  let step = totalSlots / count;

  for (let i = 0; i < totalSlots; i++) {
    let current = i;
    let combination = [current];

    for (let j = 1; j < count; j++) {
      current += step;
      if (current < totalSlots) {
        combination.push(current);
      } else {
        break;
      }
    }

    if (combination.length === count) {
      combinations.push(combination.map(Math.floor));
    }
  }

  return combinations;
}

export function getBestCombination(combinations, fixedSlots) {
  let bestCombination = null;
  let minAverageContentCount = Infinity;

  for (let combination of combinations) {
    // Загальна кількість роликів у слотах для даної комбінації
    let totalContentCountForCombination = combination.reduce(
      (acc, index) => acc + (fixedSlots[index] ? fixedSlots[index].length : 0),
      0
    );
    // Середня кількість роликів у слотах для даної комбінації
    let averageContentCount = totalContentCountForCombination / combination.length;

    if (averageContentCount < minAverageContentCount) {
      minAverageContentCount = averageContentCount;
      bestCombination = combination;
    }
  }

  return bestCombination;
}

export function createAutoClipPlaylist({ fixedSlots, clips, startPlaylist, endPlaylist }) {
  const STORAGE = store.get('STORAGE');
  let usedClips = store.get('usedClips') ?? [];
  const pathAirtime = path.join(process.cwd(), STORAGE.AIRTIME);
  const pathClips = path.join(process.cwd(), STORAGE.CLIPS);

  const getNextClip = (usedClips, lastClipId) => {
    if (usedClips.length >= clips?.length) {
      //log.warn('All clips have been used. Resetting usedClips...');
      usedClips.length = 0; // Очистка масиву usedClips
    }
    for (let clip of clips ?? []) {
      if (!isfileExists(pathClips, clip)) continue;
      if (!usedClips.includes(clip._id) && clip._id !== lastClipId) {
        return clip;
      }
    }
    log.warn('No clip found');
    return null;
  };

  let currentTime = moment(startPlaylist);
  let currentHour = currentTime.hours();

  const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

  let playlist = [];

  while (currentTime.isBefore(endPlaylist)) {
    let prevDurationSlot = 0;
    for (let slot of fixedSlots) {
      if (currentTime.hours() !== currentHour) {
        currentHour = currentTime.hours();
        break;
      }
      let slotDuration = 0;
      if (prevDurationSlot > FIVE_MINUTES_IN_MS) {
        slotDuration = prevDurationSlot - FIVE_MINUTES_IN_MS;
      }
      for (let { content, startTime, endTime } of slot) {
        if (currentTime.hours() !== currentHour) {
          currentHour = currentTime.hours();
          break;
        }
        if (currentTime > endPlaylist) {
          break;
        }
        const startContent = moment(startTime, 'HH:mm');
        const endContent = moment(endTime, 'HH:mm');
        const startOfContent = moment(currentTime);
        const endOfContent = moment(startOfContent).add(parseInt(content.duration), 'milliseconds'); // використання тривалості ролика
        const urlSrc = url.pathToFileURL(path.join(pathAirtime, content.slug)).pathname;
        const src = `localurl://${urlSrc}`;

        if (currentTime.isSameOrAfter(startContent) && currentTime.isBefore(endContent)) {
          playlist.push({
            content: content,
            src,
            startTime: startOfContent.format(),
            endTime: endOfContent.format()
          });
          slotDuration += parseInt(content.duration);
          currentTime = endOfContent;
        }
      }

      let lastClipId = null;
      while (slotDuration < FIVE_MINUTES_IN_MS) {
        if (currentTime > endPlaylist) {
          break;
        }
        const clip = getNextClip(usedClips, lastClipId);
        if (!clip) {
          break;
        }
        usedClips.push(clip._id);
        lastClipId = clip._id;

        const startOfContent = moment(currentTime);
        const endOfContent = moment(startOfContent).add(parseInt(clip.duration), 'milliseconds');
        const urlSrc = url.pathToFileURL(path.join(pathClips, clip.slug)).pathname;
        const src = `localurl://${urlSrc}`;

        playlist.push({
          content: clip,
          src,
          startTime: startOfContent.format(),
          endTime: endOfContent.format()
        });
        currentTime = endOfContent;
        slotDuration += parseInt(clip.duration);
      }

      prevDurationSlot = slotDuration;
    }
  }

  store.set('usedClips', usedClips);

  return playlist;
}
