# LLM Cost Router

[![npm version](https://badge.fury.io/js/llm-cost-router.svg)](https://badge.fury.io/js/llm-cost-router)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A lightweight, deterministic router for Agentic AI workflows that applies BGP-inspired Local Preference scoring to route LLM queries to the most cost-effective and capable model.

## The Problem

When building multi-agent systems, routing every task to a frontier model (like GPT-4o or Gemini Pro) results in massive token inflation. Conversely, hardcoding `if/else` logic for model selection becomes unmaintainable as new models drop weekly.

## The Solution (Borrowed from Network Engineering)

In BGP (Border Gateway Protocol), routers select paths based on deterministic metrics like `LocalPref` and `AS-Path` length. `llm-cost-router` applies this exact logic to LLM selection.

Instead of hardcoding paths, you announce "routes" (Models) with their specific Capabilities, Cost, Latency, and a Local Preference score. The router dynamically selects the best path for every prompt.

### Routing Logic
1. **Capability Match:** Filters out any models that lack the required tags (e.g., drops `Flash` if `complex_reasoning` is required).
2. **Cost Gate:** Drops models exceeding the `maxCostPer1kTokens` limit.
3. **Latency Check:** Favors `LOW` latency models if speed is requested.
4. **BGP Tie-Breaker:** 
   - Highest `localPref` wins immediately.
   - If tied, lowest token cost wins.

## Installation

```bash
npm install llm-cost-router
```

## Quick Start

```typescript
import { CostAwareRouter } from "llm-cost-router";

const router = new CostAwareRouter();

// Announce a cheap, fast route
router.registerModel({
  id: "gemini-2.0-flash",
  costPer1kTokens: 0.15,
  latencyTier: "LOW",
  capabilityTags: ["summarization", "basic_chat"],
  localPref: 100
});

// Announce an expensive, smart route
router.registerModel({
  id: "gemini-2.0-pro",
  costPer1kTokens: 15.0,
  latencyTier: "MEDIUM",
  capabilityTags: ["reasoning", "coding"],
  localPref: 50
});

// The router selects 'gemini-2.0-flash' because it meets the capabilities, 
// is cheaper, and has a higher LocalPref.
const route = router.resolveRoute({
  taskDescription: "Summarize a PDF",
  requiredCapabilities: ["summarization"]
});

console.log(`Routing to: ${route.id}`);
```

## Author

**Sachin Kumar Sharma**  
Agentic AI Platform Architect | Infrastructure Veteran (20yrs)  
[VirtualSach.in](https://virtualsach.in)
