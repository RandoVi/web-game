// PlayerEntity.ts (shared server/client logic)

export class PlayerEntity {
  burstSpeed?: number;
  customDamping?: number;
  public id: string;
  public x: number;
  public y: number;
  public vx = 0;
  public vy = 0;

  /**Input based desired velocity */
  public inputVX = 0;
  public inputVY = 0;

  public speed = 0;
  public defaultSpeed = 0.35
  public size = 0.07;
  
  
  public username: string = 'no string found';
  public lastTouchedBy: string = 'no string found';
  public score: number = 0;
  public scoredOut: boolean = false;

  public isOut = false;

  public lastMouseX = 0;
  public lastMouseY = 0;

  public lastAngleRad = 0; 
  public isCharging = false
  public chargeStartTime = 0;
  public hasBurstApplied = false
  public burstTimer = 0

  constructor(id: string, username: string, x = 0, y = 0,) {
      this.id = id;
      this.x = x;
      this.y = y;
      this.speed = this.defaultSpeed;
      this.username = username;
  }

  setVelocity(vx: number, vy: number) {
      this.vx = vx;
      this.vy = vy;
  }

  stopMovement() {
      this.vx = 0;
      this.vy = 0;
  }

applyImpulse(angleRad: number, strength: number) {
  const vx = Math.cos(angleRad) * strength;
  
  const vy = Math.sin(angleRad) * strength;
  this.setVelocity(vx, vy);
  
  this.setRotation(angleRad);
    //     "[applyImpulse]",
    //     "strength:", strength.toFixed(4),
    //     "vx:", vx.toFixed(4),
    //     "vy:", vy.toFixed(4)
    // );
}

  startBurst(angleRad: number, chargeDurationMs: number) {
    const maxChargeTime = 500;  
    const chargeRatio = Math.min(chargeDurationMs / maxChargeTime, 1);
    const minStrength = 0.1;
    const maxStrength = 0.7;
    const curve = 2; 
    const chargeScaled = Math.pow(chargeRatio, curve);
    const strength = minStrength + chargeScaled * (maxStrength - minStrength);

    this.applyImpulse(angleRad, strength);

    this.burstTimer = 0.5; // seconds
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  move(dx: number, dy: number) { //units this frame
    this.x += dx; 
    this.y += dy;
  }

setRotation(angleRad: number) {
  const adjusted = angleRad + Math.PI / 2;

  let delta = adjusted - this.lastAngleRad;
  while (delta < -Math.PI) delta += 2 * Math.PI;
  while (delta >  Math.PI) delta -= 2 * Math.PI;

  this.lastAngleRad += delta; 
}

    checkArenaCollision() {
    const dx = this.x - 0.5;
    const dy = this.y - 0.5;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const arenaRadius = 0.43; // normalized
    const maxDistance = arenaRadius - this.size / 2;

    if (distance > maxDistance) {
      this.isOut = true;
    } else {
      this.isOut = false;
    }
  }

resolveCollisionWith(other: PlayerEntity) {
  const dx = other.x - this.x;
  const dy = other.y - this.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDistance = (this.size + other.size) / 2;

  if (distance < minDistance && distance > 0) {
    const overlap = minDistance - distance;

    // normal vector
    const nx = dx / distance;
    const ny = dy / distance;

    // --- Position correction (split evenly) ---
    const correction = overlap / 2;
    this.x -= nx * correction;
    this.y -= ny * correction;
    other.x += nx * correction;
    other.y += ny * correction;

    // --- Relative velocity along normal ---
    const rvx = other.vx - this.vx;
    const rvy = other.vy - this.vy;
    const velAlongNormal = rvx * nx + rvy * ny;

    // already moving apart
    if (velAlongNormal > 0) return;

    // --- Impulse scalar ---
    const restitution = 0.6; // less than 1 for softer bounce
    const impulseMag = -(1 + restitution) * velAlongNormal / 2; // divide by 2 since both have mass=1

    const impulseX = impulseMag * nx;
    const impulseY = impulseMag * ny;

    // --- Apply impulses ---
    this.vx -= impulseX;
    this.vy -= impulseY;
    other.vx += impulseX;
    other.vy += impulseY;

    // --- Tangential damping (friction-like) ---
    const friction = 0.98;
    this.vx *= friction;
    this.vy *= friction;
    other.vx *= friction;
    other.vy *= friction;
    /**Marks player with ID of collided player for scoring system */
    this.lastTouchedBy = other.id;
    other.lastTouchedBy = this.id;
  }
  }

  // delta is in seconds
  updatePosition(delta: number) {
    let moving = false;

    if (this.burstTimer > 0) {
        moving = true;
        this.burstTimer -= delta;
        if (this.burstTimer <= 0) {
            this.burstTimer = 0;
            this.stopMovement();
        }
    } else {
        this.vx += this.inputVX * delta;
        this.vy += this.inputVY * delta;

        // Apply small damping outside burst
        const dampingPerSecond = this.customDamping ?? 0.5;


        this.vx *= Math.pow(dampingPerSecond, delta);
        this.vy *= Math.pow(dampingPerSecond, delta);

        if (Math.abs(this.vx) < 0.001) this.vx = 0;
        if (Math.abs(this.vy) < 0.001) this.vy = 0;
    }

    // Integrate position
    this.move(this.vx * delta, this.vy * delta);

    // Clamp to arena
    this.x = Math.max(0, Math.min(1, this.x));
    this.y = Math.max(0, Math.min(1, this.y));
    this.checkArenaCollision();
  }
}



export type PlayerNetData = {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  defaultSpeed: number;
  size: number;
  score: number;
  isOut: boolean;
  lastMouseX: number;
  lastMouseY: number;
};