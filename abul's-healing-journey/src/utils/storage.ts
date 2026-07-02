import { GameState, SaveSlot } from '../types';
import { getInitialState } from '../data';

const PREFIX = 'ahj_';

export function getSlotMetaKey(slotId: number): string {
  return `${PREFIX}slot_${slotId}_meta`;
}

export function getSlotDataKey(slotId: number): string {
  return `${PREFIX}slot_${slotId}_data`;
}

export function getActiveSlotIdKey(): string {
  return `${PREFIX}active_slot_id`;
}

// Get the meta details for all 3 slots
export function loadSaveSlots(): SaveSlot[] {
  const slots: SaveSlot[] = [];
  for (let id = 1; id <= 3; id++) {
    const metaStr = localStorage.getItem(getSlotMetaKey(id));
    if (metaStr) {
      try {
        const meta = JSON.parse(metaStr);
        slots.push({
          id,
          name: meta.name || 'Abul',
          level: meta.level || 1,
          exp: meta.exp || 0,
          totalPoints: meta.totalPoints || 0,
          gardenLevel: meta.gardenLevel || 1,
          lastPlayed: meta.lastPlayed || new Date().toISOString(),
          exists: true
        });
      } catch (e) {
        slots.push({ id, name: `Slot ${id}`, level: 1, exp: 0, totalPoints: 0, gardenLevel: 1, lastPlayed: '', exists: false });
      }
    } else {
      slots.push({ id, name: `Slot ${id}`, level: 1, exp: 0, totalPoints: 0, gardenLevel: 1, lastPlayed: '', exists: false });
    }
  }
  return slots;
}

// Load detailed game data for a specific slot, falls back to default if doesn't exist
export function loadSlotData(slotId: number, defaultName?: string): GameState {
  const dataStr = localStorage.getItem(getSlotDataKey(slotId));
  if (dataStr) {
    try {
      return JSON.parse(dataStr);
    } catch (e) {
      console.error(`Failed to parse slot ${slotId} data, creating new game.`, e);
      return getInitialState(defaultName);
    }
  }
  return getInitialState(defaultName);
}

// Save detailed game state to localStorage
export function saveSlotData(slotId: number, state: GameState, onSavedCallback?: () => void) {
  // 1. Update slot meta
  const meta: Omit<SaveSlot, 'exists'> = {
    id: slotId,
    name: state.playerName,
    level: state.level,
    exp: state.exp,
    totalPoints: state.totalPoints,
    gardenLevel: state.garden.level,
    lastPlayed: new Date().toISOString(),
  };

  localStorage.setItem(getSlotMetaKey(slotId), JSON.stringify(meta));
  
  // 2. Update slot data
  localStorage.setItem(getSlotDataKey(slotId), JSON.stringify(state));

  // 3. Mark as active
  localStorage.setItem(getActiveSlotIdKey(), slotId.toString());

  if (onSavedCallback) {
    onSavedCallback();
  }
}

// Delete slot data
export function deleteSlot(slotId: number) {
  localStorage.removeItem(getSlotMetaKey(slotId));
  localStorage.removeItem(getSlotDataKey(slotId));
  
  const activeId = localStorage.getItem(getActiveSlotIdKey());
  if (activeId === slotId.toString()) {
    localStorage.removeItem(getActiveSlotIdKey());
  }
}

// Get the last active slot ID
export function getActiveSlotId(): number | null {
  const activeIdStr = localStorage.getItem(getActiveSlotIdKey());
  return activeIdStr ? parseInt(activeIdStr, 10) : null;
}
