// apos-simulator.ts

export type Protocol = "REST" | "gRPC" | "UDP" | "Kafka" | "AMQP";

export interface ProtocolConfig {
  // Network
  overheadBytes: number;
  responseMultiplier: number; // response size relative to request

  // CPU
  maxRpsPerCore: number;
  processingLatencyMs: number;
  cpuPayloadPenalty: number; // per 10KB block (e.g. 0.95)

  // Memory
  baseRamMb: number;
  memoryFactor: number; // inflight/queue overhead multiplier
  isStateful: boolean;
}

export const PROTOCOL_CONFIGS: Record<Protocol, ProtocolConfig> = {
  REST: {
    overheadBytes: 500,
    responseMultiplier: 1.5,
    maxRpsPerCore: 12000,
    processingLatencyMs: 15,
    cpuPayloadPenalty: 0.95,
    baseRamMb: 256,
    memoryFactor: 1.1,
    isStateful: false,
  },

  gRPC: {
    overheadBytes: 50,
    responseMultiplier: 1.2,
    maxRpsPerCore: 35000,
    processingLatencyMs: 5,
    cpuPayloadPenalty: 0.97,
    baseRamMb: 256,
    memoryFactor: 1.05,
    isStateful: false,
  },

  UDP: {
    overheadBytes: 28,
    responseMultiplier: 1.0,
    maxRpsPerCore: 150000,
    processingLatencyMs: 1,
    cpuPayloadPenalty: 0.99,
    baseRamMb: 64,
    memoryFactor: 1.0,
    isStateful: false,
  },

  Kafka: {
    overheadBytes: 60,
    responseMultiplier: 1.0,
    maxRpsPerCore: 60000,
    processingLatencyMs: 10,
    cpuPayloadPenalty: 0.96,
    baseRamMb: 2048,
    memoryFactor: 1.3,
    isStateful: true,
  },

  AMQP: {
    overheadBytes: 300,
    responseMultiplier: 1.0,
    maxRpsPerCore: 25000,
    processingLatencyMs: 20,
    cpuPayloadPenalty: 0.94,
    baseRamMb: 1024,
    memoryFactor: 1.25,
    isStateful: true,
  },
};

export interface CalculationResult {
  bandwidthMbps: number;
  cpuCores: number;
  ramMb: number;
  latencyMs: number;
  utilization: number;
}

/**
 * Generic infrastructure estimation
 *
 * Assumptions:
 * - baseline: modern Go/Rust backend on standard cloud VM
 * - RTT includes network propagation and routing
 * - CPU scales linearly with cores
 */
export function calculateMetrics(
  protocol: Protocol,
  rps: number,
  payloadBytes: number,
  networkRttMs: number = 20,
  queueSizeMessages: number = 0,
): CalculationResult {
  const config = PROTOCOL_CONFIGS[protocol];

  // -----------------------------
  // 1. Bandwidth
  // -----------------------------
  const responseBytes = payloadBytes * config.responseMultiplier;

  const totalBytesPerRequest =
    payloadBytes + responseBytes + config.overheadBytes * 2;

  const bandwidthMbps = (rps * totalBytesPerRequest * 8) / 1_000_000;

  // -----------------------------
  // 2. CPU
  // -----------------------------
  let maxRps = config.maxRpsPerCore;

  if (payloadBytes > 10240) {
    const blocks = Math.floor((payloadBytes - 10240) / 10240);
    maxRps *= Math.pow(config.cpuPayloadPenalty, blocks);
    maxRps = Math.max(100, maxRps);
  }

  const cpuCores = Math.ceil(rps / maxRps);

  const utilization = rps / (cpuCores * maxRps);

  // -----------------------------
  // 3. RAM
  // -----------------------------
  let ramMb = config.baseRamMb;

  if (config.isStateful) {
    const queueRam =
      (queueSizeMessages * payloadBytes * config.memoryFactor) / 1048576;

    ramMb += queueRam;
  } else {
    const avgLatencySeconds =
      (networkRttMs + config.processingLatencyMs) / 1000;

    const inflightRequests = rps * avgLatencySeconds;

    const inflightRam =
      (inflightRequests * totalBytesPerRequest * config.memoryFactor) / 1048576;

    ramMb += inflightRam;
  }

  ramMb = Math.ceil(ramMb);

  // -----------------------------
  // 4. Latency
  // -----------------------------
  let latencyMs = networkRttMs + config.processingLatencyMs;

  if (utilization > 0.7) {
    const penalty = (utilization - 0.7) * 50;
    latencyMs += penalty;
  }

  latencyMs = Math.round(latencyMs);

  return {
    bandwidthMbps: Number(bandwidthMbps.toFixed(2)),
    cpuCores,
    ramMb,
    latencyMs,
    utilization: Number(utilization.toFixed(2)),
  };
}
