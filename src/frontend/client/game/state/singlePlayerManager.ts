import { getCurrentState, setCurrentState } from "./gameState";
import { getSingleplayerLeaderboard, renderScoreboard } from "./singleplayerLeaderboard.ts";
import { renderWinScreen } from "../../../components/listeners/globalListeners";
import { frontendPlayers, frontendStructures } from "../game";
import { socket } from "../../../network/socket.ts";
import { cancelAnimationLoop } from "../loop/gameLoop.ts";
import { clearAILevelTargets } from "../ai/aiLevel2.ts";


let matchDuration = 60;
let matchTimeLeft = 60;
let lastUpdate = Date.now();


export function resetSingleplayerTimer(duration: number = 60) {
  matchDuration = duration;
  matchTimeLeft = duration;
  lastUpdate = Date.now();
}

export function updateSingleplayerTimer() {
  const now = Date.now();

  if (getCurrentState() !== "playing") return;

  const delta = (now - lastUpdate) / 1000;
  lastUpdate = now;

  matchTimeLeft = Math.max(0, matchTimeLeft - delta);

  const leaderboard = getSingleplayerLeaderboard();
  renderScoreboard(leaderboard);

  if (matchTimeLeft <= 0) {
    setCurrentState("gameover");
    renderSingleplayerWinScreen();
  }
}

export function resetSingleplayerLastUpdate() {
  lastUpdate = Date.now();
}

export function getSingleplayerTimeLeft(): number {
  return matchTimeLeft;
}

export function renderSingleplayerWinScreen() {
  const leaderboard = getSingleplayerLeaderboard();

  // Find human player (their ID is "human" in your setup)
  // const humanId = "human";

  (window as any).socket = { id: "human" };

  const coloursArray = ["red", "blue", "green", "yellow"];

  const timerText = document.getElementById('timer-text');
  if (timerText) {
    timerText.textContent = "00:00";
  }

  // renderWinScreen(leaderboard, coloursArray, humanId);
  renderWinScreen(leaderboard, coloursArray, "human", "human");
}

export function cleanupSingleplayerGame() {
  clearAILevelTargets();
  cancelAnimationLoop(); 
  for (const id in frontendPlayers) {
    const player = frontendPlayers[id];
    if (player?.element?.remove) {
      player.element.remove();
    }
    delete frontendPlayers[id];
  }
}



let lastManStandingHandled = false;

export function updateSingleplayerGameLogic(delta: number) {
  if (getCurrentState() !== "playing") return;
  lastManStandingHandled = false;


  const ids = Object.keys(frontendPlayers);

  // 1. Update player positions
  for (const id of ids) {
    frontendPlayers[id].updatePosition(delta);
  }

  // 2. Collisions
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      frontendPlayers[ids[i]].resolveCollisionWith(frontendPlayers[ids[j]]);
    }
  }

  // 3. Scoring on elimination
  for (const id of ids) {
    const player = frontendPlayers[id];
    if (player.isOut && !player.scoredOut) {
      player.scoredOut = true;

      const attacker = frontendPlayers[player.lastTouchedBy];
      if (attacker) {
        const ratio = getSingleplayerTimeLeft() / matchDuration;
        const scoreAward = Math.floor(20 + ratio * (100 - 20));
        attacker.score += scoreAward;

      }
    }
  }

  // 4. Endgame check
  const alive = ids.filter(id => !frontendPlayers[id].isOut);

  if (alive.length === 1 && !lastManStandingHandled) {
    lastManStandingHandled = true;

    const survivor = frontendPlayers[alive[0]];
    survivor.score += 100;


    setTimeout(() => {
      setCurrentState("gameover");
      // const leaderboard = getSingleplayerLeaderboard();
      renderSingleplayerWinScreen(); // Show winn screen
    }, 100);
  }
}
