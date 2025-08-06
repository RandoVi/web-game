import { Arenas } from "./arenas";
import { structures, destroyStructures } from "../structureManager";

export function loadArena(name: string) {
  
  for (const id of Object.keys(structures)) {
    destroyStructures(id);
  }

  
  const create = Arenas[name];
  if (create) {
    create();
  } else {
    console.warn(`Arena "${name}" not found`);
  }
}