export const STORAGE_KEYS = [
  "characters",
  "weapons",
  "materials",
  "demonWedges",
  "forgeQueue",
  "forgeHistory",
  "dailyTasks",
  "weeklyTasks",
  "quickNotes",
  "pullPlans",
  "farmingGoals",
  "recipeOverrides",
  "customForgeRecipes",
  "commissions",
];

export function collectLocalSaveData() {
  const saveData: Record<string, unknown> = {};

  STORAGE_KEYS.forEach((key) => {
    const value = localStorage.getItem(key);

    if (!value) return;

    try {
      saveData[key] = JSON.parse(value);
    } catch {
      saveData[key] = value;
    }
  });

  return saveData;
}

export function restoreLocalSaveData(data: Record<string, unknown>) {
  STORAGE_KEYS.forEach((key) => {
    if (data[key] === undefined) return;

    const value = data[key];

    if (typeof value === "string") {
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  });
}
