import { getCurrentState } from "../state/gameState";

function pauseLoop() {
  // update and render menu...

  if (getCurrentState() === "paused") {
    requestAnimationFrame(pauseLoop);
  }
}