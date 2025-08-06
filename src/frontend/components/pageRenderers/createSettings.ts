import { playSong } from "../../client/game/utils/sound";
import { appState, subscribe, updateState } from "../listeners/stateManager";
import { fetchHTML } from "../utils/fetchHTML";
import type { PageSetup } from "../utils/pageSetup";

export async function createSettings(): Promise<PageSetup> {

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = await fetchHTML('settings');

    const volumeSlider = tempDiv.querySelector("#volume-slider");

    function convertLogToPercentage(volume: number): number {
        return Math.pow(volume, 1 / 1.5) * 100;
    }

    if (volumeSlider instanceof HTMLInputElement && appState.soundVolume !== undefined) {
        const percentage = convertLogToPercentage(appState.soundVolume);
        volumeSlider.value = percentage.toString();
    }

     const onTestClicked = () => {
        playSong("/src/assets/sounds/punch-kick-1.mp3", { loop: false, volume: 1 });
    }

    const testButton = tempDiv.querySelector("#test-sound-btn");
    testButton?.addEventListener('click', onTestClicked);

    const unsubscribe = subscribe(state => {
        if (state.currentPage === 'settings' && state.soundVolume !== undefined) {
            if (volumeSlider instanceof HTMLInputElement) {
                const percentage = convertLogToPercentage(state.soundVolume);
                volumeSlider.value = percentage.toString();
            }
        }
    });
    
    const cleanup = () => {
        unsubscribe();
    };

    return { element: tempDiv, cleanup };
}

// This function converts the value to a logarithmic scale and updates the State: 
export function updateVolume(percentage: number) {
    const linearValue = percentage / 100;
    const newVolume = Math.pow(linearValue, 1.5);
    updateState({ soundVolume: newVolume });
}