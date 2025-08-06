import { frontendPlayers } from "../game";

export type LeaderboardEntry = {
  id: string;
  username: string;
  score: number;
  isOut: boolean;
  index: number;
};

export function getSingleplayerLeaderboard(): LeaderboardEntry[] {
  const ids = Object.keys(frontendPlayers);

  const leaderboard: LeaderboardEntry[] = ids
    .map(id => {
      const p = frontendPlayers[id];
      return {
        id: p.id,
        username: p.username,
        score: p.score,
        isOut: p.isOut,
        index: (p as any).index ?? 0,
      };
    })
    .sort((a, b) => b.score - a.score);

  return leaderboard;
}

export function renderScoreboard(leaderboard: LeaderboardEntry[]) {
  const scoreboardPlayers = document.getElementById("scoreboard-players");
  if (!scoreboardPlayers) return;

  scoreboardPlayers.innerHTML = "";
  let counter = 1;

  leaderboard.forEach(player => {
    const playerListing = document.createElement("div");
    playerListing.classList.add("scoreboard-player-listing");

    const playerPosition = document.createElement("div");
    playerPosition.classList.add("position");
    playerPosition.textContent = counter + ".";

    const playerName = document.createElement("div");
    playerName.classList.add("name");
    playerName.textContent =
      player.username.length > 10
        ? player.username.slice(0, 10) + "..."
        : player.username;

    const playerScore = document.createElement("div");
    playerScore.classList.add("score");
    playerScore.textContent = player.score.toString();

    playerListing.appendChild(playerPosition);
    playerListing.appendChild(playerName);
    playerListing.appendChild(playerScore);
    scoreboardPlayers.appendChild(playerListing);

    counter++;
  });
}
