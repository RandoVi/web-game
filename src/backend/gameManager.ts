
import { initializeClientGameoverModal } from "./server";
import { players } from "./playerManager";
import type { LeaderboardEntry } from "./types";

export type GameState = "menu" | "playing" | "paused" | "gameover" | "restarting";

let currentState: GameState = "menu";


let matchDuration =60;      
let matchTimeLeft = 60;      
let lastUpdate = Date.now(); 

export function getCurrentState(): GameState {
  return currentState;
}

export function setCurrentState(state: GameState): void {
  if (state === currentState) return;

  if (state === "playing" && currentState === "paused") {
    // Resume: reset lastUpdate so time doesn't "jump"
    lastUpdate = Date.now();
  }

  if (state === "paused" && currentState === "playing") {
    // Pausing: freeze time, nothing special needed here
    lastUpdate = Date.now();
  }

  if (state === "restarting") {
    resetMatchTimer();
  }

  if (state === "playing") {
    lastUpdate = Date.now();
  }

  currentState = state;
}


export function resetMatchTimer(duration: number = 60) {
  matchDuration = duration;
  matchTimeLeft = duration;
  lastUpdate = Date.now();
}


export function updateMatchTimer() {
  if (currentState !== "playing") return;

  const now = Date.now();
  const deltaSec = (now - lastUpdate) / 1000;
  lastUpdate = now;

  matchTimeLeft = Math.max(0, matchTimeLeft - deltaSec);

  if (matchTimeLeft <= 0) {
    const Leaderboard = getLeaderboard();
    initializeClientGameoverModal(Leaderboard)
    currentState = "gameover"; 
    resetMatchTimer(60)
  }
}

export function getMatchTimeLeft() {
  return matchTimeLeft;
}

export function getMatchDuration() {
  return matchDuration;
}

export function getLeaderboard(): LeaderboardEntry[] {
  const ids = Object.keys(players);

  const leaderboard: LeaderboardEntry[] = ids
    .map(id => {
      const player = players[id];
      return {
        id: player.id,
        username: player.username,
        score: player.score,
        isOut: player.isOut,
        index: (player as any).index 
      };
    })
    .sort((a, b) => b.score - a.score);

  return leaderboard;
}

