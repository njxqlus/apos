export type Protocol = "REST" | "gRPC" | "UDP" | "Kafka" | "AMQP" | "QUIC";
export type ArchitectureTier =
  | "Native_Performance"
  | "Managed_Runtime"
  | "Enterprise_Abstraction";

export interface ProtocolConfig {
  overheadBytes: number;
  maxRpsPerCore: number;
  processingLatencyMs: number;
  cpuPayloadPenalty: number;
  memoryBandwidthGbps: number;
  baseRamMb: number;
  memoryFactor: number;
  isStateful: boolean;
}

export interface FrameworkConfig {
  cpuEfficiencyMultiplier: number;
  baseRamPenaltyMb: number;
  ramPer1kRpsMb: number;
  latencyPenaltyMs: number;
}

export const PROTOCOL_CONFIGS: Record<Protocol, ProtocolConfig> = {
  REST: {
    overheadBytes: 500,
    maxRpsPerCore: 8000,
    processingLatencyMs: 5,
    cpuPayloadPenalty: 0.95,
    memoryBandwidthGbps: 2.0,
    baseRamMb: 128,
    memoryFactor: 1.1,
    isStateful: false,
  },
  gRPC: {
    overheadBytes: 50,
    maxRpsPerCore: 35000,
    processingLatencyMs: 2,
    cpuPayloadPenalty: 0.97,
    memoryBandwidthGbps: 1.4,
    baseRamMb: 128,
    memoryFactor: 1.05,
    isStateful: false,
  },
  UDP: {
    overheadBytes: 28,
    maxRpsPerCore: 50000,
    processingLatencyMs: 1,
    cpuPayloadPenalty: 0.98,
    memoryBandwidthGbps: 2.2,
    baseRamMb: 32,
    memoryFactor: 1.0,
    isStateful: false,
  },
  Kafka: {
    overheadBytes: 60,
    maxRpsPerCore: 80000,
    processingLatencyMs: 5,
    cpuPayloadPenalty: 0.96,
    memoryBandwidthGbps: 3.5,
    baseRamMb: 2048,
    memoryFactor: 1.3,
    isStateful: true,
  },
  AMQP: {
    overheadBytes: 300,
    maxRpsPerCore: 40000,
    processingLatencyMs: 10,
    cpuPayloadPenalty: 0.94,
    memoryBandwidthGbps: 2.5,
    baseRamMb: 1024,
    memoryFactor: 1.25,
    isStateful: true,
  },
  QUIC: {
    overheadBytes: 45,
    maxRpsPerCore: 32000,
    processingLatencyMs: 2,
    cpuPayloadPenalty: 0.96,
    memoryBandwidthGbps: 1.8,
    baseRamMb: 160,
    memoryFactor: 1.1,
    isStateful: false,
  },
};

export const FRAMEWORK_CONFIGS: Record<ArchitectureTier, FrameworkConfig> = {
  Native_Performance: {
    cpuEfficiencyMultiplier: 0.95,
    baseRamPenaltyMb: 32,
    ramPer1kRpsMb: 2,
    latencyPenaltyMs: 1,
  },
  Managed_Runtime: {
    cpuEfficiencyMultiplier: 0.75,
    baseRamPenaltyMb: 200,
    ramPer1kRpsMb: 12,
    latencyPenaltyMs: 8,
  },
  Enterprise_Abstraction: {
    cpuEfficiencyMultiplier: 0.35,
    baseRamPenaltyMb: 600,
    ramPer1kRpsMb: 45,
    latencyPenaltyMs: 25,
  },
};

const TARGET_UTILIZATION = 0.7;

export function calculateMetrics(
  protocol: Protocol,
  frameworkType: ArchitectureTier,
  rps: number,
  payloadBytes: number,
  networkRttMs: number = 30,
  isSecure: boolean = true,
  connectionReuse: boolean = true,
) {
  const config = PROTOCOL_CONFIGS[protocol];
  const framework = FRAMEWORK_CONFIGS[frameworkType];

  // 1. Connection and Security Modifiers
  const tlsFactor = isSecure ? (connectionReuse ? 0.9 : 0.6) : 1.0;
  const tlsLatency = isSecure ? networkRttMs * 0.5 : 0;
  const tlsBytes = isSecure ? 80 : 0;
  const connectionReuseFactor = connectionReuse ? 0.85 : 1.0;
  const tlsRamBase = isSecure ? 64 : 0;
  const tlsRamDynamic = isSecure ? 3 : 0;

  // 2. Bandwidth (Mbps)
  const totalPacketBytes = payloadBytes + config.overheadBytes + tlsBytes;
  const bandwidthMbps = (rps * totalPacketBytes * 8) / 1_000_000;

  // 3. CPU (Cores) - Memory Bandwidth Limited Model
  const segments = Math.ceil(payloadBytes / 1440);
  const reassemblyTax = segments > 1 ? Math.min(1 + segments * 0.12, 3.0) : 1;

  const frameworkEfficiency = config.isStateful
    ? Math.max(0.85, framework.cpuEfficiencyMultiplier)
    : framework.cpuEfficiencyMultiplier;

  // Limitation 1: Processing/Overhead Bound
  let maxRps =
    (config.maxRpsPerCore * frameworkEfficiency * tlsFactor) / reassemblyTax;
  if (connectionReuse) maxRps /= connectionReuseFactor;

  // Application-level payload processing penalty (Capped at 4 blocks)
  if (!config.isStateful && payloadBytes > 10240) {
    const blocks = Math.min(Math.floor((payloadBytes - 10240) / 10240), 4);
    maxRps *= Math.pow(config.cpuPayloadPenalty, blocks);
  }

  // Limitation 2: Memory Bandwidth Bound (structural ceiling for large payloads)
  if (payloadBytes > 32768) {
    const memBoundRps =
      (config.memoryBandwidthGbps * 1_000_000_000) / (payloadBytes * 8 || 8);
    maxRps = Math.min(maxRps, memBoundRps);
  }

  // Calculate Fractional Cores for Provisioning (UI)
  const idealCores = rps / Math.max(maxRps, 10);
  const cpuCores = Number((idealCores / TARGET_UTILIZATION).toFixed(2));

  // Calculate Physical Utilization to drive non-linear latency penalties
  // This represents the load on the nearest integer number of physical cores
  const physicalCores = Math.ceil(idealCores);
  const actualUtilization = idealCores / Math.max(physicalCores, 1);

  // 4. Latency (ms)
  const frameworkLat = framework.latencyPenaltyMs;
  let latencyMs =
    networkRttMs + config.processingLatencyMs + frameworkLat + tlsLatency;

  // Non-linear latency penalty based on actual physical core utilization
  if (actualUtilization > 0.7) {
    latencyMs += Math.pow(actualUtilization - 0.7, 2) * 500;
  }

  // 5. RAM (MB) - Advanced Heap Expansion Model
  let ramMb = config.baseRamMb * config.memoryFactor + tlsRamBase;

  if (!config.isStateful) {
    // 1. Static Framework Footprint
    ramMb += framework.baseRamPenaltyMb;

    // 2. The Payload Expansion Factor
    // Assumes payloads under 5KB do not heavily distort standard heap allocation
    const payloadExpansionFactor = Math.max(1, payloadBytes / 5120);

    // 3. Adjusted Dynamic Heap Bloat
    const adjustedRamPer1k = framework.ramPer1kRpsMb * payloadExpansionFactor;
    const dynamicRam = (rps / 1000) * (adjustedRamPer1k + tlsRamDynamic);

    // 4. Physical In-Flight Wire Bytes
    const avgLatencySeconds = latencyMs / 1000;
    const inflightRequests = rps * avgLatencySeconds;
    const inflightRam =
      (inflightRequests * totalPacketBytes * config.memoryFactor) / 1_048_576;

    ramMb += dynamicRam + inflightRam;
  } else {
    // Stateful behavior (Kafka/AMQP) is mostly governed by baseRam and concurrency-independent buffers
    ramMb += framework.baseRamPenaltyMb;

    // Throughput-based receive buffer scaling (unique to brokers)
    const throughputMBps = (rps * payloadBytes) / 1_000_000;
    ramMb += throughputMBps * 0.3;

    const concurrency = (rps * latencyMs) / 1000;
    ramMb += (concurrency * 100) / 1024; // Simple 100KB per request buffer for stateful messaging
  }

  // 6. Reliability Guard (Validity Cap)
  const workloadComplexity = rps * (payloadBytes / 1024);
  const isReliable = workloadComplexity <= 500000;
  let warning: string | undefined;

  if (!isReliable) {
    warning =
      "Extreme Workload: Results exceed typical architectural boundaries and should be treated as theoretical.";
  }

  return {
    bandwidthMbps: Math.round(bandwidthMbps),
    cpuCores,
    ramMb: Math.ceil(ramMb),
    latencyMs: Math.round(latencyMs),
    isReliable,
    warning,
  };
}
