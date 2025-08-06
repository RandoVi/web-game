import type { RoomEntity } from "../../../backend/types";
import { socket } from "../../network/socket";
import { addFakePlayerToRoom } from "../utils/fakePlayerAdder";
import { fetchHTML } from "../utils/fetchHTML";
import type { PageSetup } from "../utils/pageSetup";
import { subscribe, appState  } from "../listeners/stateManager";

export async function createMultiplayerLobby(roomId: string): Promise<PageSetup> {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = await fetchHTML('lobby-container');

    const addButton = tempDiv.querySelector("#add-btn");
    const playerList = tempDiv.querySelector('#player-list') as HTMLButtonElement;
    const confirmModal = tempDiv.querySelector("#confirmation-modal") as HTMLDivElement;
    const yesButton = tempDiv.querySelector("#leave-yes-button") as HTMLButtonElement;
    const noButton = tempDiv.querySelector("#leave-no-button") as HTMLButtonElement;
    const backButton = tempDiv.querySelector('.back-btn') as HTMLButtonElement;
    const startButton = tempDiv.querySelector(".start-btn") as HTMLButtonElement;
    const arenaButtons = tempDiv.querySelectorAll(".map-selection-btn") as NodeListOf<HTMLButtonElement>;
    const arenaImage = tempDiv.querySelector('#arena-image') as HTMLImageElement;
    arenaButtons.forEach(button => {
        if (button.dataset.arenaName && button.dataset.arenaName === appState.currentRoom?.arena) {
            const chosenImagePath = button.dataset.arenaImagePath;
            if (arenaImage && chosenImagePath) {
                arenaImage.src = chosenImagePath;
            }
            button.classList.add("highlighted-arena");
        } else {
            button.classList.remove("highlighted-arena");
        }
    })

    const unsubscribe = subscribe(state => {
        if (state.currentPage === 'multiplayer-lobby') {
            if (state.currentRoom) {
                renderPlayers(state.currentRoom, tempDiv);
            }
        }
    });

    // This will be removed when the base game is done.
    const onAddButtonCLicked = () => {
        const fakePlayerName = `TestPlayer${Math.floor(Math.random() * 10)}`;
        addFakePlayerToRoom(roomId, fakePlayerName);
    }

    const onYesButtonClicked = () => {
        socket.emit("room-delete-request", roomId)
        confirmModal.classList.add('hidden');
    }

    const onNoButtonClicked = () => {
       confirmModal.classList.add('hidden');
    }

    //Additional check for the back button to ensure a better user experience
    //This will be added if you are the host, otherwise the global back button is used
    const onBackButtonClicked = (event:MouseEvent) => {
        event.stopPropagation();
        let isCurrentPlayerHost = appState.currentRoom?.hostId === socket.id;

        const confirmModal = tempDiv.querySelector("#confirmation-modal") as HTMLDivElement;
        if(isCurrentPlayerHost) {
            confirmModal.classList.remove('hidden');
        } else {
            confirmModal.classList.add('hidden');
            socket.emit('remove-player-request', { roomId: roomId, playerId: socket.id, action: "disband"});
        }
    };
    
    const onRemovePlayerClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('remove-player-btn') && appState.currentUsername) {
            const playerListing = target.closest('.lobby-player')
            if (playerListing) {
                socket.emit("remove-player-request", { roomId: appState.currentRoom?.id, playerId: playerListing.id, action: "kick" });
            } else {
            }
        }
    }
    const onStartButtonClicked = () => {
        socket.emit('start-game-request', (roomId));
    }

    const onChooseArenaClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('map-selection-btn')) {
            let chosenArena: string = "";
            if (target.dataset.arenaName) {
                chosenArena = target.dataset.arenaName;
            }
            if (chosenArena !== "") {
                socket.emit('arena-chosen', {
                    newArena: chosenArena,
                    roomId: appState.currentRoom?.id
                });
            } else {
                "No text value available to send to backend (arena button) m-lobby @82"
            }
        }
    }
    
    addButton?.addEventListener('click', onAddButtonCLicked);
    yesButton.addEventListener('click', onYesButtonClicked);
    noButton.addEventListener('click', onNoButtonClicked);
    backButton.addEventListener('click', onBackButtonClicked);
    startButton?.addEventListener('click', onStartButtonClicked);
    playerList.addEventListener('click', onRemovePlayerClick)

    arenaButtons.forEach(arenaButton => {
        arenaButton.addEventListener('click', onChooseArenaClick);
    })

    const cleanup = () => {
        unsubscribe();

        addButton?.removeEventListener('click', onAddButtonCLicked);
        yesButton.removeEventListener('click', onYesButtonClicked);
        noButton.removeEventListener('click', onNoButtonClicked);
        backButton.removeEventListener('click', onBackButtonClicked);
        startButton?.removeEventListener('click', onStartButtonClicked);
        playerList.removeEventListener('click', onRemovePlayerClick)
    };
            socket.emit("current-room-data-request", (roomId));
    
    //Return div and its socket cleaners
    return { element: tempDiv, cleanup };
}

function renderPlayers (room: RoomEntity, tempDiv: HTMLDivElement) {

    let isHost = room?.hostId === socket.id;

    const startButton = tempDiv.querySelector(".start-btn") as HTMLButtonElement;
    // const addButton = tempDiv.querySelector("#add-btn") as HTMLButtonElement;
    if (isHost) {
        startButton?.classList.remove("hidden");
        // addButton?.classList.remove("hidden");
    } else {
        startButton?.classList.add("hidden");
        // addButton?.classList.add("hidden");
    }

    const playerCountDiv = tempDiv.querySelector('#player-count') as HTMLButtonElement;
    playerCountDiv.textContent = room?.players.length + "/4 players";
    let playerCount: number = 0;
    const playerColours: string[] = ["red", "blue", "green", "yellow"];

    const playerList = tempDiv.querySelector('#player-list') as HTMLButtonElement;
    playerList.innerHTML = '';

    room?.players.forEach(player => {
        const playerCard = document.createElement("div")
        playerCard.classList.add("lobby-player")
        playerCard.id = player.id;

            const playerName = document.createElement("div")
            playerName.classList.add("lobby-player-name")
            playerName.textContent = player.name;
            if (player.id === socket.id) {
                playerName.textContent = playerName.textContent + " - You"
            } else if (player.id === room.hostId) {
                playerName.textContent = playerName.textContent + " - Host"
            }

            const playerControls = document.createElement("div");
            playerControls.classList.add("lobby-player-controls");

                const playerColourBox = document.createElement("span");
                playerColourBox.classList.add("lobby-player-colour-box");
                playerColourBox.style.background = playerColours[playerCount];
                playerCount++;

                const removePlayer = document.createElement("button");
                removePlayer.innerHTML = "X";
                removePlayer.classList.add("remove-player-btn");
                removePlayer.classList.add("hidden");

            playerControls.appendChild(playerColourBox);
            playerControls.appendChild(removePlayer);

            if(isHost) {
                if (player.id !== socket.id) {
                    removePlayer.classList.remove("hidden");
                }
            }
            playerCard.appendChild(playerName);
            playerCard.appendChild(playerControls);
        playerList.appendChild(playerCard);
    })
    updateMapSelectorState(isHost);
}

function updateMapSelectorState(isHost: boolean) {
  const mapSelector = document.getElementById('map-selector');
  if (mapSelector) {
    if (isHost) {
      mapSelector.classList.remove('disabled-container');
    } else {
      mapSelector.classList.add('disabled-container');
    }
  }
}
