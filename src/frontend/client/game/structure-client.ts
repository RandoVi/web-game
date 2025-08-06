export class Structure {
  public id: string;
  public type: "circle" | "rectangle";
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public angle: number;
  public isActive: boolean;

  public element: HTMLDivElement;
  private container: HTMLElement;
  private initialized = false;

  constructor(
    id: string,
    type: "circle" | "rectangle",
    x: number,
    y: number,
    width: number,
    height: number,
    angle = 0,
    container: HTMLElement
  ) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.angle = angle;
    this.isActive = true;

    this.container = container;

    this.element = document.createElement("div");
    this.element.className = "structure";
    this.element.style.position = "absolute";
    this.element.style.transformOrigin = "50% 50%";
    this.element.style.zIndex= "100"
    this.element.style.border = "solid black 1px"

    if (type === "circle") {
  this.element.style.borderRadius = "50%";
  this.element.style.backgroundImage = 'url("/src/assets/images/circleObstruction.png")';
  this.element.style.backgroundRepeat = "no-repeat";
  this.element.style.backgroundSize = "contain";  // keeps image aspect ratio
  this.element.style.backgroundPosition = "center";
    } else {
       //rect
      this.element.style.backgroundColor = "#f5a022ff";
    }

    this.container.appendChild(this.element);

    this.syncFromServer({ id, type, x, y, width, height, angle, rotationSpeed: 0, isActive: true });
  }

  syncFromServer(data: {
    id: string;
    type: "circle" | "rectangle";
    x: number;
    y: number;
    width: number;
    height: number;
    angle: number;
    rotationSpeed: number;
    isActive: boolean;
  }) {
    this.type = data.type;
    this.x = data.x;
    this.y = data.y;
    this.width = data.width;
    this.height = data.height;
    this.angle = data.angle;
    this.isActive = data.isActive;

    if (!this.initialized) {
      this.initialized = true;
      this.element.style.display = "block";
    }

    this.updateRender();
  }

  updateRender() {
    if (!this.initialized) return;

    const rect = this.container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const px = this.x * rect.width;
    const py = this.y * rect.height;
    const widthPx = this.width * rect.width;
    const heightPx = this.height * rect.height;

    this.element.style.left = `${px - widthPx / 2}px`;
    this.element.style.top = `${py - heightPx / 2}px`;
    this.element.style.width = `${widthPx}px`;
    this.element.style.height = `${heightPx}px`;

    this.element.style.transform = `rotate(${this.angle * (180 / Math.PI)}deg)`;
    this.element.style.display = this.isActive ? "block" : "none";
  }

  onResize() {
    this.updateRender();
  }

    destroy() {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }
}
