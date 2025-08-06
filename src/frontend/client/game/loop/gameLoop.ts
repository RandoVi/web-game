import { getCurrentState } from "../state/gameState";
import { updateSingleplayerTimer, getSingleplayerTimeLeft, updateSingleplayerGameLogic } from "../state/singlePlayerManager.ts";
import { frontendPlayers } from "../game";
import { getGameMode } from "../mode/gameMode";
import { updatePlayerControls } from "../controls";
import { updateAIPlayer } from "../ai/index";


let animationFrameID: number;
let lastTimeStamp = performance.now();
let resizeBound = false;
let fps = 0;
function gameLoop(timestamp: number) {
    const state = getCurrentState();

    // Always update timer UI even when paused
    if (getGameMode() === "singleplayer") {
        const timerText = document.getElementById("timer-text");
        if (timerText) {
            const timeLeft = Math.ceil(getSingleplayerTimeLeft());
            timerText.textContent = `${timeLeft}`;
        }
    }

    // If not playing, skip rest but continue looping
    if (state !== "playing") {
        requestAnimationFrame(gameLoop);
        return;
    }

    const delta = (timestamp - lastTimeStamp) / 1000;
    lastTimeStamp = timestamp;
    fps = 1 / delta;

    updatePlayerControls();

    // Singleplayer logic
    if (getGameMode() === "singleplayer") {
        for (const id in frontendPlayers) {
            const player = frontendPlayers[id];
            if (id.startsWith("ai")) {
                updateAIPlayer(player, delta);
            }
        }

        updateSingleplayerGameLogic(delta);
        updateSingleplayerTimer(); // Only ticks while playing
        console.log(`[GameLoop] Active player IDs:`, Object.keys(frontendPlayers));
    }

    requestAnimationFrame(gameLoop);

    if (!resizeBound) {
        resizeBound = true;
        window.addEventListener("resize", () => {
            Object.values(frontendPlayers).forEach(p => p.onResize());
        });
    }
}


window.addEventListener("resize", () => {
    Object.values(frontendPlayers).forEach(p => p.onResize());
});

export function startGameLoop() {
  animationFrameID = requestAnimationFrame(gameLoop);
}

export function cancelAnimationLoop() {
  if (animationFrameID) {
    cancelAnimationFrame(animationFrameID);
  }
}