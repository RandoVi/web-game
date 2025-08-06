import { fetchHTML } from "../utils/fetchHTML";

export async function createTutorial(): Promise<HTMLDivElement> {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = await fetchHTML('tutorial')
            
    return tempDiv;
}