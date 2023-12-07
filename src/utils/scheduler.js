export function scheduleNext(delay = 5, callback) {
  setTimeout(
    () => {
      callback();
    },
    delay * 60 * 1000
  );
}
