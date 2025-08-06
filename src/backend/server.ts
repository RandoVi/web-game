// server.ts (single session only)

import { Server } from "socket.io";
import { createServer } from "http";
import { players, addPlayer, handleInput, removePlayer, update, resetPlayers } from "./playerManager";
import { getStructuresNetData, resetStructures, updateStructures } from "./structureManager";
import { loadArena } from "./arenaStorage.ts/arenaLoader";
import { getCurrentState, getLeaderboard, getMatchTimeLeft, resetMatchTimer, setCurrentState, updateMatchTimer } from "./gameManager";
import menuSockets from "./sockets/menuSockets";
import type { LeaderboardEntry, RoomEntity } from "./types";


/////////////////////////////////////////////////////////////////////////////////////
let sessionCounter = { value: 1 };

export const gameRooms: Map<string, RoomEntity> = new Map();
let activeRoomId: string | null = null; // only one session

export function broadcastSessionsList() {
    const serializableGameRooms = Object.fromEntries(gameRooms);

    io.emit("sessions-list-update", serializableGameRooms);
    io.emit("menu-sessions-count-update", gameRooms.size);
}

/////////////////////////////////////////////////////////////////////////////////////
// SERVER CREATION
const PORT = 3000;
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});
export let playerCounter: number = 0;
const playerReadiness: Record<string, boolean> = {};
io.on("connection", (socket) => {

  playerCounter++;
  const playerDefault: string = "Player " + playerCounter;
  socket.emit("player-connected", playerDefault )
/////////////////////////////////////////////////////////////////////////////////////
// LOBBY SOCKETS
menuSockets(io, gameRooms, sessionCounter, socket);

/////////////////////////////////////////////////////////////////////////////////////
// GAME SOCKETS

  console.log("Connected:", socket.id);

  // Wait until "start-game-request" marks a room as active
  socket.on("start-game-request", ( roomId ) => {
    
    const currentRoom = gameRooms.get(roomId);
    if (!currentRoom) return;
    // console.log("Current-room", currentRoom)

    if (socket.id !== currentRoom.hostId) {
        socket.emit("error", "Only host can start the game");
        return;
    }

    if (currentRoom.players.length < 2 || currentRoom.players.length > 4) {
      console.log("Starting failed - invalid player count (less than 2 or more than 4")
      return
    }
    activeRoomId = null
    if (activeRoomId) {
      console.log("A game is already running.", activeRoomId);
      return;
    }
    const room = gameRooms.get(roomId);
    if (!room) return;

    activeRoomId = roomId;

    resetPlayers();
    resetStructures();
    resetMatchTimer(60)
    lastTime = Date.now();
    
    
    loadArena(room.arena);
    setCurrentState("playing");
    room.status = "playing";
    

    io.to(roomId).emit("start-game", roomId);

  // mark all players as not ready yet
  room.players.forEach((p) => {
    playerReadiness[p.id] = false;
  });
});

// Each client will send this when their listeners/UI are ready
socket.on("ready-for-player-data", (roomId) => {
  const room = gameRooms.get(roomId);
  if (!room) return;

  playerReadiness[socket.id] = true;

  // Check if everyone in the room is ready
  const allReady = room.players.every((p) => playerReadiness[p.id]);
  console.log(allReady)
  if (allReady) {
    console.log(allReady)
    room.players.forEach((player, idx) => {
      if (!players[player.id]) addPlayer(player.id, player.name);
      const p = players[player.id];
      io.to(player.id).emit("current-player", { ...p, index: idx });
    });
    startServerTimer();
  }
});

  // Gameplay input only if inside active room
  socket.on("player-controls", (data) => {
    if (activeRoomId && players[socket.id]) {
      handleInput(socket.id, data);
    }
  });

  socket.on("game-master-control", ({ action }) => {
    if (!activeRoomId) return;
    console.log(gameRooms.get(activeRoomId)?.status)
    switch (action) {
    case "pause":
      console.log("Host has paused the game")
      if (getCurrentState() !== "gameover" && getCurrentState() !== "menu") {
        setCurrentState(getCurrentState() === "playing" ? "paused" : "playing");
        initializeClientPauseModal();
      }
    break;

    case "unpause":
      console.log("Host has resumed the game")
      if (getCurrentState() !== "gameover" && getCurrentState() !== "menu") {
        // Server timer continuation here somewhere
        setCurrentState(getCurrentState() === "playing" ? "paused" : "playing");
        initializeClientPauseModal();
      }
    break
    }
  });

  socket.on('arena-chosen', ({ newArena, roomId}) => {
    const room = gameRooms.get(roomId);
    if (!room) return;
    console.log("Arena change received: " + newArena)
    room.arena = newArena;
    console.log("Emitting new room for arena highlight")
    io.to(roomId).emit('arena-confirmed', room)
  })

socket.on("restart-game-request", (roomId) => {
  console.log('restarting game')
  const room = gameRooms.get(roomId);
  if (!room) return;
  
  if (socket.id !== room.hostId) {
    socket.emit("error", "Only host can restart the game");
    return;
  }

  // if (getCurrentState() !== "gameover") {
  //   socket.emit("error", "Game is not in a restartable state");
  //   return;
  // }
  room.status = "menu";
  broadcastSessionsList();
  io.to(roomId).emit("restart-game", roomId);
});

  socket.on("disconnect", () => {
    if (players[socket.id]) {
      console.log(`Player: ${players[socket.id].username} (id: ${socket.id}) has been disconnected`)
      removePlayer(socket.id);
      socket.broadcast.emit("player-left", { id: socket.id });
    }
        gameRooms.forEach((room, roomId) => {
        const exists = room.players.find(player => player.id === socket.id);
        if (exists) {

            room.players = room.players.filter(player => player.id !== socket.id);

            if (room.players.length === 0) {
                gameRooms.delete(roomId);
                console.log(`Room ${roomId} deleted (empty).`);
            } else {
                io.to(roomId).emit("room-update", room);
            }
            broadcastSessionsList();
        }
    });
  });
});

/////////////////////////////////////////////////////////////////////////////////////
// GAME LOOP
let lastTime = Date.now();
setInterval(() => {
  if (!activeRoomId || getCurrentState() !== "playing") return;

  const now = Date.now();
  const delta = (now - lastTime) / 1000;
  lastTime = now;

  update(delta);
  updateStructures(delta);
  updateMatchTimer()

  io.to(activeRoomId).emit("state-update", {
    players: Object.values(players),
    structures: getStructuresNetData(),
  });
}, 15);

/////////////////////////////////////////// Scoreboard updates
export function updateLeaderboard() {
  if (!activeRoomId || getCurrentState() !== "playing") return;
  const currentLeaderboard = getLeaderboard();
  io.to(activeRoomId).emit("leaderboard-from-server", currentLeaderboard);
}


function startServerTimer() {
  const initialLeaderboard = getLeaderboard();
  const gameDurationInSeconds = 60;
  const gameEndTime = Date.now() + gameDurationInSeconds * 1000;
  if (activeRoomId) {
    io.to(activeRoomId).emit("leaderboard-from-server", initialLeaderboard);
    io.to(activeRoomId).emit("timer-from-server", gameEndTime);
  }
}
/////////////////////////////////////////////////////////////////////////////////////
export function initializeClientPauseModal() {
  if (!activeRoomId) return;{
    const currentTimeLeft = getMatchTimeLeft();
    io.to(activeRoomId).emit("pause", { timeLeft: currentTimeLeft });
  }
}

export function initializeClientGameoverModal(leaderboardData: LeaderboardEntry[]) {
  if (!activeRoomId) return;

  const finishedRoomId = activeRoomId;

  io.to(finishedRoomId).emit("gameover", leaderboardData);

  
  const room = gameRooms.get(finishedRoomId);
  if (room) {
      room.status = "gameover";
  }
  
  activeRoomId = null;
  resetPlayers()
  resetStructures()
  resetMatchTimer(60);
  setCurrentState("gameover");
  broadcastSessionsList();

  // const room = gameRooms.get(finishedRoomId);
  // if (room) {
  //   gameRooms.delete(finishedRoomId);
  //   console.log(`Room ${finishedRoomId} deleted after game over.`);
    

  //   io.emit("sessions-list-update", Object.fromEntries(gameRooms));
  // }
}
// START SERVER
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});
