export interface ModelMetrics {
  id: string;
  costPer1kTokens: number; // e.g. 0.15 for Flash, 15.0 for Pro
  latencyTier: "LOW" | "MEDIUM" | "HIGH"; // LOW = fast
  capabilityTags: string[]; // e.g. ["reasoning", "coding", "summarization"]
  localPref?: number; // Higher is preferred, overrides default cost-routing logic
}

export interface RouteRequest {
  taskDescription: string;
  requiredCapabilities: string[];
  maxCostPer1kTokens?: number;
  requireLowLatency?: boolean;
}
