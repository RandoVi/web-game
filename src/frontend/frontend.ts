import { initGlobalListeners } from "./components/listeners/globalListeners";
import { renderPage } from "./components/utils/renderPage";
import { playDefaultMusic } from "./components/utils/menuSounds";

//Application entrypoint

//This will be inside a separate function to determine whether the player wants to play singleplayer or multiplayer,
// and then attach the required systems to facilitate either option(local backend with mock sockets or real backend with real sockets)
initGlobalListeners();

renderPage('landing-page', false);
playDefaultMusic(true);
