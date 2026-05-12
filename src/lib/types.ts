export type ElementType =
  | "Lumino"
  | "Pyro"
  | "Umbro"
  | "Anemo"
  | "Electro"
  | "Hydro";

export type WeaponType =
  | "Assault Rifle"
  | "Bow"
  | "Dual Blades"
  | "Dual Pistols"
  | "Greatsword"
  | "Grenade Launcher"
  | "Katana"
  | "Pistol"
  | "Polearm"
  | "Shotgun"
  | "Sword"
  | "Whipsword";

export type WeaponRange = "Melee" | "Ranged";

export type Material = {
  name: string;
  required: number;
  owned: number;
};

export type Character = {
  id: string;
  name: string;
  element: ElementType;
  source: string;
  owned: boolean;
  completed: boolean;
  intronLevel: number;
  characterLevel: number;
  notes: string;
};

export type Weapon = {
  id: string;
  name: string;
  type: WeaponType;
  range: WeaponRange;
  source: string;
  owned: boolean;
  completed: boolean;
  weaponLevel: number;
  trackShiftModules: number;
  smeltLevel: number;
  notes: string;
};

export type ForgeMaterialRequirement = {
  name: string;
  required: number;
};

export type ForgingRecipe = {
  id: string;
  weaponId: string;
  weaponName: string;
  weaponType: WeaponType;
  forgeTimeMinutes: number;
  materials: ForgeMaterialRequirement[];
  primaryAscensionMaterial: string;
  secondaryAscensionMaterial: string;
  notes: string;
};

export type DemonWedgeRecipe = {
  id: string;
  name: string;
  family: string;
  section: string;
  element: string;
  source: string;
  materialSource: string;
  targetLevel: string;
  forgeCostCoins: number;
  materials: ForgeMaterialRequirement[];
  owned: boolean;
  level: number;
  notes: string;
};

export type ForgeQueueItem = {
  id: string;
  itemId: string;
  itemName: string;
  itemCategory: string;
  quantity: number;
  minutesPerQuantity: number;
  startedAt: string;
  durationMinutes: number;
  claimed: boolean;
  notified?: boolean;
};

export type MaterialInventoryItem = {
  id: string;
  name: string;
  owned: number;
  notes?: string;
category?: string;
};

export type DailyTask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Commission = {
  id: string;
  title: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
};

export type RecipeOverride = {
  recipeId: string;
  forgeTimeMinutes?: number;
  materials?: ForgeMaterialRequirement[];
};