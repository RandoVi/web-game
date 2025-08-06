let opponentCount: 1 | 2 | 3 = 3;

export function setOpponentCount(count: 1 | 2 | 3) {
  opponentCount = count;
}

export function getOpponentCount(): 1 | 2 | 3 {
  return opponentCount;
}
