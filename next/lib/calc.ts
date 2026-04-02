export type Protocol = "REST" | "gRPC" | "UDP" | "Kafka" | "AMQP";
export type ArchitectureTier =
  | "Native_Performance"
  | "Managed_Runtime"
  | "Enterprise_Abstraction";

export interface ProtocolConfig {
  overheadBytes: number;
  maxRpsPerCore: number;
  processingLatencyMs: number;
  cpuPayloadPenalty: number;
  baseRamMb: number;
  memoryFactor: number;
  isStateful: boolean;
}

export interface FrameworkConfig {
  cpuEfficiencyMultiplier: number;
  baseRamPenaltyMb: number;
  requestMemoryKb: number;
  latencyPenaltyMs: number;
}

export const PROTOCOL_CONFIGS: Record<Protocol, ProtocolConfig> = {
  REST: {
    overheadBytes: 500,
    maxRpsPerCore: 8000, // Reduced from 12k to be more realistic for TLS + minimal logic
    processingLatencyMs: 5,
    cpuPayloadPenalty: 0.95,
    baseRamMb: 128,
    memoryFactor: 1.1,
    isStateful: false,
  },
  gRPC: {
    overheadBytes: 50,
    maxRpsPerCore: 35000, // Adjusted from 45k
    processingLatencyMs: 2,
    cpuPayloadPenalty: 0.97,
    baseRamMb: 128,
    memoryFactor: 1.05,
    isStateful: false,
  },
  UDP: {
    overheadBytes: 28,
    maxRpsPerCore: 50000,
    processingLatencyMs: 1,
    cpuPayloadPenalty: 0.99,
    baseRamMb: 32,
    memoryFactor: 1.0,
    isStateful: false,
  },
  Kafka: {
    overheadBytes: 60,
    maxRpsPerCore: 80000, // Increased as it is primarily I/O bound
    processingLatencyMs: 5,
    cpuPayloadPenalty: 0.96,
    baseRamMb: 2048,
    memoryFactor: 1.3,
    isStateful: true,
  },
  AMQP: {
    overheadBytes: 300,
    maxRpsPerCore: 40000, // Increased as it is primarily I/O bound
    processingLatencyMs: 10,
    cpuPayloadPenalty: 0.94,
    baseRamMb: 1024,
    memoryFactor: 1.25,
    isStateful: true,
  },
};

export const FRAMEWORK_CONFIGS: Record<ArchitectureTier, FrameworkConfig> = {
  // Tier 1: Optimized for zero-cost abstractions and low latency
  Native_Performance: {
    cpuEfficiencyMultiplier: 0.95,
    baseRamPenaltyMb: 32,
    requestMemoryKb: 24, // Slight increase
    latencyPenaltyMs: 1,
  },

  // Tier 2: General-purpose runtimes with standard GC
  Managed_Runtime: {
    cpuEfficiencyMultiplier: 0.75,
    baseRamPenaltyMb: 200,
    requestMemoryKb: 80, // Increased to account for GC pressure and buffers
    latencyPenaltyMs: 8,
  },

  // Tier 3: High-level frameworks focused on developer productivity
  Enterprise_Abstraction: {
    cpuEfficiencyMultiplier: 0.35,
    baseRamPenaltyMb: 600,
    requestMemoryKb: 350, // Massive increase for thread stacks (200KB+) and JVM overhead
    latencyPenaltyMs: 25,
  },
};

export function calculateMetrics(
  protocol: Protocol,
  frameworkType: ArchitectureTier,
  rps: number,
  payloadBytes: number,
  networkRttMs: number = 30, // Default to 30ms for Internet
  isSecure: boolean = true,
  connectionReuse: boolean = true,
) {
  const config = PROTOCOL_CONFIGS[protocol];
  const framework = FRAMEWORK_CONFIGS[frameworkType];

  // 1. Connection and Security Modifiers
  // realistic TLS Factor table: 0.9 (keep-alive), 0.6 (new connection)
  const tlsFactor = isSecure ? (connectionReuse ? 0.9 : 0.6) : 1.0;
  const tlsLatency = isSecure ? networkRttMs * 0.5 : 0; // TLS handshake adds ~0.5-1 RTT overhead
  const tlsBytes = isSecure ? 80 : 0; // Typical TLS overhead per request (record header, padding, etc.)
  const connectionReuseFactor = connectionReuse ? 0.85 : 1.0; // 10-20% boost from reuse

  // 2. Bandwidth (Mbps)
  // formula: BW = RPS × (Payload + ProtocolOverhead + TLSOverhead) × 8
  const totalPacketBytes = payloadBytes + config.overheadBytes + tlsBytes;
  const bandwidthMbps = (rps * totalPacketBytes * 8) / 1_000_000;

  // 3. CPU (Cores)
  // formula: MaxRPS = ProtocolRPS × FrameworkEfficiency × TLSFactor
  // Stateful protocols (Kafka/AMQP) are I/O bound and bypass much of the framework overhead
  const frameworkEfficiency = config.isStateful
    ? Math.max(0.85, framework.cpuEfficiencyMultiplier)
    : framework.cpuEfficiencyMultiplier;

  // Initial maxRps per core calculation
  let maxRps = config.maxRpsPerCore * frameworkEfficiency * tlsFactor;

  // Apply connection reuse benefit (inverse of the factor to get ~17% boost)
  if (connectionReuse) {
    maxRps /= connectionReuseFactor;
  }

  // Payload size processing penalty (exponential decay after 10KB baseline)
  if (payloadBytes > 10240) {
    const blocks = Math.floor((payloadBytes - 10240) / 10240);
    maxRps *= Math.pow(config.cpuPayloadPenalty, blocks);
  }

  const cpuCores = Math.ceil(rps / Math.max(maxRps, 10));
  const utilization = rps / (cpuCores * maxRps);

  // 4. Latency (ms)
  // formula: Latency = RTT + Protocol + Framework + TLS
  const frameworkLat = framework.latencyPenaltyMs;
  let latencyMs =
    networkRttMs + config.processingLatencyMs + frameworkLat + tlsLatency;

  // Utilization-based latency growth (matches queueing theory behavior)
  if (utilization > 0.7) {
    latencyMs += (utilization - 0.7) * 50;
  }

  // 5. RAM (MB)
  // Concurrency = RPS × Latency / 1000
  // RAM = BaseRAM + Concurrency × RequestMemory
  const concurrency = (rps * latencyMs) / 1000;
  const requestMemoryMb = framework.requestMemoryKb / 1024;

  let baseRamMb = config.baseRamMb * config.memoryFactor;
  baseRamMb += framework.baseRamPenaltyMb;
  if (isSecure) baseRamMb += 64; // TLS session/buffer overhead

  const ramMb = baseRamMb + concurrency * requestMemoryMb;

  return {
    bandwidthMbps: Number(bandwidthMbps.toFixed(2)),
    cpuCores,
    ramMb: Math.ceil(ramMb),
    latencyMs: Math.round(latencyMs),
    utilization: Number(utilization.toFixed(2)),
  };
}
