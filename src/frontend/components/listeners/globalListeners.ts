import type { LeaderboardEntry } from "../../../backend/types";
import type { RoomEntity } from "../../../backend/types";
import { cleanupSingleplayerGame } from "../../client/game/state/singlePlayerManager";
import { socket } from "../../network/socket";
import { updateVolume } from "../pageRenderers/createSettings";
import { playDefaultMusic, playMenuClickSound, playStartGameAudio, stopDefaultMusic } from "../utils/menuSounds";
import { goBack } from "../utils/pageHistory";
import { renderPage } from "../utils/renderPage";
import { appState, updateState } from "./stateManager";

let gameIntervalId: ReturnType<typeof setTimeout>;
let timeRemaining: number = 0;
export function initGlobalListeners() {

    const app = document.getElementById('app');

    app?.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const button = target.closest('button');

        if (button) {
            if (target.classList.contains('back-btn')) {
                goBack();
            } else if (target.classList.contains('exit-btn')) {
                socket.emit("remove-player-request", { roomId: appState.currentRoom?.id, playerId: socket.id, action: "leave" });
                updateState({ currentRoom: null });
                renderPage('front-page');
                cleanupSingleplayerGame();
                playDefaultMusic(true);
            } else if (target.classList.contains('rematch-btn') || (target.id === 'restart-btn')) {
                socket.emit('restart-game-request', (appState.currentRoom?.id));
            } else if (target.id === 'resume-btn') {
                socket.emit("game-master-control", { action: "unpause", by: socket.id });
            }

            if (button && button.id !== "test-sound-btn" && button.id !== "exit-btn" && button.id !== "start-btn") {
                playMenuClickSound();
            }
        }
    });

    app?.addEventListener('input', (event) => {
        if (event.target instanceof HTMLInputElement && event.target.id === 'volume-slider') {
            const percentage = parseFloat(event.target.value);
            updateVolume(percentage);
        }
    });

    //////////////////////////////////// Frontpage
    socket.on("player-connected", (defaultName: string) => {
        if (appState.currentUsername === '') {
            updateState({currentUsername: defaultName});
        }
    })

    socket.on("name-validation-and-join-response", ({ success,  enteredName = 'Player', roomId = null }) => {
        if (!success) {
            if (appState.currentPage === "session-browser") {
                const errorBox = document.getElementById("error-modal");
                errorBox?.classList.remove("hidden");
            }
        } else if (success && enteredName && roomId) {
            renderPage('multiplayer-lobby', false, roomId);
            updateState({ currentRoom: roomId });
        }
    });
    //////////////////////////////////// Browser

    socket.on("sessions-list-update", (gameRoomsRecord: Record<string, RoomEntity>) => {
        // Convert the received plain object back into a Map

        //Since websockets do not have "Map" type data structure,
        //it gets converted into a plain Java object (during JSON serialization).
        //This means we have to rebuild the map to get all the nice features it has, or adapt to the plain object.

        const gameRoomsMap = new Map(Object.entries(gameRoomsRecord));
        
        // Update the appState with the new Map
        updateState({ gameRooms: gameRoomsMap });
    });

    socket.on("current-room-data-response",  (gameRoomsRecord: Record<string, RoomEntity>) => {
        const gameRoomsMap = new Map(Object.entries(gameRoomsRecord));
        updateState({ gameRooms: gameRoomsMap });
    });

    socket.on("create-room-response", ( createdRoom: RoomEntity) => {
        renderPage('multiplayer-lobby', false, createdRoom.id);
        updateState({ currentRoom: createdRoom  });
    });

    //////////////////////////////////// Lobby

    socket.on('arena-confirmed', ( roomData: RoomEntity ) => {
        const arenaButtons = document.querySelectorAll(".map-selection-btn") as NodeListOf<HTMLButtonElement>;
        const arenaImage = document.getElementById('arena-image') as HTMLImageElement;
        arenaButtons.forEach(button => {
            if (button.dataset.arenaName && button.dataset.arenaName === roomData.arena) {
                const chosenImagePath = button.dataset.arenaImagePath;
                if (arenaImage && chosenImagePath) {
                    arenaImage.src = chosenImagePath;
                }
                button.classList.add("highlighted-arena");
            } else {
                button.classList.remove("highlighted-arena");
            }
        })
        updateState({ currentRoom: roomData })
    })

    socket.on('room-update', updatedRoom => {
        const currentRooms = appState.gameRooms;
        const updatedGameRooms = new Map(currentRooms);
        updatedGameRooms.set(updatedRoom.id, updatedRoom);
        updateState({ gameRooms: updatedGameRooms, currentRoom: updatedRoom });
    });

    socket.on('player-removed', (action: string) => {
        updateState({ currentRoom: null });
        renderPage('session-browser', true);
        if (action === 'kick') {
            showNotification("You have been kicked from the room")
        } else if (action === 'disband'){
            showNotification("The room was disbanded")
        } else {
            showNotification("You have left the room")
        }
    });


    socket.on('room-delete-response', () => {
        updateState({ currentRoom: null  });
        renderPage('session-browser', true);
        showNotification("Host left - room has been deleted")
    });

    socket.on('start-game', (roomId) => {
        playStartGameAudio();
        renderPage("game", false, roomId);
    })

    socket.on("pause", (data?: { timeLeft: number }) => {
        const pauseModal = document.getElementById('pause-modal');
        if (pauseModal){
            pauseModal.classList.toggle('hidden');
            const resumeButton = document.getElementById("resume-btn");
            const restartButton = document.getElementById("restart-btn");
            if (appState.currentRoom?.hostId === socket.id) {
                resumeButton?.classList.remove("hidden");
                restartButton?.classList.remove("hidden");
            } else {
                resumeButton?.classList.add("hidden");
                restartButton?.classList.add("hidden");
            }
            
            if (pauseModal.classList.contains('hidden')) {
                /**resume timer */
                if (data?.timeLeft !== undefined) {
                    timeRemaining = Date.now() + data.timeLeft * 1000;
                }
                startTimer();
            } else {
                pauseTimer();
                if (data?.timeLeft !== undefined) {
                    timeRemaining = Date.now() + data.timeLeft * 1000;
                }
            }
        }
    })

    socket.on('restart-game', (roomId) => {
        renderPage("multiplayer-lobby", false, roomId)
        showNotification("Host has restarted the game!")
    })

    socket.on("menu-sessions-count-update", (validSessions: number) => {
        updateState({validRoomsCount: validSessions});
    })
    
    socket.on('leaderboard-from-server', (leaderboard: LeaderboardEntry[]) => {
        const scoreboardPlayers = document.getElementById('scoreboard-players');
        if (scoreboardPlayers) {
            scoreboardPlayers.innerHTML = "";
            let counter: number = 1;
            leaderboard.forEach(player => {
                const playerListing = document.createElement("div")
                playerListing.classList.add("scoreboard-player-listing");
                    const playerPosition = document.createElement("div");
                    playerPosition.classList.add("position");
                    playerPosition.textContent = counter + "."
                    const playerName = document.createElement("div");
                    playerName.classList.add("name");
                    const playerScore = document.createElement("div");
                    playerScore.classList.add("score");
                    if (player.username.length > 10) {
                        playerName.textContent = player.username.slice(0, 10) + "..."
                    } else {
                        playerName.textContent = player.username
                    }
                    playerScore.textContent = player.score.toString();

                    playerListing.appendChild(playerPosition);
                    playerListing.appendChild(playerName);
                    playerListing.appendChild(playerScore);

                scoreboardPlayers?.appendChild(playerListing);
                counter++;
            })
        }
    })

    socket.on('timer-from-server', (gameEndTime: number) => {
        if (gameIntervalId) {
            clearInterval(gameIntervalId);
        }
        timeRemaining = gameEndTime;
        startTimer();
    })

    const coloursArray: string[] = ['red', 'blue', 'green', 'yellow'];
    let hostPlayerId: string = '';

    socket.on("gameover", (leaderboardData) => {
        if (gameIntervalId) {
            clearInterval(gameIntervalId);
        }
        const timerText = document.getElementById('timer-text');
        if (timerText) {
            timerText.textContent = "00:00";
        }

        renderWinScreen(leaderboardData, coloursArray, hostPlayerId)
    });
}

export function renderWinScreen(leaderboardData: LeaderboardEntry[], coloursArray: string[], hostPlayerId: string, overridePlayerId?: string) {
    const idToFind = overridePlayerId || socket.id;
    // const currentPlayer = leaderboardData.find(p => p.id === idToFind);

    const winscreenModal = document.getElementById('winscreen-modal') as HTMLDivElement;
    const finishList = document.getElementById('finish-list');
    if (winscreenModal) {

        if (finishList) {
            finishList.innerHTML = '';
        }

        winscreenModal.classList.remove('hidden');

        const currentPlayer = leaderboardData.find((player: LeaderboardEntry) => player.id === idToFind);
        // const currentPlayer = leaderboardData.find((player: LeaderboardEntry) => player.id === socket.id);

        if (!winscreenModal.classList.contains('hidden') && currentPlayer && finishList) {

            const finishText = document.createElement('h2') as HTMLDivElement;
            finishText.textContent = "Game over!"

            const resultText = document.createElement('h2') as HTMLDivElement;
            if(leaderboardData[0].id === currentPlayer.id ) {
                resultText.textContent = "You are the winner!"
            } else {
                const position = leaderboardData.indexOf(currentPlayer);
                switch (position) {
                    case 0:
                        resultText.textContent = `You finished 1-st`
                        break;
                    case 1:
                        resultText.textContent = `You finished 2-nd`
                        break;
                    case 2:
                        resultText.textContent = `You finished 3-rd`
                        break;
                    case 3:
                        resultText.textContent = `You finished 4-th`
                        break;
                }
            }
            const pointsText = document.createElement('h3') as HTMLDivElement;
            pointsText.textContent = `You got ${currentPlayer.score} points`;
            
            const allPlayers = document.createElement('ul');
            leaderboardData.forEach((player: LeaderboardEntry) => {
                const aPlayer = document.createElement('li');
                if (player.id === socket.id) {
                    aPlayer.textContent = `You : ${player.score} points`
                } else {
                    aPlayer.textContent = `${player.username}: ${player.score} points`
                }
                const playerColourBox = document.createElement("span");
                playerColourBox.classList.add("player-colour-box");
                playerColourBox.style.background = coloursArray[player.index];
                aPlayer.appendChild(playerColourBox);
                allPlayers.appendChild(aPlayer);

                if (player.index === 0) {
                    hostPlayerId = player.id;
                }
            });
            finishList.appendChild(finishText);
            finishList.appendChild(resultText);
            finishList.appendChild(pointsText);
            finishList.appendChild(allPlayers);
            setTimeout(() => {
                if (hostPlayerId === socket.id) {
                    setRematchButtonVisibility(true);
                } else {
                    setRematchButtonVisibility(false);
                }
            }, 100)
        }
    }
}

function setRematchButtonVisibility(button:boolean) {
    const winscreenModal = document.getElementById('winscreen-modal');
    const rematchButton = winscreenModal?.querySelector(".rematch-btn") as HTMLDivElement;

    if (rematchButton) {
        if (button == true) {
            rematchButton.style.display = "block";
        } else {
            rematchButton.style.display = "none";
        }
    }
}

function startTimer() {
    updateTimerDisplay(); 
    gameIntervalId = setInterval(updateTimerDisplay, 1000);
}
/**Separtaded from startTimer to update timer instantly, without being late 1 sec because of waiting */
function updateTimerDisplay() {
    const now = Date.now();
    const timeLeftMs = Math.max(0, timeRemaining - now);
    const totalSeconds = Math.floor(timeLeftMs / 1000);
    const seconds = totalSeconds % 60;
    const formattedTime = `${String(seconds).padStart(2, '0')}`;
    const timerText = document.getElementById('timer-text');
    
    if (timerText) {
        timerText.textContent = formattedTime;
    }
    if (totalSeconds <= 0) {
        clearInterval(gameIntervalId);
    }
}

function pauseTimer() {
  clearInterval(gameIntervalId);
}

let notificationTimer: ReturnType<typeof setTimeout> | null = null;
function showNotification(message: string) {

    const notificationArea = document.getElementById('notification-area');
    if (notificationArea) {

        if (notificationTimer) {
            clearTimeout(notificationTimer);
        }
        notificationArea.textContent = message;
        notificationArea.classList.remove("hidden");

        notificationTimer = setTimeout(() => {
            notificationArea.classList.add("hidden");
            notificationTimer = null;
        }, 3000);
    }
}
