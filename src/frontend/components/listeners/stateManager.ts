import { appState, type GlobalState } from "../../../utils/appState";

const listeners: Set<(state: GlobalState) => void> = new Set();

/**
 * Subscribes a callback function to state changes.
 *
 * @param {function(state: GlobalState): void} callback - The function to call when the state updates.
 * @returns {function(): void} A function to call to unsubscribe the listener.
 * In this case I am adding an anonymous function (no name) to the listeners Set, this is not an issue,
 * since Set sees every function as distinctively different due to how they are assigned to unique Memory addresses.
 * 
 * Once a state change happens, the bundle of nameless functions all get called from their original call site
 * to execute code, thus it will be the responsibility of the subscriber to check and see if the update is relevant to them.
 */
export function subscribe(callback: (state: GlobalState) => void): () => void {
  listeners.add(callback);
  //unsubscribe is here
  return () => listeners.delete(callback);
}

/**
 * Merges updates into the global state and notifies all subscribed listeners.
 *
 * @param {Partial<GlobalState>} updates - An object containing partial updates for the global state.
 */
export function updateState(updates: Partial<GlobalState>): void {
  // Use a type assertion to ensure the merge is type-safe.
  Object.assign(appState, updates as GlobalState);
  
  // Iterate through all listeners and call them with the updated state (the complete Object, listeners themselves must filter the data).
  listeners.forEach(callback => callback(appState));
}

export { appState };
