import { PlayerEntity } from "../utils/playerEntity";
import { getPlayerStructureCollision } from "./structureManager";
import { getMatchTimeLeft, getMatchDuration, updateMatchTimer, getCurrentState, setCurrentState, getLeaderboard } from "./gameManager"; 
import { initializeClientGameoverModal, updateLeaderboard } from "./server";

export const players: Record<string, PlayerEntity> = {};
export let lastManStanding = false;

const positions = [
  { x: 0.50, y: 0.25 }, 
  { x: 0.75, y: 0.50 },
  { x: 0.50, y: 0.75 },
  { x: 0.25, y: 0.50 },
];

export function addPlayer(id: string, username: string) {
    if (players[id]) {
        console.warn(`Player ${id} already exists`);
        return players[id];
    }

    const usedPositions = Object.values(players).map(player => ({ x: player.x, y: player.y }));
    let position = positions.find(pos =>
        !usedPositions.some(up => up.x === pos.x && up.y === pos.y)
    );
    if (!position) {
        position = positions[0];
        console.warn("All starting positions are taken, assigning default position.");
    }
    const index = positions.findIndex(pos => pos.x === position.x && pos.y === position.y);

    const player = new PlayerEntity(id, username, position.x, position.y);
    (player as any).index = index; 
    players[id] = player;

    console.log(`Player ${id} added at position (${position.x}, ${position.y}) with index ${index}`);
    return player;
}

export function removePlayer(id: string) {
  const player = players[id];
  if (!player) {
    console.warn(`Tried to remove non-existent player ${id}`);
    return;
  }

  delete players[id];
  console.log(`Player: ${player.username}  (${id}) removed from game`);
}

export function handleInput(id: string, input: any) {
  if (getCurrentState() !== "playing") return;
  const player = players[id];
  if (!player) return;
  if(!player.isOut){
    // Track mouse
    player.lastMouseX = input.mouseX;
    player.lastMouseY = input.mouseY;

    // Compute angle to mouse
    const dx = input.mouseX - player.x;
    const dy = input.mouseY - player.y;
    const angle = Math.atan2(dy, dx);

    // update rotation
    if(!player.hasBurstApplied) {
      player.setRotation(angle);
    }
  

    /**Mouse movement sets desired velocity, since it's desired, player will be affected buy burst hits directed
     * towards them.
     */
    if (input.isMoving && !input.isCharging && !player.hasBurstApplied) {
      player.inputVX = Math.cos(angle) * player.speed;
      player.inputVY = Math.sin(angle) * player.speed;
    } else {
      player.inputVX = 0;
      player.inputVY = 0;
    }

    if (input.isBursting) {
      if (!player.hasBurstApplied) {
        player.hasBurstApplied = true;
        player.isCharging = false;

        const chargeDuration = input.chargeDuration;
        player.startBurst(angle, chargeDuration);
        setTimeout(() => {
          player.hasBurstApplied = false;
        }, 700);
      }
    } else if (input.isCharging) {
      if (!player.isCharging) {
        player.isCharging = true;
      }
    } else {
      player.isCharging = false;
    }
  }

}

export function resetPlayers() {
  Object.keys(players).forEach((id) => delete players[id]);
}

export function update(delta: number) {
  if(getCurrentState() === 'playing' || getCurrentState() === 'gameover'){
    updateMatchTimer();
    const ids = Object.keys(players);

    // 1. Update each player's position
    for (const id of ids) {
        players[id].updatePosition(delta);
    }

    // 2. Resolve collisions between all pairs
    for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
            players[ids[i]].resolveCollisionWith(players[ids[j]]);
        }
    }

    // 3. Resolve collisions with structures
    for (const id of ids) {
        const player = players[id];

        /**Iteratively resolve collisions to handle multiple overlaps
        */
        const iterations = 3; /**ensures player moves out of multiple overlapping structures */
        for (let iter = 0; iter < iterations; iter++) {
            const normalData = getPlayerStructureCollision(id);

            if (normalData && normalData.penetration > 0) {
                const { nx, ny, penetration } = normalData;

                /**Push player outside of stucture, otherwise player is stuck in moving
                 * structure until both move opposite directions
                 */
                player.x += nx * penetration;
                player.y += ny * penetration;

                /**Reflect velocity only if moving into the structure */
                const dot = player.vx * nx + player.vy * ny;
                if (dot < 0) {
                    player.vx -= 2 * dot * nx;
                    player.vy -= 2 * dot * ny;
                }
            } else {
                /**no collision */
                break;
            }
        }
    }
      /**4. Elimination check and scoring based on match timer */
      for (const id of ids) {
        const player = players[id];
        
        if (player.isOut && !player.scoredOut) {
          player.scoredOut = true; 

          const attacker = players[player.lastTouchedBy];
          if (attacker) {
            const matchTimeLeft = getMatchTimeLeft(); 
            const matchDuration = getMatchDuration(); 

            const maxPoints = 100;
            const minPoints = 20;

            const ratio = matchTimeLeft / matchDuration;
            const scoreAward = Math.floor(minPoints + ratio * (maxPoints - minPoints));

            attacker.score += scoreAward;
            console.log(attacker.score)
            console.log(`${attacker.username} gains ${scoreAward} points for eliminating ${player.username}`);
            updateLeaderboard()
          }
        }
      }
      /**Endgame conditions and checks */
      const alivePlayers = ids.filter(id => !players[id].isOut);
      lastManStanding = alivePlayers.length === 1; 
      if (lastManStanding) {

        alivePlayers.forEach(id => {
          players[id].score += 100;
          console.log(`${players[id].username} survives and earns 100 points!`);
        });
        /** Added timeout to make sure that when player isOut happens, sound is played
         *  (needs some testing still) */
        setTimeout(() => {
        const leaderboard = getLeaderboard();
        initializeClientGameoverModal(leaderboard);
        setCurrentState('gameover')
        }, 1);
      }


  }
}
