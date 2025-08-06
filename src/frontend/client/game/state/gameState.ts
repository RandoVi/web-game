export type GameState = "menu" | "playing" | "paused" | "gameover";

let currentState: GameState = "menu";

export function getCurrentState(): GameState {
  return currentState;
}

export function setCurrentState(state: GameState): void {
  currentState = state;
}
// getCurrentState is called in, like ecery microsecond
// setCurrentState is called only when the state is changed