import { ModelMetrics, RouteRequest } from "./types";

export class CostAwareRouter {
  private routingTable: ModelMetrics[] = [];

  registerModel(model: ModelMetrics) {
    this.routingTable.push(model);
  }

  resolveRoute(request: RouteRequest): ModelMetrics {
    // Filter 1: Capability Match
    let eligibleRoutes = this.routingTable.filter(route => 
      request.requiredCapabilities.every(reqCap => route.capabilityTags.includes(reqCap))
    );

    if (eligibleRoutes.length === 0) {
      throw new Error(`No available routes for capabilities: ${request.requiredCapabilities.join(", ")}`);
    }

    // Filter 2: Cost Threshold
    if (request.maxCostPer1kTokens !== undefined) {
      eligibleRoutes = eligibleRoutes.filter(route => route.costPer1kTokens <= request.maxCostPer1kTokens!);
      if (eligibleRoutes.length === 0) {
         throw new Error("No available routes meet the cost constraints.");
      }
    }

    // Filter 3: Latency
    if (request.requireLowLatency) {
      const lowLatencyRoutes = eligibleRoutes.filter(r => r.latencyTier === "LOW");
      if (lowLatencyRoutes.length > 0) {
        eligibleRoutes = lowLatencyRoutes;
      }
    }

    // Sort by BGP-like algorithm:
    // 1. Highest LocalPref wins immediately
    // 2. Lowest cost wins tie-breakers
    eligibleRoutes.sort((a, b) => {
      const prefA = a.localPref || 0;
      const prefB = b.localPref || 0;
      
      if (prefA !== prefB) {
        return prefB - prefA; // Descending (Higher pref wins)
      }

      return a.costPer1kTokens - b.costPer1kTokens; // Ascending (Lower cost wins)
    });

    return eligibleRoutes[0];
  }
}
