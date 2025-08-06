import { getCurrentState } from "../state/gameState";

function gameoverLoop() {
  // update and render menu...

  if (getCurrentState() === "gameover") {
    requestAnimationFrame(gameoverLoop);
  }
}