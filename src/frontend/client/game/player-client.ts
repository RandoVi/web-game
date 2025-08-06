import { PlayerEntity } from "../../../utils/playerEntity";
import { frontendPlayers } from "./game";
import { playBounceSound, playPlayerOutSound } from "./utils/sound";

const playerImages = [
  '/src/assets/images/redSumo.png',
  '/src/assets/images/blueSumo.png',
  '/src/assets/images/greenSumo.png',
  '/src/assets/images/yellowSumo.png',
];

export class Player extends PlayerEntity {
  isReady = false;
  hasScheduledDestroy = false;
  public element: HTMLDivElement;
  private container: HTMLElement;
  private lastBounceTime = 0;
  private bounceCooldown = 500;
  private hasPlayedOutSound = false;
  private initialized = false; //  new flag

  constructor(
    id: string,
    username: string,
    x: number,
    y: number,
    container: HTMLElement,
    playerIndex: number
  ) {
    super(id, username, x, y);
    if (!(container instanceof HTMLElement)) {
      throw new Error("Player container must be a valid HTMLElement");
    }
    this.container = container;

    this.element = document.createElement("div");
    this.element.className = "player-character";
    this.element.style.position = "absolute";
    this.element.style.transformOrigin = "50% 50%";
    this.element.style.backgroundImage = `url("${playerImages[playerIndex % playerImages.length]}")`;
    this.element.style.backgroundSize = "cover";
    this.element.style.backgroundRepeat = "no-repeat";
    this.element.style.backgroundPosition = "center";

    this.element.style.display = "none"; //hide until synced
    this.container.appendChild(this.element);
  }

  updatePosition(delta: number) {
    super.updatePosition(delta);
    if (this.initialized) this.updateRender(); 
  }

override checkArenaCollision() {
  super.checkArenaCollision();

if (this.isOut) {
  if (!this.hasPlayedOutSound) {
    playPlayerOutSound();
    this.hasPlayedOutSound = true;
  }

  if (!this.hasScheduledDestroy) {
    this.hasScheduledDestroy = true;
    setTimeout(() => {
      this.destroy();
    }, 1000);
  }
} else {
    this.hasPlayedOutSound = false;
  }
}
  

  override resolveCollisionWith(other: Player) {
    const beforeVX = this.vx;
    const beforeVY = this.vy;

    super.resolveCollisionWith(other);

    const now = Date.now();
    if (
      (this.vx !== beforeVX || this.vy !== beforeVY) &&
      now - this.lastBounceTime > this.bounceCooldown
    ) {
      playBounceSound();
      this.lastBounceTime = now;
    }
  }

  updateRender() {
    if (!this.initialized) return;

    const rect = this.container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const px = this.x * rect.width;
    const py = this.y * rect.height;
    const sizePx = this.size * Math.min(rect.width, rect.height);

    this.element.style.left = `${px - sizePx / 2}px`;
    this.element.style.top = `${py - sizePx / 2}px`;
    this.element.style.width = `${sizePx}px`;
    this.element.style.height = `${sizePx}px`;

    const deg = this.lastAngleRad * (180 / Math.PI);
    this.element.style.transform = `rotate(${deg}deg)`;
    this.element.style.filter = this.isOut ? "grayscale(100%)" : "none";
  }

  remove() {
  this.element?.remove();
}

  onResize() {
    if (this.initialized) this.updateRender();
  }

destroy() {
  
  if (this.element) {
    this.element.remove();
  }

delete frontendPlayers[this.id];

  delete frontendPlayers[this.id];
  this.hasScheduledDestroy = false;
  this.hasPlayedOutSound = false;
}

  syncFromServer(data: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    speed: number;
    size: number;
    isOut?: boolean;
    lastMouseX?: number;
    lastMouseY?: number;
    lastAngleRad?: number;
  }) {
    this.x = data.x;
    this.y = data.y;
    this.vx = data.vx;
    this.vy = data.vy;
    this.speed = data.speed;
    this.size = data.size;
    if (data.isOut !== undefined) this.isOut = data.isOut;
    if (data.lastMouseX !== undefined) this.lastMouseX = data.lastMouseX;
    if (data.lastMouseY !== undefined) this.lastMouseY = data.lastMouseY;
    if (data.lastAngleRad !== undefined) this.lastAngleRad = data.lastAngleRad;

    if (!this.initialized) {
      this.initialized = true;
      this.element.style.display = "block";
    }

    this.updateRender();
      }

  public initialize() {
    this.initialized = true;
    this.element.style.display = "block";
    this.updateRender();
  }

  setColor(color: string) {
    const validColors = ["red", "blue", "green", "yellow"];
    const safeColor = validColors.includes(color) ? color : "red";
    this.element.style.backgroundImage = `url("/src/assets/images/${safeColor}Sumo.png")`;
  }
}

