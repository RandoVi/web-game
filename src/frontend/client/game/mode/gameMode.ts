export type GameMode = 'multiplayer' | 'singleplayer';

let currentMode: GameMode = 'multiplayer';

export function setGameMode(mode: GameMode) {
  currentMode = mode;
}

export function getGameMode(): GameMode {
  return currentMode;
}
