import { saveAlarm, updateAlarm, getAllAlarms, deleteAlarm } from "./db.js";

// ===== GLOBALS =====
let alarms = [];
let activeSoundAlarmId = null;
let globalAlarmInterval = null;

// ===== DOM ELEMENTS =====
const addBtn = document.querySelector(".fa-plus");
const timerContainer = document.querySelector(".timerContainer");
const alarmSound = document.getElementById("alarm-sound");

// ===== SERVICE WORKER & INITIAL LOAD =====
document.addEventListener("DOMContentLoaded", async () => {
  // Service Worker
  if ("serviceWorker" in navigator) {
    await navigator.serviceWorker.register("sw.js");
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
    await new Promise(resolve => {
      if (navigator.serviceWorker.controller) return resolve();
      navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true });
    });
  }

  alarms = await getAllAlarms();

  // Create ONE default alarm if DB is empty
  if (alarms.length === 0) {
    const defaultAlarm = {
      id: crypto.randomUUID(),
      status: "draft",
      createdAt: Date.now(),
      time: null,
      date: "",
      clock: ""
    };
    await saveAlarm(defaultAlarm);
    alarms = [defaultAlarm];
  }

  // Clear container (no HTML timers)
  timerContainer.innerHTML = "";

  // Restore ALL alarms (draft + scheduled + stopped)
  alarms
    .sort((a, b) => a.createdAt - b.createdAt)
    .forEach(alarm => {
      const timerEl = createTimer(alarm);
      timerContainer.appendChild(timerEl);
    });

  updateRealDateTime();
  setInterval(updateRealDateTime, 60_000);
});

// ===== SW MESSAGE =====
navigator.serviceWorker.addEventListener("message", (event) => {
  const { type, id } = event.data || {};
  if (!type) return;

  if (type === "STOP_ALARM") {
    stopAlarmSound(id);
    clearBackgroundAlarm(id);
    updateAlarm({ id, status: "stopped" });
  }

  // UI STATE
    const timerEl = document.querySelector(`.timer[data-id="${id}"]`);
    if (!timerEl) return;

    const startBtn = timerEl.querySelector(".fa-circle-play");
    const stopBtn = timerEl.querySelector(".fa-circle-stop");

    stopBtn.classList.remove("stop");
    startBtn.style.display = "block";
});

// ===== DATE/TIME VALIDATION =====
function getValidatedDateTime(dateValue, timeValue) {
  if (!dateValue || !timeValue) return null;
  let formattedDate = dateValue;
  if (dateValue.includes("-") && dateValue.split("-")[0].length === 2) {
    const [day, month, year] = dateValue.split("-");
    formattedDate = `${year}-${month}-${day}`;
  }
  const dt = new Date(`${formattedDate}T${timeValue}:00`);
  return isNaN(dt.getTime()) || dt <= new Date() ? null : dt;
}

// ===== COUNTDOWN =====
function startCountdown(targetDateTime, updateFn, alarmId) {
  const interval = setInterval(async () => {
    const distance = targetDateTime - Date.now();
    if (distance <= 0) {
      clearInterval(interval);
      updateFn(0, 0, 0, 0);
      playAlarmSound(alarmId);
      await updateAlarm({ id: alarmId, status: "fired" });
    } else {
      updateFn(
        Math.floor(distance / 86400000),
        Math.floor((distance % 86400000) / 3600000),
        Math.floor((distance % 3600000) / 60000),
        Math.floor((distance % 60000) / 1000)
      );
    }
  }, 1000);
  return interval;
}

function playAlarmSound(alarmId) {
  if (activeSoundAlarmId) return;
  activeSoundAlarmId = alarmId;
  globalAlarmInterval = setInterval(() => alarmSound.play(), 100);
}

function stopAlarmSound(alarmId) {
  if (alarmId !== activeSoundAlarmId) return;
  clearInterval(globalAlarmInterval);
  globalAlarmInterval = null;
  activeSoundAlarmId = null;
  alarmSound.pause();
  alarmSound.currentTime = 0;
}

function registerAlarmWithSW(alarm) {
  if (!navigator.serviceWorker.controller) return;
  navigator.serviceWorker.controller.postMessage({ type: "SET_ALARM", payload: alarm });
}

function clearBackgroundAlarm(alarmId) {
  if (!alarmId || !navigator.serviceWorker.controller) return;
  navigator.serviceWorker.controller.postMessage({ type: "CLEAR_ALARM", payload: { id: alarmId } });
}

// ===== MULTIPLE TIMERS SUPPORT =====
addBtn.addEventListener("click", async () => {
  const alarm = { id: crypto.randomUUID(), time: null, date: "", clock: "", status: "draft", createdAt: Date.now() };
  await saveAlarm(alarm);
  const timerEl = createTimer(alarm);
  timerContainer.appendChild(timerEl);
});

function createTimer(alarm = null, existingTimerEl = null) {
  // Use existing timer element or create new
  const timerEl = existingTimerEl || document.createElement("div");
  if (!existingTimerEl) {
    timerEl.classList.add("timer");
    timerEl.innerHTML = `
      <div class="count">
        <div class="inp">
          <input class="date" type="date">
          <input class="time" type="time">
        </div>
        <div class="but">
          <div class="icon">
            <i class="fa-solid fa-circle-play"></i>
            <i class="fa-solid fa-circle-stop"></i>
          </div>
          <i class="fa-solid fa-rotate"></i>
        </div>
      </div>
      <div class="remains">
        <span class="days">0</span>
        <span class="hours">0</span>
        <span class="minutes">0</span>
        <span class="seconds">0</span>
      </div>
    `;
  }

  // DOM elements
  const dateInput = timerEl.querySelector(".date");
  const timeInput = timerEl.querySelector(".time");
  const startBtn = timerEl.querySelector(".fa-circle-play");
  const stopBtn = timerEl.querySelector(".fa-circle-stop");
  const resetBtn = timerEl.querySelector(".fa-rotate");
  const daysEl = timerEl.querySelector(".days");
  const hoursEl = timerEl.querySelector(".hours");
  const minutesEl = timerEl.querySelector(".minutes");
  const secondsEl = timerEl.querySelector(".seconds");

  // Internal state
  let countdownInterval = null;
  if (!alarm) {
    alarm = { id: crypto.randomUUID(), status: "draft", createdAt: Date.now(), time: null, date: "", clock: "" };
    saveAlarm(alarm);
  }
  timerEl.dataset.id = alarm.id;
  dateInput.value = alarm.date || "";
  timeInput.value = alarm.clock || "";

  // UI update helper
  function updateUI(d, h, m, s) {
    daysEl.textContent = d;
    hoursEl.textContent = h;
    minutesEl.textContent = m;
    secondsEl.textContent = s;
  }

  // Restore scheduled alarms
  if (alarm.status === "scheduled" && alarm.time > Date.now()) {
    registerAlarmWithSW(alarm);
    countdownInterval = startCountdown(new Date(alarm.time), updateUI, alarm.id);
    startBtn.style.display = "none";
    stopBtn.classList.add("stop");
  }

  // ===== START =====
  startBtn.addEventListener("click", async () => {
    const targetDateTime = getValidatedDateTime(dateInput.value, timeInput.value);
    if (!targetDateTime) return alert("Invalid date/time");

    if (countdownInterval) clearInterval(countdownInterval);

    alarm.time = targetDateTime.getTime();
    alarm.date = dateInput.value;
    alarm.clock = timeInput.value;
    alarm.status = "scheduled";

    await updateAlarm(alarm);
    registerAlarmWithSW(alarm);

    countdownInterval = startCountdown(targetDateTime, updateUI, alarm.id);

    startBtn.style.display = "none";
    stopBtn.classList.add("stop");
  });

  // ===== STOP =====
  stopBtn.addEventListener("click", async () => {
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = null;

    stopAlarmSound(alarm.id);
    clearBackgroundAlarm(alarm.id);

    stopBtn.classList.remove("stop");
    startBtn.style.display = "block";

    alarm.status = "stopped";
    await updateAlarm(alarm);
  });

  // ===== RESET =====
  resetBtn.addEventListener("click", async () => {
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = null;

    stopAlarmSound(alarm.id);
    clearBackgroundAlarm(alarm.id);

    updateUI(0, 0, 0, 0);
    dateInput.value = "";
    timeInput.value = "";

    stopBtn.classList.remove("stop");
    startBtn.style.display = "block";

    alarm.status = "draft";
    alarm.time = null;
    alarm.date = "";
    alarm.clock = "";
    await updateAlarm(alarm);
  });

  attachLongPressDelete(timerEl, alarm);

  return timerEl;
}

function attachLongPressDelete(timerEl, alarm) {
  let pressTimer = null;
  const HOLD_TIME = 800;
  let startX = 0, startY = 0;

  const start = e => {
    const point = e.touches ? e.touches[0] : e;
    startX = point.clientX; startY = point.clientY;

    pressTimer = setTimeout(async () => {
      const ok = confirm("Delete this alarm?");
      if (!ok) return;
      stopAlarmSound(alarm.id);
      clearInterval(globalAlarmInterval);
      await deleteAlarm(alarm.id);
      timerEl.remove();
    }, HOLD_TIME);
  };

  const move = e => {
    if (!pressTimer) return;
    const point = e.touches ? e.touches[0] : e;
    if (Math.abs(point.clientX - startX) > 10 || Math.abs(point.clientY - startY) > 10) {
      clearTimeout(pressTimer); pressTimer = null;
    }
  };

  const cancel = () => { if (pressTimer) clearTimeout(pressTimer); pressTimer = null; };

  timerEl.addEventListener("mousedown", start);
  timerEl.addEventListener("mousemove", move);
  timerEl.addEventListener("mouseup", cancel);
  timerEl.addEventListener("mouseleave", cancel);

  timerEl.addEventListener("touchstart", start, { passive: true });
  timerEl.addEventListener("touchmove", move, { passive: true });
  timerEl.addEventListener("touchend", cancel);
  timerEl.addEventListener("touchcancel", cancel);
}

// ===== REAL DATE & TIME (12-HOUR FORMAT) =====
function updateRealDateTime() {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // 0 → 12
  hours = String(hours).padStart(2, "0");

  const dayEl = document.querySelector(".RealDate .day");
  const monthEl = document.querySelector(".RealDate .month");
  const yearEl = document.querySelector(".RealDate .year");

  const hourEl = document.querySelector(".RealTime .hour");
  const minuteEl = document.querySelector(".RealTime .minute");
  const ampmEl = document.querySelector(".RealTime .ampm");

  if (!dayEl || !hourEl || !ampmEl) return;

  dayEl.textContent = day;
  monthEl.textContent = month;
  yearEl.textContent = year;

  hourEl.textContent = hours;
  minuteEl.textContent = minutes;
  ampmEl.textContent = ampm;
}