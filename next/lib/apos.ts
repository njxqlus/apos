import constants from "./constants.json";

export interface EnvironmentPreset {
  Frequency: { value: number; unit: string; note: string };
  Ca: { value: number; unit: string; note: string };
  N_cores: number;
  threading_model: string;
}

export interface ProtocolPreset {
  label: string;
  H: number;
  O_net: number;
  O_cpu: number;
  Cs: number;
}

export interface RuntimePreset {
  label: string;
  B_base: number;
  k_ser_json: number;
  k_ser_protobuf: number;
  k_ser_binary: number;
  k_net: number;
  scales_with_cores: boolean;
  sigma: number;
  tau: number;
}

export interface SimulationInputs {
  R: number; // Requests per second
  S: number; // Payload size in bytes
  R_new_conn?: number; // Rate of new connections (default to 0 for steady state)
  N_conn?: number; // Active persistent connections
  B_req?: number; // Per-request buffer size
  StateSize?: number; // State size per connection
  D_prop?: number; // Network propagation delay
}

export interface SimulationResult {
  T: number; // Throughput in bits/s
  rho: number; // CPU Utilization [0.0 - 1.0]
  L: number; // Latency in seconds
  M: number; // RAM Consumption in bytes
  N_active: number; // Concurrent active requests
}

export const getEnvironmentPresets = (): Record<string, EnvironmentPreset> => {
  // Current constants.json only has one environment object.
  // We'll wrap it in a record to match the shape expected by a selector.
  return {
    default: constants.environment_constants,
  };
};

export const getProtocolPresets = (): Record<string, ProtocolPreset> => {
  return constants.protocol_profiles as Record<string, ProtocolPreset>;
};

export const getRuntimePresets = (): Record<string, RuntimePreset> => {
  return constants.runtime_profiles as Record<string, RuntimePreset>;
};

// Simulation Engine
export const calculateSimulation = (
  env: EnvironmentPreset,
  protocol: ProtocolPreset,
  runtime: RuntimePreset,
  inputs: SimulationInputs,
): SimulationResult => {
  const {
    R,
    S,
    R_new_conn = 0, // Assumption: 0 new connections/sec in steady state
    N_conn = 100, // Assumption: 100 persistent connections
    B_req = S * 2, // Assumption: buffer size is roughly 2x payload size
    StateSize = 2048, // Assumption: 2KB state per connection
    D_prop = 0.05, // Assumption: 50ms propagation delay
  } = inputs;

  const { Frequency, Ca, N_cores } = env;
  const { H, O_net, O_cpu, Cs } = protocol;
  const { B_base, k_ser_json, k_net, scales_with_cores, sigma, tau } = runtime;

  // Assuming JSON serialization based on "REST / JSON" etc.
  // For a more advanced sim, we could select serialization type based on protocol label.
  const k_ser = k_ser_json;

  // 1. Network Throughput (T)
  const T = 8 * (R * (H + S) + R_new_conn * O_net);

  // Helper functions for CPU & Latency
  const getEta = (N_act: number) => 1 + sigma * Math.log(N_act + 1);

  const getRhoCalc = (N_act: number) => {
    const num = (R * (S * k_ser + k_net) + R_new_conn * O_cpu) * getEta(N_act);
    const den = Frequency.value * (scales_with_cores ? N_cores : 1);
    return num / den;
  };

  const getDProc = () => (S * k_ser + k_net) / Frequency.value;

  const getDQueue = (rho: number, D_proc: number) => {
    if (rho >= 1) return Infinity; // Saturation
    return (rho / (1 - rho)) * ((Ca.value ** 2 + Cs ** 2) / 2) * D_proc;
  };

  const D_proc = getDProc();

  // The formulas present a circular dependency if we strictly calculate D_proc -> rho -> L -> N_active -> M
  // However, \rho depends on N_active.
  // We can use fixed-point iteration to converge on N_active and \rho.
  // Seed N_active with base processing time (no queueing delay, no degradation)
  let N_active = R * D_proc;
  let rho = 0;
  let L = 0;

  // Fixed point iteration (usually converges very fast)
  for (let i = 0; i < 10; i++) {
    const rho_calc = getRhoCalc(N_active);
    rho = Math.min(1.0, rho_calc);

    const D_queue = getDQueue(rho, D_proc);
    L = D_prop + D_proc + D_queue;

    // Saturation
    if (rho === 1) {
      L = Infinity;
      N_active = Infinity;
      break;
    }

    // Update N_active for next iteration
    N_active = R * L;
  }

  // 3. RAM Consumption (M)
  const M =
    B_base +
    (N_active === Infinity ? Number.MAX_SAFE_INTEGER : N_active * B_req * tau) +
    N_conn * StateSize;

  return {
    T,
    rho,
    L,
    M,
    N_active,
  };
};
