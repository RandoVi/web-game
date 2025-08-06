import { renderPage } from "./renderPage";

export const pageHistory: string[] = [];

export function goBack() {
    
    if (pageHistory.length > 1) {
        pageHistory.pop();

        const previousPage = pageHistory[pageHistory.length-1];
        renderPage(previousPage, false);
    } else {
        renderPage('front-page', false);
    }
}