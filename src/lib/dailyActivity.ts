export type DailyActivityTask = {
  id: string;
  title: string;
  current: number;
  target: number;
  reward: number;
};

export type WeeklyActivityTracker = {
  id: string;
  title: string;
  current: number;
  target: number;
};

export const DEFAULT_DAILY_ACTIVITY_TASKS: DailyActivityTask[] = [
  { id: "commission", title: "Complete any Commission", current: 0, target: 1, reward: 80 },
  { id: "defeat-opponents", title: "Defeat 50 opponents", current: 0, target: 50, reward: 40 },
  { id: "forge", title: "Forge 1 time", current: 0, target: 1, reward: 40 },
  { id: "login", title: "Log in", current: 0, target: 1, reward: 40 },
  { id: "enhance-demon-wedge", title: "Enhance Demon Wedge 1 time", current: 0, target: 1, reward: 40 },
  { id: "mystic-maze-stage", title: "Complete any stage in Mystic Maze 1 time", current: 0, target: 1, reward: 200 },
  { id: "nocturnal-echoes-opponent", title: "Challenge and defeat any opponent in Nocturnal Echoes 1 time", current: 0, target: 1, reward: 160 },
  { id: "commission-chase", title: "Complete Commission: Chase 1 time", current: 0, target: 1, reward: 160 },
  { id: "colour-item", title: "Colour 1 item", current: 0, target: 1, reward: 40 },
  { id: "coop-10-minutes", title: "Spend a total of 10 minutes in co-op areas", current: 0, target: 10, reward: 40 },
  { id: "covert-commission", title: "Complete 1 Covert Commission", current: 0, target: 1, reward: 120 },
  { id: "main-story-quest", title: "Complete any Main Story Quest", current: 0, target: 1, reward: 200 },
  { id: "side-quest", title: "Complete any Side Quest", current: 0, target: 1, reward: 100 },
];

export const DEFAULT_WEEKLY_ACTIVITY_TRACKERS: WeeklyActivityTracker[] = [
  { id: "nocturnal-echoes", title: "Nocturnal Echoes", current: 0, target: 5 },
  { id: "mystic-maze", title: "Mystic Maze", current: 0, target: 12 },
  { id: "chase", title: "Chase", current: 0, target: 3 },
];
