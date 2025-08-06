import type { Player } from "../player-client";
import { socket } from "../../../network/socket";
import { appState } from "../../../../utils/appState";
import { getGameMode } from "../mode/gameMode";
import { showPauseModal, hidePauseModal } from "../state/pauseModal";
import { getCurrentState, setCurrentState } from "../state/gameState";
import { resetSingleplayerLastUpdate } from "../state/singlePlayerManager";

const MAX_CHARGE = 500; /**Should remove this constant from client */ 

let activeCleanup: (() => void) | null = null;

export const controlStates: Record<string, ControlState> = {};
//------------------------------------------------------------------------------
export function emitControlState(playerId: string, state: ControlState) {
  if (!socket.connected) return;

  const now = Date.now();
  const chargeDuration = state.isBursting
  ? state.chargeDuration
  : state.isCharging
    ? Math.min(now - state.chargeStart, MAX_CHARGE)
    : 0;

  socket.emit("player-controls", {
    id: playerId,
    mouseX: state.mouseX,
    mouseY: state.mouseY,
    isCharging: state.isCharging,
    isBursting: state.isBursting,
    isMoving: state.isMoving,
    chargeDuration,
  });
}

export function startControlEmitter(playerId: string, state: ControlState, interval = 50) {
  return setInterval(() => emitControlState(playerId, state), interval);
}


//------------------------------------------------------------------------------
export function setupControls(player: Player, mode: "singleplayer" | "multiplayer") {
    if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }
  const state: ControlState = {
    mouseX: 0,
    mouseY: 0,
    isCharging: false,
    isBursting: false,
    chargeStart: 0,
    isMoving: false,
    burstApplied: false,
    chargeDuration: 0

  };

  controlStates[player.id] = state;
  const emitter = startControlEmitter(player.id, state);

  const onMouseMove = (e: MouseEvent) => {
    if (getCurrentState() !== "playing") return;

    const arena = document.getElementById("game-container");
    if (!arena) return;
    const rect = arena.getBoundingClientRect();
    state.mouseX = (e.clientX - rect.left) / rect.width;
    state.mouseY = (e.clientY - rect.top) / rect.height;
    state.mouseX = Math.max(0, Math.min(1, state.mouseX));
    state.mouseY = Math.max(0, Math.min(1, state.mouseY));
  };

  const onMouseDown = (e: MouseEvent) => {
    if (getCurrentState() !== "playing") return;
    if (e.button === 0) state.isMoving = true;
  };

  const onMouseUp = (e: MouseEvent) => {
    if (getCurrentState() !== "playing") return;
    if (e.button === 0) state.isMoving = false;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (getCurrentState() !== "playing") return;
    if (e.code === "Space" && !state.isCharging) {
      state.isCharging = true;
      state.chargeStart = Date.now();
      state.chargeDuration = 0;
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.code === "KeyP") {
      // const mode = getGameMode();

      if (mode === "singleplayer") {
        const newState = getCurrentState() === "paused" ? "playing" : "paused";
        setCurrentState(newState);

        if (newState === "paused") {
          showPauseModal();
        } else {
          hidePauseModal();
          resetSingleplayerLastUpdate();
        }
      } else if (mode === "multiplayer" && appState.currentRoom?.hostId === player.id) {
        socket.emit("game-master-control", { action: "pause", by: socket.id });
      }
    }

  if (e.code === "Space" && state.isCharging) {
      const duration = Math.min(Date.now() - state.chargeStart, MAX_CHARGE);

      state.isCharging = false;
      state.isBursting = true;
      state.chargeDuration = duration;

      setTimeout(() => {
        state.isBursting = false;
        state.burstApplied = false;
        state.chargeDuration = 0;
      }, 600);
    }
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mouseup", onMouseUp);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);


  const cleanup = () => {
    clearInterval(emitter);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mousedown", onMouseDown);
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    delete controlStates[player.id];
  };
  activeCleanup = cleanup;

  return { state, cleanup };
}


export type ControlState = {
  mouseX: number;
  mouseY: number;
  isCharging: boolean;
  isBursting: boolean;
  chargeStart: number;
  isMoving: boolean;
  burstApplied: boolean;
  chargeDuration: number;
};
