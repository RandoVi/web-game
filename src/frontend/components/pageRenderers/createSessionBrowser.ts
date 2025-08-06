import { socket } from "../../network/socket";
import { renderPage } from "../utils/renderPage";
import { fetchHTML } from "../utils/fetchHTML";
import type { PageSetup } from "../utils/pageSetup";
import { subscribe, appState } from "../listeners/stateManager";

export async function createSessionBrowser(): Promise<PageSetup> {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = await fetchHTML('session-browser');

    const sessionList = tempDiv.querySelector("#session-list") as HTMLDivElement;
    const createButton = tempDiv.querySelector('#create-session-btn') as HTMLButtonElement;
    const errorBox = tempDiv.querySelector("#error-modal") as HTMLDivElement;
    const closeButton = tempDiv.querySelector("#close-btn") as HTMLButtonElement;
    
    const unsubscribe = subscribe(state => {
        // This callback is triggered on every state update.
        // The component checks if the update is relevant to it.
    
        if (state.currentRoom && state.currentRoom.players.some((p: { id: string | undefined; }) => p.id === socket.id)) {
            renderPage("multiplayer-lobby", false, state.currentRoom.id)
        }

        if (state.currentPage === 'session-browser' && state.gameRooms) {
            if (sessionList) {
                sessionList.innerHTML = '';
            }
        }

        //gameRooms.values()  gives the values of each key inside  the map
        //   This  method is the way it is only  because we are using a single session at once,
        // otherwise we would filter  and only fetch rooms that are in menu status(joinable)
        for (const room of state.gameRooms.values()) {
            const sessionCard = document.createElement('div')
            sessionCard.id = room.id
            sessionCard.classList.add("session");

            const sessionName = document.createElement('div');
            sessionName.textContent = room.roomName

            const playerAmount = document.createElement('div');
            playerAmount.classList.add("players-in-session");
            playerAmount.textContent = room.players.length + "/4 players";

            const roomStatus = document.createElement('div');
            roomStatus.classList.add('session-status');
            roomStatus.textContent = room.status;

            const joinButton = document.createElement('button');
            joinButton.classList.add('join-session-btn');
            joinButton.textContent = "Join";
            if (room.players.length === 4 || room.status !== "menu") {
                joinButton.classList.add('disabled');
                joinButton.disabled = true;
            } else {
                joinButton.classList.remove('disabled');
                joinButton.disabled = false;
            }

            sessionCard.appendChild(sessionName);
            sessionCard.appendChild(playerAmount);
            sessionCard.appendChild(roomStatus);
            sessionCard.appendChild(joinButton);

            sessionList?.appendChild(sessionCard);
        }
        const sessionCounter = document.getElementById("session-counter");
        if (sessionCounter) {
            if (state.validRoomsCount === 0) {
                sessionCounter.textContent = '';
                const notification = document.createElement("h1");
                notification.id = "session-notification";
                notification.textContent = `No sessions available yet`
                sessionList.appendChild(notification);
                createButton.classList.remove("disabled");
            } else if (state.validRoomsCount > 0) {
                    if (state.validRoomsCount >= 1) {
                        sessionCounter.textContent = state.validRoomsCount + " session available"
                        createButton.classList.add("disabled");
                    }
            }
        }
    });
    
    

    const onJoinButtonClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.classList.contains('join-session-btn')) {
                const sessionId = target.parentElement?.id;
                if (sessionId && appState.currentUsername) {
                    socket.emit("name-validation-and-join-request", sessionId, appState.currentUsername)
                }
            }
    }

    
    function onCreate() {
        if (!socket.connected || !appState.currentUsername || appState.validRoomsCount >= 1) {
            return
        }
        socket.emit('create-room-request', socket.id, appState.currentUsername)
    };

    closeButton?.addEventListener('click', onClose)
    function onClose () {
        errorBox?.classList.add("hidden");
    }

    createButton.addEventListener('click', onCreate);
    sessionList.addEventListener('click', onJoinButtonClick);

    const cleanup = () => {
        unsubscribe();
        createButton.removeEventListener('click', onCreate);
        sessionList.removeEventListener('click', onJoinButtonClick);
        closeButton?.removeEventListener('click', onClose);
    };

    socket.emit("sessions-list-request");


    return { element: tempDiv, cleanup };
}