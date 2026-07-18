import { CostAwareRouter } from "../src";

const router = new CostAwareRouter();

// Register available LLM routes (like BGP neighbors announcing routes)
router.registerModel({
  id: "gemini-2.0-flash",
  costPer1kTokens: 0.15,
  latencyTier: "LOW",
  capabilityTags: ["summarization", "extraction", "basic_chat"],
  localPref: 100 // Default preferred route for basic tasks
});

router.registerModel({
  id: "llama-3.1-70b-instruct",
  costPer1kTokens: 0.85,
  latencyTier: "MEDIUM",
  capabilityTags: ["reasoning", "coding", "summarization", "extraction"],
  localPref: 50 // Backup / heavier route
});

router.registerModel({
  id: "gemini-2.0-pro",
  costPer1kTokens: 15.0,
  latencyTier: "MEDIUM",
  capabilityTags: ["complex_reasoning", "coding", "agent_planning"],
  localPref: 200 // Highest preference, but only selected if capabilities demand it
});

console.log("Routing a basic summarization task (Latency sensitive)...");
const route1 = router.resolveRoute({
  taskDescription: "Summarize a 5-page PDF",
  requiredCapabilities: ["summarization"],
  requireLowLatency: true
});
console.log(`Selected Model: ${route1.id} (Cost: $${route1.costPer1kTokens}/1k)`);

console.log("\nRouting a complex coding task (Cost constrained)...");
const route2 = router.resolveRoute({
  taskDescription: "Refactor a Python backend",
  requiredCapabilities: ["coding", "reasoning"],
  maxCostPer1kTokens: 1.0 // Prevents picking Pro model
});
console.log(`Selected Model: ${route2.id} (Cost: $${route2.costPer1kTokens}/1k)`);
