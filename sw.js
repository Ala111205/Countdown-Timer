/* =========================
   GLOBAL STATE (MULTI ALARM)
========================= */
const alarmTimers = new Map();

/* =========================
   INSTALL & ACTIVATE
========================= */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

/* =========================
   MESSAGE FROM PAGE
========================= */
self.addEventListener("message", event => {
  const { type, payload } = event.data || {};
  if (!type) return;

  switch (type) {
    case "SET_ALARM":
      scheduleAlarm(payload);
      break;

    case "CLEAR_ALARM":
      clearAlarm(payload?.id);
      break;
  }
});

/* =========================
   ALARM SCHEDULING
========================= */
function scheduleAlarm(alarm) {
  if (!alarm?.id || !alarm?.time) return;

  // prevent duplicate scheduling
  clearAlarm(alarm.id);

  const delay = alarm.time - Date.now();
  if (delay <= 0) return;

  const timeoutId = setTimeout(() => {
    const formattedTime = new Date(alarm.time).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    self.registration.showNotification("⏰ Alarm Done", {
      body: `Alarm completed at ${formattedTime}`,
      tag: alarm.id,
      requireInteraction: true,
      actions: [{ action: "STOP", title: "Stop Alarm" }]
    });
  }, delay);

  alarmTimers.set(alarm.id, timeoutId);
}

function clearAlarm(alarmId) {
  if (!alarmId) return;

  const timeout = alarmTimers.get(alarmId);
  if (timeout) clearTimeout(timeout);

  alarmTimers.delete(alarmId);
}

/* =========================
   NOTIFICATION ACTIONS
========================= */
self.addEventListener("notificationclick", event => {
  const alarmId = event.notification.tag;
  event.notification.close();

  clearAlarm(alarmId);

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true })
      .then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: "STOP_ALARM",
            id: alarmId
          });
        });
      })
  );
});