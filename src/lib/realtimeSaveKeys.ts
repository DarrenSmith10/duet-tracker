export const REALTIME_SAVE_KEYS = [
  "materials",
  "forgeQueue",
  "forgeHistory",
  "dailyTasks",
  "weeklyTasks",
  "quickNotes",
  "customForgeRecipes",
  "recipeOverrides",
  "monthlyResetTrackers",
  "mysticMazeShopCalculator",
] as const;

export type RealtimeSaveKey = (typeof REALTIME_SAVE_KEYS)[number];

export function isRealtimeSaveKey(value: string): value is RealtimeSaveKey {
  return REALTIME_SAVE_KEYS.includes(value as RealtimeSaveKey);
}
