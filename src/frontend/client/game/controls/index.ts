import type { Player } from "../player-client"
import { setupControls } from "./controls"
import { updateVelocity } from "./movement"

let controlsState: ReturnType<typeof setupControls>["state"] | null = null;
let cleanupControls: ReturnType<typeof setupControls>["cleanup"] | null = null;
let controlledPlayer: Player | null = null;


export function initPlayerControls(player: Player) {
    

  const { state, cleanup } = setupControls(player, "singleplayer");
  controlsState = state;
  cleanupControls = cleanup;
  controlledPlayer = player;
}

export function updatePlayerControls() {
  if (controlsState && controlledPlayer) {
    updateVelocity(controlledPlayer, controlsState);
  }
}

export function cleanupPlayerControls() {
  if (cleanupControls) {
    cleanupControls(); // remove event listenerss and interval
    cleanupControls = null;
    controlsState = null;
    controlledPlayer = null;
  }
}