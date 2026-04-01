# APOS Mathematical Foundation

This document defines the mathematical foundation for a protocol-agnostic resource simulator (APOS). These formulas establish the fundamental costs of a Unit of Communication based on first principles of Information Theory and Operating System resource management.

## 1. Network Throughput ($T$)

Defines the total bits transferred per second, accounting for active payload transfer and connection establishment overhead.

**Variables:**
- $S$: Raw Payload Size (bytes).
- $H$: Envelope/Header Overhead (fixed bytes per request).
- $R$: Requests per second (Rate).
- $R_{new\_conn}$: Rate of new connection establishment (connections per second).
- $O_{net}$: Connection establishment network overhead (handshakes/TLS negotiation in bytes).

**Formula:**
$$T = 8 \times [R \times (H + S) + (R_{new\_conn} \times O_{net})]$$

## 2. CPU Utilization ($\rho$)

Defines CPU utilization as a dimensionless ratio between 0 and 1, incorporating processing costs, system management, and degradation under concurrent load. It distinguishes between the arrival rate ($R$) and active concurrent requests ($N_{active}$), emphasizing that efficiency degradation is a function of system saturation.

**Variables:**
- $R$: Requests per second (Rate).
- $k_{ser}$: Serialization complexity coefficient (cycles/byte).
- $k_{net}$: Cost of packet handling/interrupts (cycles/request).
- $O_{cpu}$: Connection establishment computational overhead (cycles for handshakes/TLS).
- $R_{new\_conn}$: Rate of new connection establishment.
- $\eta(R)$: Efficiency Degradation Function, modeling context-switching and contention.
- $\text{Frequency}$: Processor clock frequency (cycles/s).

**Formula:**
$$\rho_{calc} = \frac{[R \times ((S \times k_{ser}) + k_{net}) + (R_{new\_conn} \times O_{cpu})] \times \eta(R)}{\text{Frequency}}$$

### Efficiency Degradation Function Definition
To model the non-linear overhead of OS task scheduling and context switching, $\eta(R)$ is defined as:
$$\eta(R) = 1 + \sigma \cdot \ln(R + 1)$$

Where:
- $1$: Represents the base efficiency (100% efficiency at zero/low load).
- $\sigma$: The "System Friction" coefficient (dimensionless), representing how much the OS struggles with concurrency for a specific protocol.
- $\ln(R + 1)$: The natural logarithm of the request rate, ensuring degradation starts logically and scales realistically without breaking at $R=0$.

**Saturation Ceiling:**
$$\rho = \min(1.0, \rho_{calc})$$

## 3. RAM Consumption ($M$)

Defines the memory footprint including persistent protocol stack buffers, per-request allocations, and state retention. To ensure dimensional rigor, transient buffer consumption relies on Little's Law, distinguishing between Requests per Second ($R$) and Concurrent Active Requests ($N_{active}$).

**Little's Law:**
$$N_{active} = R \times L$$

**Variables:**
- $B_{base}$: Fixed protocol stack memory.
- $B_{req}$: Per-request buffer size.
- $\tau$: Memory pressure/GC coefficient (higher for high-object-count abstractions).
- $N_{conn}$: Number of persistent concurrent active connections/streams.
- $N_{active}$: Count of currently processing concurrent requests (from Little's Law).
- $\text{StateSize}$: Memory retained per active connection state.

**Formula:**
$$M = B_{base} + (N_{active} \times B_{req} \times \tau) + (N_{conn} \times \text{StateSize})$$

## 4. Latency / Response Time ($L$)

Defines the total time elapsed from request initiation to completion, modeled as the summation of propagation, processing, and queueing delays.

**Variables:**
- $D_{prop}$: Propagation/Network delay.
- $D_{proc}$: Mean Service Time to process a request ($((S \times k_{ser}) + k_{net}) / \text{Frequency}$).
- $D_{queue}$: Queueing delay computed via Kingman's formula for system utilization.
- $\rho$: System Utilization (from CPU section).
- $C_a$: Coefficient of variation for inter-arrival times.
- $C_s$: Coefficient of variation for service times.

**Kingman's Formula for Queueing Delay:**
$$D_{queue} = \left( \frac{\rho}{1 - \rho} \right) \left( \frac{C_a^2 + C_s^2}{2} \right) D_{proc}$$

**Formula:**
$$L = D_{prop} + D_{proc} + D_{queue}$$

## 5. Parameter Reference Table

| Variable | Unit | Description |
| :--- | :--- | :--- |
| $T$ | bits/s | Total network throughput capacity required to sustain the communication unit. |
| $S$ | bytes | Raw application payload size per request. |
| $H$ | bytes | Fixed envelope and header overhead per request. |
| $R$ | $s^{-1}$ | Request arrival rate (Requests per second). |
| $N_{active}$ | dimensionless | Count of active concurrent requests in the system, derived via Little's Law. |
| $R_{new\_conn}$ | $s^{-1}$ | Rate of new connection establishment. |
| $O_{net}$ | bytes | Connection establishment network overhead, including cryptographic handshakes. |
| $O_{cpu}$ | cycles | Connection establishment computational overhead for TLS/Handshakes. |
| $\rho$ | dimensionless | Dimensionless CPU utilization ratio (0.0 to 1.0). |
| $k_{ser}$ | cycles/byte | Processing complexity required to serialize and deserialize structured data. |
| $k_{net}$ | cycles/req | Base computational cost of packet processing, system calls, and interrupts. |
| $\eta(R)$ | dimensionless | Efficiency degradation function modeling context-switching and contention. |
| $\sigma$ | dimensionless | The "System Friction" coefficient modeling OS struggle with concurrency. |
| $\text{Frequency}$ | cycles/s | Processor clock frequency driving the instruction execution rate. |
| $M$ | bytes | Total memory footprint to maintain communication state and buffers. |
| $B_{base}$ | bytes | Static memory allocation required for the protocol stack instance. |
| $B_{req}$ | bytes | Transient buffer memory required to process a single request. |
| $\tau$ | dimensionless | Multiplier for memory pressure and lifecycle management penalties. |
| $N_{conn}$ | dimensionless | Total count of persistent concurrent active connections or isolated streams. |
| $\text{StateSize}$ | bytes | Persistent memory allocation per active connection. |
| $L$ | seconds | End-to-end latency from request transmission to final processing. |
| $D_{prop}$ | seconds | Physical signal propagation and intermediary network delay. |
| $D_{proc}$ | seconds | Mean Service Time representing active request processing delay. |
| $D_{queue}$ | seconds | Queueing delay derived from Kingman's formula reflecting system congestion. |
| $C_a$ | dimensionless | Coefficient of variation for inter-arrival times. |
| $C_s$ | dimensionless | Coefficient of variation for service times. |