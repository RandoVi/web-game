// Mouse directional movement logic and rotation applied

import type { Player } from "../player-client";
import type { ControlState } from "./controls";

export function updateVelocity(player: Player, controls: ControlState) {
  const arena = document.getElementById("game-container");
  if (!arena) return;

  const rect = arena.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  // Convert both player + mouse into pixel coords for angle calc
  const playerX = player.x * rect.width;
  const playerY = player.y * rect.height;
  const mouseX = controls.mouseX * rect.width;
  const mouseY = controls.mouseY * rect.height;
  // Compute angle toward mouse
  const angle = Math.atan2(mouseY - playerY, mouseX - playerX);
  player.setRotation(angle);

  // Character no move while space is pressed down: 
  if (controls.isCharging) {
    // player.stopMovement(); 
    player.inputVX = 0;
    player.inputVY = 0;
    return;
  }

if (controls.isBursting) {
  if (!controls.burstApplied) {
    const chargeDuration = Date.now() - controls.chargeStart;
    player.startBurst(angle, chargeDuration);
    controls.burstApplied = true;
  }
}
  else if (controls.isMoving) {
    const vx = Math.cos(angle) * player.speed;
    const vy = Math.sin(angle) * player.speed;
    // player.setVelocity(vx, vy);
    player.inputVX = vx;
    player.inputVY = vy;
  } 
  else if (!controls.isCharging && !controls.isBursting) {
    // player.stopMovement();
    player.inputVX = 0;
    player.inputVY = 0;
  } 
}