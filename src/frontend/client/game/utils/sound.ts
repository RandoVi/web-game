// Audio handling

import { appState } from "../../../components/listeners/stateManager"

//type annotation
let currentAudio: HTMLAudioElement | null = null //can also be null, Start with it set to null

export function playSong(src: string, {loop = false, volume = 1.0} = {}) {
    if (currentAudio) {
        currentAudio.pause()
        currentAudio = null
    }

    const audio = new Audio(src)
    audio.loop = loop
    audio.volume = appState.soundVolume * volume
    audio.play().catch(error => {
        console.warn("Unable to play audio: ", error)
    })

    currentAudio = audio
    return audio
}

export function stopSong() {
    if(currentAudio) {
        currentAudio.pause()
        currentAudio = null
    }
}

export function playBounceSound() {
    const sound = new Audio('/src/assets/sounds/punch-kick-1.mp3')
    sound.play()
}

export function playPlayerOutSound () {
    const sound = new Audio('/src/assets/sounds/metal-punch.mp3')
    sound.play()
}

//Not used atm
export function playForwardChargeSound () {
    const sound = new Audio('/src/assets/sounds/metal-punch.mp3')
    sound.play()
}