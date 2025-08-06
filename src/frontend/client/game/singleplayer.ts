import { Player } from "./player-client";
import { Structure } from "./structure-client";
import { startGameLoop } from "./loop/gameLoop";
import { initPlayerControls } from "./controls/index";
import { setCurrentState } from "./state/gameState";
import { resetSingleplayerTimer } from "./state/singlePlayerManager.ts";
import { playSong } from "./utils/sound";
import { frontendPlayers, frontendStructures } from "./game";
import { getSingleplayerDifficulty } from "./mode/difficulty";

function getSpeedFromLabel(label: string): number {
    switch (label.toLowerCase()) {
        case "slow": return 0.20;
        case "normal": return 0.35;
        case "fast": return 0.45;
        case "very fast": return 0.6;
        default: return 0.35;
    }
}

let arena: HTMLDivElement;
const startingPositions = [
    { x: 0.25, y: 0.25 },
    { x: 0.25, y: 0.75 },
    { x: 0.75, y: 0.25 },
    { x: 0.75, y: 0.75 }
];

export async function startSingleplayerGame(difficulty: 1 | 2 | 3, numberOfOpponents: 1 | 2 | 3, speedSettings: string[]) {
    arena = document.getElementById("game-container")! as HTMLDivElement;
    if (!arena) throw new Error("Arena not found in DOM");

    const rawHuman = window.sessionStorage.getItem("humanSpeedSetting");
    const humanSpeedLabel = rawHuman ?? "normal";
    const humanSpeed = getSpeedFromLabel(humanSpeedLabel);

    const rawHumanColor = sessionStorage.getItem("humanColorSetting");
    const humanColor = rawHumanColor ?? "red";

    const rawAiColors = sessionStorage.getItem("aiColorSettings");
    const aiColors: string[] = rawAiColors ? JSON.parse(rawAiColors) : [];

    setCurrentState("playing");

    resetSingleplayerTimer();

    // Create human player
    const humanPlayer = new Player("human", "You", 0, 0, arena, 0);
    humanPlayer.speed = humanSpeed;
    const humanPos = startingPositions[0];
    humanPlayer.setPosition(humanPos.x, humanPos.y);
    frontendPlayers[humanPlayer.id] = humanPlayer;
    initPlayerControls(humanPlayer);
    humanPlayer.setColor(humanColor);

    humanPlayer.initialize();
    humanPlayer.element.style.display = "block";
    humanPlayer.updateRender();

    // AI players
    for (let i = 1; i <= numberOfOpponents; i++) {
        const id = `ai${i}`;
        const name = `AI ${i}`;
        const pos = startingPositions[i % startingPositions.length];
        const ai = new Player(id, name, 0, 0, arena, i);
        const colorLabel = aiColors[i - 1] || "blue";
        ai.setColor(colorLabel);

        const aiSpeedLabel = speedSettings[i - 1] || "normal"; // fallback
        ai.speed = getSpeedFromLabel(aiSpeedLabel);

        ai.setPosition(pos.x, pos.y);
        frontendPlayers[id] = ai;
        ai.initialize();
    }


    playSong("/src/assets/sounds/taiko-percussion-loop-preparation-for-action-355034.mp3", { loop: true, volume: 1 });
    requestAnimationFrame(() => {
        Object.values(frontendPlayers).forEach(p => p.isReady = true);
        startGameLoop();
    });
}