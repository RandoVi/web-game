import type { GameState } from "../frontend/client/game/state/gameState";
import type { PlayerNetData } from "../utils/playerEntity";

export interface RoomEntity {
  id: string;
  roomName: string;
  hostId: string;
  players: PlayerNetData[];
  status: GameState;
  arena: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  isOut: boolean;
  index: number;
}
