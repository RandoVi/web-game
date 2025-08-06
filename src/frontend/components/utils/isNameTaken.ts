import type { RoomEntity } from "../../../utils/roomEntity";

export function isNameTaken(currentRoom: RoomEntity, newName: string): boolean {
  const existingNames = new Set<string>();

  for (const player of currentRoom.players) {
      existingNames.add(player.name);
  }

  return existingNames.has(newName);
}