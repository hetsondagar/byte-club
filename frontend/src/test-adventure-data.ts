// Quick test to verify adventure map data loads correctly
import { adventureNodes, getNodeById, isNodeUnlocked } from "./data/adventureMapData";

console.log("=== ADVENTURE MAP DATA TEST ===");
console.log("Total nodes:", adventureNodes.length);
console.log("First node:", adventureNodes[0]);
console.log("Last node:", adventureNodes[adventureNodes.length - 1]);
console.log("Node 1 by ID:", getNodeById(1));
console.log("Is node 1 unlocked (empty completed):", isNodeUnlocked(1, []));
console.log("Is node 2 unlocked (empty completed):", isNodeUnlocked(2, []));
console.log("Is node 2 unlocked (1 completed):", isNodeUnlocked(2, [1]));
console.log("=== TEST COMPLETE ===");

