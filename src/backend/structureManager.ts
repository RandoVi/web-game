import { StructureEntity } from "../utils/structureEntity";
import type { StructureOptions } from "../utils/structureEntity";
import { getCurrentState } from "./gameManager";
import { players } from "./playerManager";

export const structures : Record<string, StructureEntity> = {}

// const centerRectanglePosition = {x: 0.5, y: 0.5}

/**Add individual structure */
export function addStructure(id: string, options: Omit<StructureOptions, "id">) {
  const structure = new StructureEntity({ id, ...options });
  structures[id] = structure;
  return structure;
}

/**Destrpy structure by id */
export function destroyStructures(id: string) {
    if (structures[id]) {
        delete structures[id];
    }
}

/**Update structures accordingly to the updated values */
export function updateStructures(delta: number){
  if(getCurrentState() === 'playing'){
    const safeDelta = Math.min(delta, 0.05); /**Delta us capped to 50ms per update to prevent moving structure jumps on unpause */
    for (const structure of Object.values(structures)) {
        structure.update(safeDelta);
    }
  }
}
/**Check if player is colliding with one or even multiple structures
 * If collision is found, it keeps checking if there are any other collisions.
 */
export function getPlayerStructureCollision(playerId: string): { nx: number; ny: number; penetration: number } | null {
  const player = players[playerId];
  if (!player) return null;
  /**Accumulators for combined collision normal vector, max penetration among all collisions
   * and collision check flag.
  */
  let totalNx = 0;
  let totalNy = 0;
  let maxPenetration = 0;
  let collisionFound = false;
  /**Loop through all structures, checking collisions between structures and player */
  for (const structure of Object.values(structures)) {
    const normalData = structure.getCollisionNormal({
      x: player.x,
      y: player.y,
      size: player.size
    });
    /**If a collision occurs, colllision normal is added to the total accumulators
     * Max pen is found, and a check if at least one collison is found.
      */
    if (normalData) {
      totalNx += normalData.nx;
      totalNy += normalData.ny;

      if (normalData.penetration > maxPenetration) {
        maxPenetration = normalData.penetration;
      }
      collisionFound = true;
    }
  }

  if (!collisionFound) return null;

  /**Normalize the combined normal vecktor so it has a unit length, and 
   * return it, along with maximum penettration.
   */
  const length = Math.sqrt(totalNx * totalNx + totalNy * totalNy);
  if (length === 0) return null;

  return {
    nx: totalNx / length,
    ny: totalNy / length,
    penetration: maxPenetration 
  };
}

export function resetStructures() {
  Object.keys(structures).forEach((id) => delete structures[id]);
}

export function getStructuresNetData() {
    return Object.values(structures).map((structure) => ({
            id: structure.id,
            type: structure.type,
            x: structure.x,
            y: structure.y,
            angle: structure.angle,
            rotationSpeed: structure.rotationSpeed,
            radius: structure.radius,
            width: structure.width,
            height: structure.height,
            orbitRadius: structure.orbitRadius,
            isActive: structure.isActive,
    }));
}