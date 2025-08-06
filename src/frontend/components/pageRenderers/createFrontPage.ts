import { fetchHTML } from "../utils/fetchHTML";
import { renderPage } from "../utils/renderPage";
import type { PageSetup } from "../utils/pageSetup";
import { subscribe, appState, updateState } from "../listeners/stateManager";
import { connectSocket } from "../../network/socket";

export async function createFrontPage(): Promise<PageSetup> {

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = await fetchHTML('front-page');

    const playerNameContainer = tempDiv.querySelector("#player-name-container") as HTMLDivElement;
    const playerNameElement = tempDiv.querySelector("#player-name") as HTMLDivElement;
    const nameInput = tempDiv.querySelector('#name-input') as HTMLInputElement;
    const nameForm = tempDiv.querySelector('#name-form') as HTMLFormElement;
    const multiplayerButton = tempDiv.querySelector('.multiplayer-lobby-btn') as HTMLButtonElement;
    const confirmButton = tempDiv.querySelector("#confirm-btn") as HTMLButtonElement;
    const cancelButton = tempDiv.querySelector("#cancel-btn") as HTMLButtonElement;
    const editButton = tempDiv?.querySelector("#edit-name-btn") as HTMLButtonElement;
    const singleplayerButton = tempDiv.querySelector('.singleplayer-lobby-btn') as HTMLButtonElement;
    const errorBox = tempDiv.querySelector("#error-modal") as HTMLDivElement;
    const closeButton = tempDiv.querySelector("#close-btn") as HTMLButtonElement;
    const settingsButton = tempDiv.querySelector('.settings-btn') as HTMLButtonElement;
    const tutorialButton = tempDiv.querySelector('.tutorial-btn') as HTMLButtonElement;

    if (appState.currentUsername !== '') {
    // If a username exists, show the name and hide the input field
        nameForm.style.display = 'none';
        playerNameContainer.style.display = 'flex';
        playerNameElement.textContent = `You are playing as: ${appState.currentUsername}`;
    }

    const unsubscribe = subscribe(state => {
            if (state.currentPage === 'front-page') {
            if (state.currentUsername) {
                // If a username exists, show the name and hide the input field
                nameForm.style.display = 'none';
                playerNameContainer.style.display = 'flex';
                playerNameElement.textContent = `Playing as: ${state.currentUsername}`;
            } else {
                // If no username exists, show the input field and hide the name
                nameForm.style.display = 'block';
                playerNameContainer.style.display = 'none';
            }
        }
    });
    
    function onFormSubmit(event: Event) {
        event.preventDefault();
        validateAndSetUsername(nameInput.value);
    }

    
    function onConfirm(event: MouseEvent) {
        event.preventDefault();
        validateAndSetUsername(nameInput.value);
    }
    
    function onCancel() {
        nameInput.value = appState.currentUsername || '';
        nameForm.style.display = 'flex';
        playerNameContainer.style.display = 'none';
        nameInput.classList.remove("invalid-input");
        errorBox?.classList.add("hidden");
    }

    function onEdit() {
        nameInput.value = appState.currentUsername || '';
        nameForm.style.display = 'flex';
        playerNameContainer.style.display = 'none';
        nameInput.classList.remove("invalid-input");
        errorBox?.classList.add("hidden");
    }

    function onSinglePlayer() {
        renderPage('singleplayer-lobby', true);
    }
    
    function onMultiPlayer() {
        if (appState.currentUsername.length < 3 || appState.currentUsername.length > 20) {
            nameInput.classList.add("invalid-input");
            errorBox?.classList.remove("hidden");
        } else {
            nameInput.classList.remove("invalid-input");
            errorBox?.classList.add("hidden");
            connectSocket();
            renderPage('session-browser', true);
        }
    }
    
    closeButton?.addEventListener('click', onClose)
    function onClose () {
        errorBox?.classList.add("hidden");
    }
    
    function onSettings() {
        renderPage('settings', true);
    }
    
    function onTutorial() {
        renderPage('tutorial', true);
    }

    function validateAndSetUsername(name: string) {
        const trimmedName = name.trim();
        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
        const valid = usernameRegex.test(trimmedName);
        if (valid) {
            updateState({currentUsername: trimmedName});
            nameInput.classList.remove("invalid-input");
            errorBox?.classList.add("hidden");
            return true;
        } else {
            nameInput.classList.add("invalid-input");
            errorBox?.classList.remove("hidden");
            return false;
        }
    }

    nameForm.addEventListener('submit', onFormSubmit);
    confirmButton.addEventListener('click', onConfirm);
    cancelButton.addEventListener('click', onCancel)
    editButton.addEventListener('click', onEdit);
    singleplayerButton.addEventListener('click', onSinglePlayer)
    multiplayerButton.addEventListener('click', onMultiPlayer);
    settingsButton.addEventListener('click', onSettings);
    tutorialButton.addEventListener('click', onTutorial);


    const cleanup = () => {
        unsubscribe();

        nameForm.removeEventListener('submit', onFormSubmit);
        confirmButton.removeEventListener('click', onConfirm);
        cancelButton.removeEventListener('click', onCancel)
        editButton.removeEventListener('click', onEdit);
        singleplayerButton.removeEventListener('click', onSinglePlayer)
        multiplayerButton.removeEventListener('click', onMultiPlayer);
        settingsButton.removeEventListener('click', onSettings);
        tutorialButton.removeEventListener('click', onTutorial);
        closeButton?.removeEventListener('click', onClose);
    };

    return { element: tempDiv, cleanup }
}

