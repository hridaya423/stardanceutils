
let lastActivity = 0;
let installed = false;
let discharging = false;

function markActivity() {
  lastActivity = performance.now();
}

const ACTIVITY_EVENTS = ['pointermove', 'pointerdown', 'wheel', 'scroll', 'keydown', 'touchstart'];

type BatteryLike = {
  charging: boolean;
  addEventListener: (type: string, listener: () => void) => void;
};

export function ensureActivityTracking() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  lastActivity = performance.now();
  for (const ev of ACTIVITY_EVENTS) {
    window.addEventListener(ev, markActivity, { passive: true, capture: true });
  }
  const getBattery = (navigator as Navigator & { getBattery?: () => Promise<BatteryLike> }).getBattery;
  getBattery
    ?.call(navigator)
    .then((battery) => {
      const update = () => {
        discharging = !battery.charging;
      };
      update();
      battery.addEventListener('chargingchange', update);
    })
    .catch(() => {});
}

export function isLongIdle(thresholdMs = 60000) {
  return performance.now() - lastActivity > thresholdMs;
}

export function isOnBattery() {
  return discharging;
}
