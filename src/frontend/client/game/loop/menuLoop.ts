import { getCurrentState } from "../state/gameState";

function menuLoop() {
  // update and render menu...

  if (getCurrentState() === "menu") {
    requestAnimationFrame(menuLoop);
  }
}