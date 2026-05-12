import type { ForgeMaterialRequirement } from "@/lib/types";
import { pushSaveKeyToSupabase } from "@/lib/supabase/realtimeSync";


export type ForgeHistoryItem = {
  id: string;
  itemId: string;
  itemName: string;
  itemCategory: string;
  quantity: number;
  minutesPerQuantity: number;
  durationMinutes: number;
  startedAt: string;
  completedAt: string;
  claimedAt: string;
  materialsUsed: ForgeMaterialRequirement[];
  deductedMaterials: boolean;
};

const STORAGE_KEY = "forgeHistory";

export function loadForgeHistory(): ForgeHistoryItem[] {
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return [];

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveForgeHistory(history: ForgeHistoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function addForgeHistoryItem(item: ForgeHistoryItem) {
  const history = loadForgeHistory();
  saveForgeHistory([item, ...history]);
  pushSaveKeyToSupabase("forgeHistory").catch(() => {});
}

export function clearForgeHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
