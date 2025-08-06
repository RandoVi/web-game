import { setCurrentState } from "./state/gameState";
import { startGameLoop } from "./loop/gameLoop";
import { playSong, stopSong } from "./utils/sound";
import { socket } from "../../network/socket";
import { Player } from "./player-client";
import { Structure } from "./structure-client";
import { setupControls } from "./controls/controls";
import { getGameMode } from "./mode/gameMode"; 
import { startSingleplayerGame } from "./singleplayer.ts"
import { getSingleplayerDifficulty } from "./mode/difficulty";
import { getOpponentCount } from "../../client/game/mode/opponents";



export let frontendPlayers: Record<string, Player> = {};
export let frontendStructures: Record<string, Structure> = {};

let arena: HTMLDivElement;


export async function startGame(roomId?: string) {
  arena = document.getElementById("game-container") as HTMLDivElement;
  if (!arena) throw new Error("Arena not found in DOM");

  if (getGameMode() === "singleplayer") {
    const difficulty = getSingleplayerDifficulty();
    const opponents = getOpponentCount();

    // Load the speed settings saved earlier in the lobby
    const raw = sessionStorage.getItem("aiSpeedSettings");
    const speedSettings: string[] = raw ? JSON.parse(raw) : [];

    await startSingleplayerGame(difficulty, opponents, speedSettings); // now three args
    return;
  }

  await initMultiplayerListeners();   //  make sure listeners are in place
  socket.emit("ready-for-player-data", roomId);
  setCurrentState("playing");
  startGameLoop();
  playSong("/src/assets/sounds/taiko-percussion-loop-preparation-for-action-355034.mp3", { loop: true, volume: 1 });
}


let multiplayerInitialized = false;
let controlCleanups: (() => void)[] = [];

export async function initMultiplayerListeners() {
  if (multiplayerInitialized) return;
  multiplayerInitialized = true;

  // Register listeners immediately (before start-game)
  socket.on("current-player", (data) => {
    
    const player = new Player(data.id, data.username, data.x, data.y, arena, data.index);
    player.setPosition(data.x, data.y);
    frontendPlayers[player.id] = player;

    // const cleanupControls = setupControls(player);
    // controlCleanups.push(cleanupControls);
    const { state, cleanup } = setupControls(player, "multiplayer");
    controlCleanups.push(cleanup);

  });

  socket.on("existing-players", (players) => {
    players.forEach((player: any) => {
      if (frontendPlayers[player.id]) return;
      
      const other = new Player(player.id, player.username, player.x, player.y, arena, player.index);
      other.setPosition(player.x, player.y);
      frontendPlayers[other.id] = other;
    });
  });

  socket.on("player-joined", (player) => {
    if (frontendPlayers[player.id]) return;

    const other = new Player(player.id, player.username, player.x, player.y, arena, player.index);
    other.setPosition(player.x, player.y);
    frontendPlayers[other.id] = other;
  });

  socket.on("player-left", ({ id }) => {
    const player = frontendPlayers[id];
    if (player) {
      player.destroy();
      delete frontendPlayers[id];
    }
  });

  


  socket.on("state-update", (state) => {
  if (!arena) {
    return
  }
  const serverPlayers = state.players;
  const serverStructures = state.structures;
  // --- players ---
  for (const serverPlayer of serverPlayers) {
    let player = frontendPlayers[serverPlayer.id];

    if (!player) {
      player = new Player(serverPlayer.id, serverPlayer.username, serverPlayer.x, serverPlayer.y, arena, serverPlayer.index);
      frontendPlayers[serverPlayer.id] = player;
    //   if (serverPlayer.id !== socket.id) {
    //     //initialize controls only for local player
    //   }
    }


    //Sync all players
    player.syncFromServer(serverPlayer);
  }

  // --- structures ---
  for (const serverStructure of serverStructures) {
    
    let structure = frontendStructures[serverStructure.id];
    if (!structure) {
      structure = new Structure(
        serverStructure.id,
        serverStructure.type,
        serverStructure.x,
        serverStructure.y,
        serverStructure.width,
        serverStructure.height,
        serverStructure.angle,
        arena
      );
      frontendStructures[serverStructure.id] = structure;
    }

    structure.syncFromServer(serverStructure);
  }
});
}




export function cleanupGame() {
  Object.values(frontendPlayers).forEach((player) => player.destroy?.());
  Object.values(frontendStructures).forEach((structure) => structure.destroy?.());
  frontendPlayers = {};
  frontendStructures = {};

  controlCleanups.forEach((fn) => fn());
  controlCleanups = [];

  // Remove all socket listeners
  socket.off("current-player");
  socket.off("existing-players");
  socket.off("player-joined");
  socket.off("player-left");
  socket.off("state-update");

  
  // Reset arena + flag + song
  stopSong()
  arena = undefined as any;
  multiplayerInitialized = false;
}