import { startGame } from "../../client/game/game";
import { updateState } from "../listeners/stateManager";
import { createFrontPage } from "../pageRenderers/createFrontPage";
import { prepareGameHTML } from "../pageRenderers/createGameHTML";
import { createLandingPage } from "../pageRenderers/createLandingPage";
import { createMultiplayerLobby } from "../pageRenderers/createMultiplayerLobby";
import { createSessionBrowser } from "../pageRenderers/createSessionBrowser";
import { createSettings } from "../pageRenderers/createSettings";
import { createSingleplayerLobby } from "../pageRenderers/createSingleplayerLobby";
import { createTutorial } from "../pageRenderers/createTutorial";
import { pageHistory } from "./pageHistory";
import type { PageSetup } from "./pageSetup";
import { getGameMode } from "../../client/game/mode/gameMode";

let currentPageCleanup: (() => void) | null = null;
const app = document.getElementById('app') as HTMLDivElement;
export async function renderPage(pageName: string, addToHistory: boolean = true, roomId?: string) {
    app.innerHTML = '';

    if (currentPageCleanup) {
        currentPageCleanup();
    }

    //Check if the requested page is already written in history, if it isn't, record it
    if (addToHistory && pageHistory[pageHistory.length - 1] !== pageName) {
        pageHistory.push(pageName);
    }

    updateState({ currentPage: pageName });

    let newPageElement: HTMLDivElement;
    let newPageCleanup: (() => void) | null = null;
    let pageSetup: PageSetup;

    app.innerHTML = '<h1>Loading...</h1>';

    switch (pageName) {
        case 'landing-page':
            pageSetup = await createLandingPage();
            newPageElement = pageSetup.element;
            newPageCleanup = pageSetup.cleanup;
            break;
        case 'front-page':
            pageSetup = await createFrontPage();
            newPageElement = pageSetup.element;
            newPageCleanup = pageSetup.cleanup;
            break;
        case 'singleplayer-lobby': {
            pageSetup = await createSingleplayerLobby();
            newPageElement = pageSetup.element;
            newPageCleanup = pageSetup.cleanup;
            break;
        }
        case 'session-browser':
            pageSetup = await createSessionBrowser();
            newPageElement = pageSetup.element;
            newPageCleanup = pageSetup.cleanup;
            break;
        case 'multiplayer-lobby':
            if (!roomId) {
                throw new Error("Cannot render multiplayer lobby without a roomId.");
            }
            pageSetup = await createMultiplayerLobby(roomId);
            newPageElement = pageSetup.element;
            newPageCleanup = pageSetup.cleanup;
            break;
        case 'game':
            pageSetup = await prepareGameHTML();
            newPageElement = pageSetup.element;
            newPageCleanup = pageSetup.cleanup;
            break;
        case 'tutorial':
            const el = await createTutorial();
            newPageElement = el as unknown as HTMLDivElement;
            newPageCleanup = null;
            break;
        case 'settings':
            pageSetup = await createSettings();
            newPageElement = pageSetup.element;
            newPageCleanup = pageSetup.cleanup;
            break;

        default:
            pageSetup = await createFrontPage();
            newPageElement = pageSetup.element;
            newPageCleanup = pageSetup.cleanup;
    }
    app.innerHTML = '';
    app.appendChild(newPageElement);
    currentPageCleanup = newPageCleanup;

    if (pageName === 'game') {
        const gameMode = getGameMode();
        if (gameMode === 'multiplayer') {
            if (!roomId) throw new Error("Cannot start multiplayer game without a roomId");
            await startGame(roomId); // multiplayer start
        } else if (gameMode === 'singleplayer') {
            await startGame(); // singleplayer start and threse no roomId
        } else {
            throw new Error("Unknown game mode.");
        }
    }
}
