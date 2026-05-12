# Dashboard NaN/NaN Fix

## Copy this file

```txt
src/lib/dashboardProgress.ts
```

## Open

```txt
src/app/page.tsx
```

## Add import

```tsx
import {
  getDashboardDailyProgressFromStorage,
  getDashboardWeeklyProgressFromStorage,
} from "@/lib/dashboardProgress";
```

## Replace old progress loading with this

```tsx
const [dailyProgress, setDailyProgress] = useState({
  current: 0,
  target: 200,
  percent: 0,
});

const [weeklyProgress, setWeeklyProgress] = useState({
  current: 0,
  target: 0,
  percent: 0,
});

useEffect(() => {
  function refreshProgress() {
    setDailyProgress(getDashboardDailyProgressFromStorage());
    setWeeklyProgress(getDashboardWeeklyProgressFromStorage());
  }

  refreshProgress();

  window.addEventListener("focus", refreshProgress);
  window.addEventListener("dna-realtime-save-updated", refreshProgress);

  return () => {
    window.removeEventListener("focus", refreshProgress);
    window.removeEventListener("dna-realtime-save-updated", refreshProgress);
  };
}, []);
```

## Display values

Daily:

```tsx
{dailyProgress.current}/{dailyProgress.target}
{dailyProgress.percent}%
```

Weekly:

```tsx
{weeklyProgress.current}/{weeklyProgress.target}
{weeklyProgress.percent}%
```

Progress bar:

```tsx
style={{ width: `${dailyProgress.percent}%` }}
style={{ width: `${weeklyProgress.percent}%` }}
```
