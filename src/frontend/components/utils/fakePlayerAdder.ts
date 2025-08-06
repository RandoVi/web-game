
import { io } from 'socket.io-client';

export function addFakePlayerToRoom(roomId: string, playerName: string) {
    
    // Create a new, temporary socket connection for the fake player:::
    const fakePlayerSocket = io('http://localhost:3000', {});

    fakePlayerSocket.on('connect', () => {
        fakePlayerSocket.emit("name-validation-and-join-request", roomId, playerName);
    });
    
    fakePlayerSocket.on('connect_error', (err) => {
        console.error(`[Mock Client] Failed to connect for "${playerName}":`, err.message);
    });
}