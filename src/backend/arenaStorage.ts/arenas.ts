import { addStructure } from "../structureManager";


function arenaOne() {
    
    const rectCirclesR = 0.030
    const centerBodySpeed = -Math.PI/4 
    const radiusFromCenter = 0.23

        addStructure("center-rect1", {
        type: "rectangle",
        x: 0.5,
        y: 0.5,
        width: 0.025,
        height: 0.20,
        angle: 0,
        rotationSpeed: centerBodySpeed,
    });
    addStructure("center-rect2", {
        type: "rectangle",
        x: 0.5,
        y: 0.5,
        width: 0.20,
        height: 0.025,
        angle: 0,
        rotationSpeed: centerBodySpeed, 
    });
    addStructure("orbiting-circle-top", {
        type: "circle",
        radius: rectCirclesR,
        orbitRadius: radiusFromCenter,
        centerX: 0.5,
        centerY: 0.5,
        angle: -Math.PI / 2, 
        rotationSpeed: centerBodySpeed,
    });

    addStructure("orbiting-circle-bottom", {
        type: "circle",
        radius: rectCirclesR,
        orbitRadius: radiusFromCenter,
        centerX: 0.5,
        centerY: 0.5,
        angle: Math.PI / 2,  
        rotationSpeed: centerBodySpeed,
    });

    addStructure("orbiting-circle-left", {
        type: "circle",
        radius: rectCirclesR,
        orbitRadius: radiusFromCenter,
        centerX: 0.5,
        centerY: 0.5,
        angle: Math.PI,       
        rotationSpeed: centerBodySpeed,
    });

    addStructure("orbiting-circle-right", {
        type: "circle",
        radius: rectCirclesR,
        orbitRadius: radiusFromCenter,
        centerX: 0.5,
        centerY: 0.5,
        angle: 0,          
        rotationSpeed: centerBodySpeed,
    });
}

function arenaTwo() {
    const rectCirclesR = 0.030;
    const centerBodySpeed = -Math.PI / 4;
    const innerCirclesRadiusFromCenter = 0.15;
    const outerCirclesRadiusFromCenter = 0.35;

    addStructure("orbiting-circle-top", {
        type: "circle",
        radius: rectCirclesR,
        orbitRadius: innerCirclesRadiusFromCenter,
        centerX: 0.5,
        centerY: 0.5,
        angle: -Math.PI / 2,
        rotationSpeed: centerBodySpeed,
    });

    addStructure("orbiting-circle-bottom", {
        type: "circle",
        radius: rectCirclesR,
        orbitRadius: innerCirclesRadiusFromCenter,
        centerX: 0.5,
        centerY: 0.5,
        angle: Math.PI / 2,
        rotationSpeed: centerBodySpeed,
    });

    addStructure("orbiting-circle-left", {
        type: "circle",
        radius: rectCirclesR,
        orbitRadius: innerCirclesRadiusFromCenter,
        centerX: 0.5,
        centerY: 0.5,
        angle: Math.PI,
        rotationSpeed: centerBodySpeed,
    });

    addStructure("orbiting-circle-right", {
        type: "circle",
        radius: rectCirclesR,
        orbitRadius: innerCirclesRadiusFromCenter,
        centerX: 0.5,
        centerY: 0.5,
        angle: 0,
        rotationSpeed: centerBodySpeed,
    });

    addStructure("orbiting-circle-top-outer", {
        type: "circle",
        radius: rectCirclesR,
        orbitRadius: outerCirclesRadiusFromCenter,
        centerX: 0.5,
        centerY: 0.5,
        angle: -Math.PI / 2,
        rotationSpeed: centerBodySpeed,
    });

    addStructure("orbiting-circle-bottom-outer", {
        type: "circle",
        radius: rectCirclesR,
        orbitRadius: outerCirclesRadiusFromCenter,
        centerX: 0.5,
        centerY: 0.5,
        angle: Math.PI / 2,
        rotationSpeed: centerBodySpeed,
    });

    addStructure("orbiting-circle-left-outer", {
        type: "circle",
        radius: rectCirclesR,
        orbitRadius: outerCirclesRadiusFromCenter,
        centerX: 0.5,
        centerY: 0.5,
        angle: Math.PI,
        rotationSpeed: centerBodySpeed,
    });

    addStructure("orbiting-circle-right-outer", {
        type: "circle",
        radius: rectCirclesR,
        orbitRadius: outerCirclesRadiusFromCenter,
        centerX: 0.5,
        centerY: 0.5,
        angle: 0,
        rotationSpeed: centerBodySpeed,
    });

    addStructure("orbiting-circle-top-left", {
        type: "circle",
        radius: rectCirclesR,
        orbitRadius: outerCirclesRadiusFromCenter,
        centerX: 0.5,
        centerY: 0.5,
        angle: -3 * Math.PI / 4, 
        rotationSpeed: centerBodySpeed,
    });

    addStructure("orbiting-circle-top-right", {
        type: "circle",
        radius: rectCirclesR,
        orbitRadius: outerCirclesRadiusFromCenter,
        centerX: 0.5,
        centerY: 0.5,
        angle: -Math.PI / 4, 
        rotationSpeed: centerBodySpeed,
    });

    addStructure("orbiting-circle-bottom-left", {
        type: "circle",
        radius: rectCirclesR,
        orbitRadius: outerCirclesRadiusFromCenter,
        centerX: 0.5,
        centerY: 0.5,
        angle: 3 * Math.PI / 4, 
        rotationSpeed: centerBodySpeed,
    });

    addStructure("orbiting-circle-bottom-right", {
        type: "circle",
        radius: rectCirclesR,
        orbitRadius: outerCirclesRadiusFromCenter,
        centerX: 0.5,
        centerY: 0.5,
        angle: Math.PI / 4, 
        rotationSpeed: centerBodySpeed,
    });
}

function arenaThree() {
    const rectCirclesR = 0.030;
    const centerBodySpeed = -Math.PI / 4;
    const innerCirclesRadiusFromCenter = 0.15;
    const outerCirclesRadiusFromCenter = 0.395;

    addStructure("orbiting-circle-top", {
        type: "circle",
        radius: rectCirclesR,
        orbitRadius: innerCirclesRadiusFromCenter,
        centerX: 0.5,
        centerY: 0.5,
        angle: -Math.PI / 2,
        rotationSpeed: centerBodySpeed,
    });

    addStructure("orbiting-circle-bottom", {
        type: "circle",
        radius: rectCirclesR,
        orbitRadius: innerCirclesRadiusFromCenter,
        centerX: 0.5,
        centerY: 0.5,
        angle: Math.PI / 2,
        rotationSpeed: centerBodySpeed,
    });

    addStructure("orbiting-circle-left", {
        type: "circle",
        radius: rectCirclesR,
        orbitRadius: innerCirclesRadiusFromCenter,
        centerX: 0.5,
        centerY: 0.5,
        angle: Math.PI,
        rotationSpeed: centerBodySpeed,
    });

    addStructure("orbiting-circle-right", {
        type: "circle",
        radius: rectCirclesR,
        orbitRadius: innerCirclesRadiusFromCenter,
        centerX: 0.5,
        centerY: 0.5,
        angle: 0,
        rotationSpeed: centerBodySpeed,
    });

    const outerPositions = [
        { id: "top", angle: -Math.PI / 2 },
        { id: "bottom", angle: Math.PI / 2 },
        { id: "left", angle: Math.PI },
        { id: "right", angle: 0 },
        { id: "top-left", angle: -3 * Math.PI / 4 },
        { id: "top-right", angle: -Math.PI / 4 },
        { id: "bottom-left", angle: 3 * Math.PI / 4 },
        { id: "bottom-right", angle: Math.PI / 4 },
    ];

    for (const pos of outerPositions) {
        const angleToCenter = pos.angle + Math.PI + Math.PI / 2; 
        addStructure(`orbiting-rect-${pos.id}`, {
            type: "rectangle",
            width: 0.02,   
            height: 0.1, 
            orbitRadius: outerCirclesRadiusFromCenter,
            centerX: 0.5,
            centerY: 0.5,
            angle: angleToCenter,
            rotationSpeed: centerBodySpeed,
        });
    }
}

function arenaDefault() {
}
export const Arenas: Record<string, () => void> = {
    arenaDefault: arenaDefault,
    arena1: arenaOne,
    arena2: arenaTwo,
    arena3: arenaThree
};