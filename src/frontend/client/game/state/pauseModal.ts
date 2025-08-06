export function showPauseModal() {
  const modal = document.getElementById("pause-modal");
  if (modal) {
    modal.classList.remove("hidden");
  }
}

export function hidePauseModal() {
  const modal = document.getElementById("pause-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}