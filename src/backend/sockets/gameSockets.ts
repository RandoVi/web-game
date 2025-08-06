// import { Server, Socket } from "socket.io";
// import { addPlayer, players, handleInput, removePlayer, update } from "../playerManager";


// export default function gameSockets(io: Server) {
//     io.on("connection", (socket: Socket) => {
//         // Hook into start-game initialization
//         socket.on("start-game", ({ roomId, players }) => {
//             /**add players 1 by 1 */
//             players.forEach((p: any) => {
//                 const backendPlayer = addPlayer(p.id);
//                 backendPlayer.x = p.x;
//                 backendPlayer.y = p.y;
                
//             });

//             // Optionally: move everyone’s socket into the game loop namespace
//             // io.to(roomId).emit("game-begun", { players });
//         });

//         // ... your existing player-controls, disconnect, etc.
//     });

//     // Same update loop stays:
//     let lastTime = Date.now();
//     setInterval(() => {
//         const now = Date.now();
//         const delta = (now - lastTime) / 1000;
//         lastTime = now;

//         update(delta);
//         io.emit("state-update", Object.values(players));
//     }, 15);
// }