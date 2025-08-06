import { appState } from "../listeners/stateManager";

const SOUND_PATHS = {
  menuClick: 'src/assets/sounds/mixkit-stapling-paper-2995.wav',
  startGame: `src/assets/sounds/yooooooooooooooooooooooooo_4.mp3`,
  defaultMusic: `src/assets/sounds/Asian Drums.mp3`
  // Cann add more sounds here for other events
  // gameStart: '../assets/sounds/game-start.mp3',
};

let menuClickAudio: HTMLAudioElement = new Audio(SOUND_PATHS.menuClick);
let startGameAudio: HTMLAudioElement = new Audio(SOUND_PATHS.startGame);
let defaultMusic: HTMLAudioElement | null = new Audio(SOUND_PATHS.defaultMusic);

export function playMenuClickSound(): void {
  try {
    menuClickAudio.volume = Math.min(1.0, Math.max(0.0, appState.soundVolume));
    menuClickAudio.play().catch(e => console.error("Error playing sound:", e));
  } catch (e) {
    console.error("Failed to play sound:", e);
  }
}

export function playStartGameAudio(): void {
  try {
    startGameAudio.volume = Math.min(1.0, Math.max(0.0, appState.soundVolume));
    startGameAudio.play().catch(e => console.error("Error playing sound:", e));
  } catch (e) {
    console.error("Failed to play sound:", e);
  }
}

export function playDefaultMusic(loop: boolean): void {
  try {
    if (defaultMusic) {
      defaultMusic.volume = Math.min(1.0, Math.max(0.0, appState.soundVolume));
      defaultMusic.loop = loop;
      defaultMusic.play().catch(e => console.error("Error playing sound:", e));
    }
  } catch (e) {
    console.error("Failed to play sound:", e);
  }
}

export function stopDefaultMusic() {
    if(defaultMusic) {
        defaultMusic.pause();
        defaultMusic.currentTime = 0;
    }
}