import { fetchHTML } from "../utils/fetchHTML";
import { setGameMode } from "../../client/game/mode/gameMode";
import { renderPage } from "../utils/renderPage";
import { setSingleplayerDifficulty } from "../../client/game/mode/difficulty";
import { setOpponentCount } from "../../client/game/mode/opponents";
import type { PageSetup } from "../utils/pageSetup";

export async function createSingleplayerLobby(): Promise<PageSetup> {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = await fetchHTML('singleplayer-lobby-container');

  const startBtn = tempDiv.querySelector('#start-singleplayer') as HTMLButtonElement;
  const difficultySelect = tempDiv.querySelector('#difficulty-select') as HTMLSelectElement;
  const opponentCountSelect = tempDiv.querySelector("#opponent-count-select") as HTMLSelectElement;
  const aiConfigContainer = tempDiv.querySelector("#ai-config-container") as HTMLDivElement;

  if (startBtn && difficultySelect && opponentCountSelect && aiConfigContainer) {
    opponentCountSelect.addEventListener("change", () => {
      const count = parseInt(opponentCountSelect.value, 10);
      aiConfigContainer.innerHTML = ""; // Clear old configs

      for (let i = 0; i < count; i++) {

        const colorSelect = document.createElement("select");
        colorSelect.name = `ai-color-${i}`;
        colorSelect.dataset.aiIndex = String(i);

        const wrapper = document.createElement("div");

        const label = document.createElement("label");
        label.textContent = `AI ${i + 1} speed: `;

        const select = document.createElement("select");
        select.name = `ai-speed-${i}`;
        select.dataset.aiIndex = String(i);

        ["Slow", "Normal", "Fast", "Very Fast"].forEach(speed => {
          const option = document.createElement("option");
          option.value = speed.toLowerCase();
          option.text = speed;
          if (speed === "Normal") option.selected = true; 
          select.appendChild(option);
        });
        ["Red", "Blue", "Green", "Yellow"].forEach(color => {
          const option = document.createElement("option");
          option.value = color.toLowerCase();
          option.text = color;
          colorSelect.appendChild(option);
        });

        wrapper.appendChild(label);
        wrapper.appendChild(select);
        aiConfigContainer.appendChild(wrapper);


        wrapper.appendChild(label);                         // speed label
        wrapper.appendChild(select);                        // speed dropdown
        wrapper.appendChild(document.createTextNode(" "));  // spacing
        wrapper.appendChild(colorSelect);                   // color dropdown
      }
    });
    opponentCountSelect.dispatchEvent(new Event("change"));

    // Start button
    startBtn.addEventListener('click', () => {
      const selectedDifficulty = parseInt(difficultySelect.value) as 1 | 2 | 3;
      const opponents = parseInt(opponentCountSelect.value) as 1 | 2 | 3;

      const aiColors: string[] = [];
      const colorSelects = tempDiv.querySelectorAll<HTMLSelectElement>('[name^="ai-color-"]');
      colorSelects.forEach(select => aiColors.push(select.value));
      sessionStorage.setItem("aiColorSettings", JSON.stringify(aiColors));

      const speedSettings: string[] = [];
      const selects = tempDiv.querySelectorAll<HTMLSelectElement>('[name^="ai-speed-"]');
      selects.forEach(select => speedSettings.push(select.value));

      const humanSpeedSelect = tempDiv.querySelector("#human-speed-select") as HTMLSelectElement;
      const humanSpeed = humanSpeedSelect?.value ?? "normal";

      const humanColorSelect = tempDiv.querySelector("#human-color-select") as HTMLSelectElement;
      const humanColor = humanColorSelect?.value ?? "red";
      sessionStorage.setItem("humanColorSetting", humanColor);

      setGameMode('singleplayer');
      setSingleplayerDifficulty(selectedDifficulty);
      setOpponentCount(opponents);

      sessionStorage.setItem("aiSpeedSettings", JSON.stringify(speedSettings));
      sessionStorage.setItem("humanSpeedSetting", humanSpeed);

      renderPage('game', true);
    });
  }

  const cleanup = () => {
  };

  return { element: tempDiv, cleanup };
}