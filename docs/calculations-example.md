# APOS Formulas: Step-by-Step Manual Trace

This document provides a high-density technical walkthrough of the APOS mathematical foundation, evaluating a Small Request Scenario. The calculations demonstrate the application of the defined theoretical constructs to derive core system metrics, establishing foundational insights into resource saturation and scaling behavior.

## Scenario Parameters

The following parameters define the operational scenario and the underlying system environment:

- $S = 1024$ (Payload Size, bytes)
- $R = 2000$ (Request Rate, $s^{-1}$)
- $R_{new\_conn} = 100$ (Connection Rate, $s^{-1}$)
- $D_{prop} = 0.05$ (Propagation Delay, seconds)

**Protocol Profile Coefficients:**
- $H = 500$ (Header Overhead, bytes)
- $k_{ser} = 1.2$ (Serialization Complexity, cycles/byte)
- $k_{net} = 5000$ (Packet Handling Cost, cycles/request)
- $O_{net} = 1200$ (Connection Establishment Network Overhead, bytes)
- $O_{cpu} = 150000$ (Connection Establishment CPU Overhead, cycles)
- $\sigma = 0.08$ (System Friction Coefficient)
- $\tau = 1.5$ (Memory Pressure/GC Coefficient)
- $C_s = 1.2$ (Service Time Coefficient of Variation)

**Environment Constants:**
- $\text{Frequency} = 3 \times 10^9$ (Processor Clock Frequency, cycles/s)
- $B_{base} = 50,000,000$ (Base Protocol Stack Memory, bytes)
- $C_a = 1.0$ (Arrival Time Coefficient of Variation)

---

## 1. Network Throughput ($T$)

The total network throughput defines the bits transferred per second, accounting for active payloads and connection establishment overheads.

$$T = 8 \times [R \times (H + S) + (R_{new\_conn} \times O_{net})]$$

Substituting the defined parameters:

$$T = 8 \times [2000 \times (500 + 1024) + (100 \times 1200)]$$
$$T = 8 \times [2000 \times 1524 + 120000]$$
$$T = 8 \times [3048000 + 120000]$$
$$T = 8 \times 3168000$$
$$T = 25,344,000 \text{ bits/s}$$

---

## 2. Service Time ($D_{proc}$)

The mean service time represents the active processing delay per request within the CPU.

$$D_{proc} = \frac{(S \times k_{ser}) + k_{net}}{\text{Frequency}}$$

Substituting the constants:

$$D_{proc} = \frac{(1024 \times 1.2) + 5000}{3 \times 10^9}$$
$$D_{proc} = \frac{1228.8 + 5000}{3 \times 10^9}$$
$$D_{proc} = \frac{6228.8}{3 \times 10^9}$$
$$D_{proc} \approx 2.07627 \times 10^{-6} \text{ seconds}$$

---

## 3. CPU Utilization ($\rho$)

System CPU utilization incorporates baseline processing costs and nonlinear concurrency degradation. Evaluating this metric introduces a circular dependency involving Active Concurrency ($N_{active}$), Queueing Delay ($D_{queue}$), and System Utilization ($\rho$). To rigorously break this circularity, we establish an initial bound for $N_{active}$ based exclusively on propagation delay, $N_{active} \approx R \times D_{prop}$, acknowledging that queueing delays under low saturation are negligible.

**Initial Concurrency Estimate:**
$$N_{active} \approx 2000 \times 0.05 = 100$$

**Efficiency Degradation Function ($\eta$):**
$$\eta(100) = 1 + \sigma \cdot \ln(N_{active} + 1)$$
$$\eta(100) = 1 + 0.08 \times \ln(101)$$
$$\eta(100) = 1 + 0.08 \times 4.61512$$
$$\eta(100) = 1 + 0.36921 = 1.36921$$

**Baseline CPU Utilization Calculation:**
$$\rho_{calc} = \frac{[R \times ((S \times k_{ser}) + k_{net}) + (R_{new\_conn} \times O_{cpu})] \times \eta(100)}{\text{Frequency}}$$
$$\rho_{calc} = \frac{[2000 \times 6228.8 + (100 \times 150000)] \times 1.36921}{3 \times 10^9}$$
$$\rho_{calc} = \frac{[12457600 + 15000000] \times 1.36921}{3 \times 10^9}$$
$$\rho_{calc} = \frac{27457600 \times 1.36921}{3 \times 10^9}$$
$$\rho_{calc} = \frac{37595209.696}{3 \times 10^9} \approx 0.01253$$

Applying the saturation ceiling:
$$\rho = \min(1.0, 0.01253) = 0.01253$$

---

## 4. Total Latency ($L$)

Total latency is modeled as the summation of propagation, processing, and queueing delays.

**Queueing Delay ($D_{queue}$) via Kingman's Formula:**
$$D_{queue} = \left( \frac{\rho}{1 - \rho} \right) \left( \frac{C_a^2 + C_s^2}{2} \right) D_{proc}$$

Substituting the required parameters:
$$D_{queue} = \left( \frac{0.01253}{1 - 0.01253} \right) \left( \frac{1.0^2 + 1.2^2}{2} \right) (2.07627 \times 10^{-6})$$
$$D_{queue} = \left( \frac{0.01253}{0.98747} \right) \left( \frac{1.0 + 1.44}{2} \right) (2.07627 \times 10^{-6})$$
$$D_{queue} = (0.01269) \times (1.22) \times (2.07627 \times 10^{-6})$$
$$D_{queue} \approx 3.214 \times 10^{-8} \text{ seconds}$$

**Total Latency:**
$$L = D_{prop} + D_{proc} + D_{queue}$$
$$L = 0.05 + (2.07627 \times 10^{-6}) + (3.214 \times 10^{-8})$$
$$L \approx 0.0500021 \text{ seconds}$$

---

## 5. Active Concurrency ($N_{active}$)

Deriving the formal Active Concurrency utilizes Little's Law, representing the precise volume of persistent state managed by the system simultaneously.

$$N_{active} = R \times L$$
$$N_{active} = 2000 \times 0.0500021$$
$$N_{active} \approx 100.0042$$

*(Note: Recalculating $\eta(100.0042)$ yields nominal variance, confirming iterative convergence.)*

---

## 6. Total RAM ($M$)

Memory consumption defines the collective allocation footprint required for protocol state, transient processing buffers, and fixed execution requirements. Where fundamental variables strictly depend on architectural deployment configurations (specifically $B_{req}$, $N_{conn}$, and $\text{StateSize}$), these are rigorously maintained as algebraic constants.

$$M = B_{base} + (N_{active} \times B_{req} \times \tau) + (N_{conn} \times \text{StateSize})$$

Substituting the established metrics:
$$M = 50,000,000 + (100.0042 \times B_{req} \times 1.5) + (N_{conn} \times \text{StateSize})$$
$$M = 50,000,000 + (150.0063 \times B_{req}) + (N_{conn} \times \text{StateSize})$$

This formalized expression constitutes the analytical model for memory scaling behavior under the specified load constraints.