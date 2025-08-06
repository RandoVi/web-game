let singleplayerDifficulty: 1 | 2 | 3  = 1;

export function setSingleplayerDifficulty(difficulty: 1 | 2 | 3 ) {
  singleplayerDifficulty = difficulty;
}

export function getSingleplayerDifficulty(): 1 | 2 | 3  {
  return singleplayerDifficulty;
}
