import { fetchHTML } from "../utils/fetchHTML";
import { cleanupGame } from "../../client/game/game";
import type { PageSetup } from "../utils/pageSetup";

export async function prepareGameHTML(): Promise<PageSetup> {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = await fetchHTML("game");
    
        return {
            element: tempDiv,
            cleanup: () => {
                cleanupGame(); // stop sockets, music, etc.
            }
        };
}