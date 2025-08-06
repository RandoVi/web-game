import { io, Socket } from "socket.io-client";

const URL = "http://localhost:3000";
// BACKEND SERVER URL
export const socket: Socket = io(URL, {
  autoConnect: false, 
  transports: ["websocket"], 
});


export function connectSocket() {
  if (!socket.connected) socket.connect()
}


export function disconnectSocket() {
  if (socket.connected) socket.disconnect()
}