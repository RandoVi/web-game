export type StructureType = "circle" | "rectangle"

export interface StructureOptions {
    id: string;
    type: StructureType;
    x?: number;
    y?: number;
    radius?: number;
    width?: number;
    height?: number;
    angle?: number;
    rotationSpeed?: number;
    orbitRadius?: number;
    centerX?: number;
    centerY?: number;
}

export class StructureEntity {
  public id: string;
  public type: StructureType;
  public x: number;
  public y: number;
  public angle: number;
  public rotationSpeed: number;
  public radius: number;
  public width: number;
  public height: number;
  public orbitRadius: number;
  public isActive = true;

    constructor(options: StructureOptions) {
    this.id = options.id;
    this.type = options.type;
    this.angle = options.angle ?? 0;
    this.rotationSpeed = options.rotationSpeed ?? 0;
    this.orbitRadius = options.orbitRadius ?? 0;

    if (options.type === "circle") {
      this.radius = options.radius ?? 0.05;
      this.width = this.height = this.radius * 2;
    } else {
      this.width = options.width ?? 0.1;
      this.height = options.height ?? 0.05;
      this.radius = Math.max(this.width, this.height) / 2;
    }

    const cx = options.centerX ?? 0.5;
    const cy = options.centerY ?? 0.5;
    if (this.orbitRadius > 0) {
      this.x = cx + Math.cos(this.angle) * this.orbitRadius;
      this.y = cy + Math.sin(this.angle) * this.orbitRadius;
    } else {
      this.x = options.x ?? cx;
      this.y = options.y ?? cy;
    }
  }

    update(delta: number, centerX = 0.5, centerY = 0.5) {
        this.angle += this.rotationSpeed * delta;
        if (this.angle > Math.PI * 2) this.angle -= Math.PI * 2;

        if (this.orbitRadius > 0) {
        this.x = centerX + Math.cos(this.angle) * this.orbitRadius;
        this.y = centerY + Math.sin(this.angle) * this.orbitRadius;
        }
    }

    move(dx: number, dy: number) { //units this frame
        this.x += dx; 
        this.y += dy;
    }

  //https://www.youtube.com/watch?v=oOEnWQZIePs bcs its complicated.
  getCollisionNormal(player: { x: number; y: number; size: number }): { nx: number; ny: number; penetration: number } | null {
    const playerRadius = player.size / 2;

    if (this.type === 'circle') {
        //finding vector from circle to player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        //squared distance between their centers
        const distSqr = dx*dx + dy*dy;
        //the distance where they touch
        const radiusSum = this.radius + playerRadius;

        //collision check : distSqr < radiusSum*radiusSUm = overlap
        if (distSqr < radiusSum * radiusSum) {
            //actual distance between centers(needed to normalize vector)
            const dist = Math.sqrt(distSqr) || 1;
            /* Normal vector: (dx/dist, dy/dist) - direction from stucture to player
            Penetration is number of how much the player is inside the structure */
            const penetration = radiusSum - dist;
            return { nx: dx / dist, ny: dy / dist, penetration };
        }
        return null;
    } else /*rectangle (rotated) are a bit tricky because they rotate, thats why I added video for reference*/ {

        /**Goal here is to transform player cordinates int rectange-local space to make collision check
         * easier
         */
        const cos = Math.cos(-this.angle);
        const sin = Math.sin(-this.angle);
        const localX = cos * (player.x - this.x) - sin * (player.y - this.y);
        const localY = sin * (player.x - this.x) + cos * (player.y - this.y);

        /**Find closest point on rectangle. Following line clamp the players local pos to the rectangle
         * bounds.
         * closestX, closestY are the closest point on rectangle edges to the player
         */
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;

        const closestX = Math.max(-halfWidth, Math.min(localX, halfWidth));
        const closestY = Math.max(-halfHeight, Math.min(localY, halfHeight));

        /**Collision check
         * We find vector from closest point to player,
         * get squared distance from rect to player.
         */
        const dx = localX - closestX;
        const dy = localY - closestY;
        const distSqr = dx*dx + dy*dy;

        /**Check if circle intersects the rectangle. */
        if (distSqr <= playerRadius * playerRadius) {
            const dist = Math.sqrt(distSqr) || 1;
            const penetration = playerRadius - dist;

            /**Compute normal vector to figure out which rectangle edge collision is on 
             * epsilon is used to add tiny tolerance to avoid floating point errors. 
             * if the collision is at a rectangle corner, normal is the vector from closest point to player
            */
            let normalX = 0;
            let normalY = 0;
            const epsilon = 1e-6;

            if (Math.abs(closestX - halfWidth) < epsilon) normalX = 1;
            else if (Math.abs(closestX + halfWidth) < epsilon) normalX = -1;

            if (Math.abs(closestY - halfHeight) < epsilon) normalY = 1;
            else if (Math.abs(closestY + halfHeight) < epsilon) normalY = -1;

            if (normalX === 0 && normalY === 0) {
                normalX = dx / dist;
                normalY = dy / dist;
            }

            /**
             * Rotate normal back to world space from rectangle local space*/
            const worldNx = cos * normalX + sin * normalY;
            const worldNy = -sin * normalX + cos * normalY;

            return { nx: worldNx, ny: worldNy, penetration };
        }
        return null;
    }
}

}

export type StructureData = {
    id: string;
    x: number;
    y: number;
    angle: number;
    radius: number;
    rotationSpeed: number;
    size: number;
    isActive: boolean;
}