import type { Player } from "../player-client";
import { getSingleplayerDifficulty } from "../mode/difficulty";
import { runAI_Level1 } from "./aiLevel1";
import { runAI_Level2 } from "./aiLevel2";
import { runAI_Level3 } from "./aiLevel3";

export function updateAIPlayer(ai: Player, delta: number) {
  const level = getSingleplayerDifficulty();

  switch (level) {
    case 1: return runAI_Level1(ai, delta);
    case 2: return runAI_Level2(ai, delta);
    case 3: return runAI_Level3(ai, delta);
    default: return runAI_Level1(ai, delta); 
  }
}
