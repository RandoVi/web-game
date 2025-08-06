import type { PlayerNetData } from "./playerEntity";
import type { RoomEntity } from "../backend/types";

export interface GlobalState {
    currentUsername: string,
    currentPage: string;
    currentRoom: RoomEntity | null,
    gameRooms:  Map<string, RoomEntity>,
    players: PlayerNetData[],
    validRoomsCount: number,
    soundVolume: number,
};

// Gamerooms should be a DTO from backend
export const appState: GlobalState = {
    currentUsername: '',
    currentPage: "front-page",
    currentRoom: null,
    gameRooms: new Map(),
    players: [],
    validRoomsCount: 0,
    soundVolume: 0.50,
};