import { Player } from "../player-client";
import { frontendPlayers } from "../game";

interface AIState {
  targetId: string;
  timer: number;
  nextTargetIn: number;

  isCharging: boolean;
  chargeTime: number;
  timeUntilNextBurst: number;
}

const aiStates: Record<string, AIState> = {};

function pickTarget(ai: Player): string | null {
  const candidates = Object.values(frontendPlayers)
    .filter(p => p.id !== ai.id && !p.isOut);

  if (candidates.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex].id;
}

function getRandomInterval(): number {
  return 3 + Math.random() * 5; 
}

function getRandomBurstDelay(): number {
  return 5 + Math.random() * 5; 
}

export function runAI_Level2(ai: Player, delta: number) {
  if (!ai.isReady || ai.isOut) return;

  if (!aiStates[ai.id]) {
    const targetId = pickTarget(ai);
    if (!targetId) return;
    aiStates[ai.id] = {
      targetId,
      timer: 0,
      nextTargetIn: getRandomInterval(),
      isCharging: false,
      chargeTime: 0,
      timeUntilNextBurst: getRandomBurstDelay()
    };
  }

  const state = aiStates[ai.id];

  state.timer += delta;
  if (state.timer >= state.nextTargetIn) {
    const newTargetId = pickTarget(ai);
    if (newTargetId) {
      state.targetId = newTargetId;
    }
    state.timer = 0;
    state.nextTargetIn = getRandomInterval();
  }

  let target = frontendPlayers[state.targetId];
  if (!target || target.isOut) {
      const newTargetId = pickTarget(ai);
      if (!newTargetId) return;
      state.targetId = newTargetId;
      state.timer = 0;
      state.nextTargetIn = getRandomInterval();
      target = frontendPlayers[newTargetId];

    if (!target || target.isOut) return;
  }

  const dx = target.x - ai.x;
  const dy = target.y - ai.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance < 0.001) return;

  const directionX = dx / distance;
  const directionY = dy / distance;

  const angle = Math.atan2(dy, dx);
  ai.setRotation(angle);

  if (state.isCharging) {
    state.chargeTime += delta;
    if (state.chargeTime >= 0.8) {
      ai.vx = directionX * 2.0; 
      ai.vy = directionY * 2.0;
      ai.burstTimer = 0.5;

      state.isCharging = false;
      state.chargeTime = 0;
      state.timeUntilNextBurst = getRandomBurstDelay();

    }
  } else {
    state.timeUntilNextBurst -= delta;

    if (state.timeUntilNextBurst <= 0) {
      state.isCharging = true;
      state.chargeTime = 0;
    } else {
      const controlMultiplier = 1.4;
      ai.inputVX = directionX * ai.speed * controlMultiplier;
      ai.inputVY = directionY * ai.speed * controlMultiplier;
    }
  }
}

export function clearAILevelTargets() {
  for (const key in aiStates) {
    delete aiStates[key];
  }
}