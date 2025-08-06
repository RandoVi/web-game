import { playSong } from "../../client/game/utils/sound";
import { fetchHTML } from "../utils/fetchHTML";
import type { PageSetup } from "../utils/pageSetup";
import { renderPage } from "../utils/renderPage";

export async function createLandingPage(): Promise<PageSetup> {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = await fetchHTML('landing-page');

    const playButton = tempDiv.querySelector("#play-btn");

    const onPlay = () => {
        renderPage('front-page', true);
        playSong("src/assets/sounds/Asian Drums.mp3", { loop: true, volume: 1 });
    }
    playButton?.addEventListener('click', onPlay);
    
    const cleanup = () => {
        playButton?.removeEventListener('click', onPlay);
    };

    return { element: tempDiv, cleanup }
}
