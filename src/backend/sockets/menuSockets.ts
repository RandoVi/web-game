import { Server, Socket } from "socket.io"
import type { RoomEntity } from "../types";
import { type PlayerNetData } from "../../utils/playerEntity";
import type { GameState } from "../../frontend/client/game/state/gameState";
import { isNameTaken } from "../../frontend/components/utils/isNameTaken";
import { broadcastSessionsList } from "../server";

export default function menuSockets(io: Server, gameRooms: Map<string, RoomEntity>, sessionCounter: { value: number }, socket: Socket) {
    

        socket.on("name-validation-and-join-request", (roomId: string, enteredName: string) => {
            enteredName = enteredName.trim();
            const currentRoom = gameRooms.get(roomId);
            let success:boolean;
            if (currentRoom) {
                if (!roomId || enteredName.length < 3 || enteredName.length > 20 || isNameTaken(currentRoom, enteredName) ) {
                    success = false;
                    socket.emit("name-validation-and-join-response", { success });
                } else {
                    success = true;
                    const currentRoom = gameRooms.get(roomId);
                    if (currentRoom?.players.length == 4 || !currentRoom) {
                        return;
                    }
                    const newPlayer: PlayerNetData = {
                        id: socket.id,
                        name: enteredName || "Player " + (currentRoom.players.length+1),
                        x: 0,
                        y: 0,
                        vx: 0,
                        vy: 0,
                        speed: 0,
                        defaultSpeed: 0,
                        size: 0,
                        score: 0,
                        isOut: false,
                        lastMouseX: 0,
                        lastMouseY: 0,
                    }
                    currentRoom?.players.push(newPlayer);
                    }

            socket.emit("name-validation-and-join-response", ({ success, enteredName, roomId }));
            if (success) {
                socket.join(roomId);
                console.log(`Socket ${socket.id} (player: ${enteredName}) joined room ${roomId}`);

                io.to(roomId).emit('room-update', currentRoom);

                const serializableGameRooms = Object.fromEntries(gameRooms);
                io.emit("sessions-list-update",(serializableGameRooms))
            }
            }
        })

        socket.on("create-room-request", (creatorId, playerName?) => {
            if (gameRooms.size >= 1) {
                return;
            }
            const hostPlayer = {
                id: creatorId,
                name: playerName || "Player " + 1,
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                speed: 0,
                defaultSpeed: 0,
                size: 0,
                score: 0,
                isOut: false,
                lastMouseX: 0,
                lastMouseY: 0,
                }
            const createdRoom = {id: "session" + sessionCounter.value, roomName: "Session " + sessionCounter.value, hostId: hostPlayer.id, players: [hostPlayer], status: "menu" as GameState, arena: "arenaDefault"}
            gameRooms.set(createdRoom.id, createdRoom);
            sessionCounter.value++;
            console.log(`Room created, rooms in backend: ${gameRooms.size}`);
            socket.join(createdRoom.id);
            const roomId = createdRoom.id;
            console.log(`Socket ${socket.id} (player: ${playerName}) joined room ${roomId}`);
            socket.emit("create-room-response", createdRoom);

            broadcastSessionsList();
        })

        socket.on("sessions-list-request", () => {
            broadcastSessionsList();
        })

        socket.on("current-room-data-request", (roomId:string) => {
            const currentRoom = gameRooms.get(roomId);
            if (currentRoom) {
                socket.emit("current-room-data-response", currentRoom);
            } else {
                console.log("Currentroom is undefined in server menuSockets @142")
            }
        });

        socket.on("room-delete-request", (roomId:string) => {
            gameRooms.delete(roomId);
            console.log(`Room deleted, rooms available: ${gameRooms.size}`);
            io.to(roomId).emit('room-delete-response', roomId);

            broadcastSessionsList();
        })

        socket.on("remove-player-request", ({ roomId, playerId, action })  => {
            console.log(`Remove player request received in room ${roomId}`)
            removePlayerFromRoom(roomId, playerId, action);
        })


    function removePlayerFromRoom (roomId: string, playerId: string, action: string) {
        const currentRoom = gameRooms.get(roomId)
        const removedPlayer = currentRoom?.players.find(player => player.id === playerId)
        if (currentRoom) {

            const removedPlayerSocket = io.sockets.sockets.get(playerId);
            if (removedPlayerSocket) {
                removedPlayerSocket.leave(roomId);
                removedPlayerSocket.emit('player-removed', action);
            }

            currentRoom.players = currentRoom.players.filter(player => player.id !== playerId);
            if (action === 'kick') {
                console.log(`Socket ${playerId} (player: ${removedPlayer?.name}) has been kicked from the room ${roomId}`);
            } else {
                console.log(`Socket ${playerId} (player: ${removedPlayer?.name}) has left the room ${roomId}`);
            }

            if (action === 'disband') {
                console.log(`Room ${roomId} was disbanded`)
            }

            
            if (currentRoom.players.length === 0) {
                gameRooms.delete(roomId);
                console.log(`Room ${roomId} deleted (empty).`);

                broadcastSessionsList();
                return;
            }
            /**If room is not empty, Update room*/
            io.to(roomId).emit('room-update', currentRoom);

            broadcastSessionsList();
        } else {
            console.log("Couldn't find a room to remove a player from (menuSockets)")
        }
        
    }
}
