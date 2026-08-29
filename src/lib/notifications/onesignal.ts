export function requestNotificationPermission(): Promise<void> {
  return new Promise((resolve, reject) => {
    window.OneSignalDeferred ??= [];

    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.Notifications.requestPermission();
        resolve();
      } catch (error: unknown) {
        reject(error);
      }
    });
  });
}