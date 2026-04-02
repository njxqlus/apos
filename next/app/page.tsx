"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Settings2,
  Activity,
  Zap,
  Cpu,
  HardDrive,
  BarChart3,
  HelpCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PROTOCOL_CONFIGS, calculateMetrics, Protocol } from "@/lib/calc";

const METRIC_DESCRIPTIONS = {
  bandwidth: {
    title: "Network Bandwidth",
    description:
      "The total network throughput required to handle the given RPS and payload size. This includes the request payload, response data, and estimated protocol-specific overhead (headers, framing, etc.) in both directions.",
  },
  cpuCores: {
    title: "CPU Cores",
    description:
      "The estimated number of virtual CPU cores (vCPUs) required to process the workload. This takes into account protocol-specific parsing efficiency and a penalty for larger payloads that require more processing time per byte.",
  },
  ram: {
    title: "Memory Allocation",
    description:
      "The estimated RAM footprint of the infrastructure. For stateless protocols, this is based on in-flight requests and their payload sizes. For stateful protocols (like Kafka/AMQP), it adds baseline overhead and message buffering requirements.",
  },
  latency: {
    title: "Network Latency",
    description:
      "The projected end-to-end response time. This includes network round-trip time (RTT), protocol internal processing latency, and additional queuing delays that occur when CPU utilization exceeds 70%.",
  },
  utilization: {
    title: "CPU Utilization",
    description:
      "The average processor load across all allocated cores. Maintaining utilization below 70-80% is recommended to prevent 'tail latency' spikes where queuing delays cause unpredictable slow responses.",
  },
};

function MetricHelp({ metric }: { metric: keyof typeof METRIC_DESCRIPTIONS }) {
  const { title, description } = METRIC_DESCRIPTIONS[metric];
  return (
    <Dialog>
      <DialogTrigger
        className="ml-1.5 inline-flex items-center justify-center rounded-full text-muted-foreground/40 hover:text-primary transition-colors focus:outline-none p-0.5"
        aria-label={`About ${title}`}
      >
        <HelpCircle className="w-3 h-3" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-border/50 bg-popover shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <HelpCircle className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle className="text-lg font-bold tracking-tight uppercase">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground font-mono">
            {description}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

const RPS_PRESETS = [
  { label: "100", value: 100 },
  { label: "1K", value: 1000 },
  { label: "10K", value: 10000 },
  { label: "25K", value: 25000 },
  { label: "50K", value: 50000 },
  { label: "100K", value: 100000 },
  { label: "250K", value: 250000 },
  { label: "500K", value: 500000 },
];

const PAYLOAD_PRESETS = [
  { label: "0.5 KB", value: 512 },
  { label: "1 KB", value: 1024 },
  { label: "2 KB", value: 2048 },
  { label: "5 KB", value: 5120 },
  { label: "10 KB", value: 10240 },
  { label: "25 KB", value: 25600 },
  { label: "50 KB", value: 51200 },
  { label: "100 KB", value: 102400 },
  { label: "250 KB", value: 256000 },
  { label: "500 KB", value: 512000 },
  { label: "1 MB", value: 1048576 },
];

export default function Home() {
  const [rps, setRps] = React.useState(10000);
  const [payloadSize, setPayloadSize] = React.useState(1024);

  const handleRpsChange = (val: number | readonly number[]) => {
    const value = Array.isArray(val) ? val[0] : val;
    setRps(value);
  };

  const handlePayloadChange = (val: number | readonly number[]) => {
    const value = Array.isArray(val) ? val[0] : val;
    setPayloadSize(value);
  };

  const onInputChange =
    (
      setter: React.Dispatch<React.SetStateAction<number>>,
      min: number,
      max: number,
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      if (isNaN(val)) return setter(min);
      setter(Math.min(max, Math.max(min, val)));
    };

  const results = React.useMemo(() => {
    return Object.keys(PROTOCOL_CONFIGS).map((p) => {
      const protocol = p as Protocol;
      return {
        protocol,
        metrics: calculateMetrics(protocol, rps, payloadSize),
      };
    });
  }, [rps, payloadSize]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-6 font-mono">
      <Card className="relative w-full max-w-6xl border-border/50 bg-card/95 shadow-2xl transition-colors hover:border-primary/50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings2 className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-xl font-semibold tracking-tight uppercase">
              Configuration
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 py-5">
          {/* RPS Parameter */}
          <div className="group space-y-4">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <Label
                  htmlFor="rps"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors"
                >
                  Throughput (RPS)
                </Label>
                <div className="text-lg font-bold tracking-tighter text-foreground tabular-nums">
                  {rps.toLocaleString()}
                </div>
              </div>
              <div className="relative">
                <Input
                  id="rps"
                  type="number"
                  value={rps}
                  onChange={onInputChange(setRps, 1, 500000)}
                  className="w-36 h-10 border-border/50 bg-muted/30 pr-4 font-mono font-medium text-right focus-visible:ring-primary/30 transition-all hover:bg-muted/50"
                  min={1}
                  max={500000}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {RPS_PRESETS.map((p) => (
                <Button
                  key={p.value}
                  variant="outline"
                  size="sm"
                  className={`h-7 px-2.5 text-[10px] font-bold tracking-tighter transition-all ${
                    rps === p.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/10 text-muted-foreground/80 hover:bg-muted/30 border-border/40"
                  }`}
                  onClick={() => setRps(p.value)}
                >
                  {p.label}
                </Button>
              ))}
            </div>

            <div className="px-1 relative">
              <Slider
                value={[rps]}
                onValueChange={handleRpsChange}
                min={1}
                max={500000}
                step={1}
                className="cursor-pointer"
              />
              <div className="mt-2 flex justify-between px-0.5 text-[9px] text-muted-foreground/50 font-mono font-bold uppercase tracking-widest">
                <span>Min: 1</span>
                <span className="text-primary opacity-80">RPS SCALE</span>
                <span>Max: 500K</span>
              </div>
            </div>
          </div>

          {/* Payload Size Parameter */}
          <div className="group space-y-4">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <Label
                  htmlFor="payload"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors"
                >
                  Payload Size
                </Label>
                <div className="text-lg font-bold tracking-tighter text-foreground tabular-nums">
                  {payloadSize < 1024
                    ? `${payloadSize} B`
                    : payloadSize < 1048576
                      ? `${(payloadSize / 1024).toFixed(1)} KB`
                      : payloadSize < 1073741824
                        ? `${(payloadSize / 1048576).toFixed(1)} MB`
                        : `${(payloadSize / 1073741824).toFixed(1)} GB`}
                </div>
              </div>
              <div className="relative">
                <Input
                  id="payload"
                  type="number"
                  value={payloadSize}
                  onChange={onInputChange(setPayloadSize, 1, 1048576)}
                  className="w-36 h-10 border-border/50 bg-muted/30 pr-4 font-mono font-medium text-right focus-visible:ring-primary/30 transition-all hover:bg-muted/50"
                  min={1}
                  max={1048576}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {PAYLOAD_PRESETS.map((p) => (
                <Button
                  key={p.value}
                  variant="outline"
                  size="sm"
                  className={`h-7 px-2.5 text-[10px] font-bold tracking-tighter transition-all ${
                    payloadSize === p.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/10 text-muted-foreground/80 hover:bg-muted/30 border-border/40"
                  }`}
                  onClick={() => setPayloadSize(p.value)}
                >
                  {p.label}
                </Button>
              ))}
            </div>

            <div className="px-1 relative">
              <Slider
                value={[payloadSize]}
                onValueChange={handlePayloadChange}
                min={1}
                max={1048576}
                step={1}
                className="cursor-pointer"
              />
              <div className="mt-2 flex justify-between px-0.5 text-[9px] text-muted-foreground/50 font-mono font-bold uppercase tracking-widest">
                <span>Min: 1 B</span>
                <span className="text-primary opacity-80">Payload Scale</span>
                <span>Max: 1 MB</span>
              </div>
            </div>
          </div>
        </CardContent>

        <div className="absolute -bottom-px left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-50" />
      </Card>

      {/* Results Section */}
      <Card className="relative w-full max-w-6xl mt-8 border-border/50 bg-card/95 shadow-2xl transition-colors hover:border-primary/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-xl font-semibold tracking-tight uppercase">
              Infrastructure Estimation
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="py-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="pb-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Protocol
                  </th>
                  <th className="pb-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <BarChart3 className="w-3 h-3" />
                      Bandwidth
                      <MetricHelp metric="bandwidth" />
                    </div>
                  </th>
                  <th className="pb-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Cpu className="w-3 h-3" />
                      CPU Cores
                      <MetricHelp metric="cpuCores" />
                    </div>
                  </th>
                  <th className="pb-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <HardDrive className="w-3 h-3" />
                      RAM
                      <MetricHelp metric="ram" />
                    </div>
                  </th>
                  <th className="pb-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Activity className="w-3 h-3" />
                      Latency
                      <MetricHelp metric="latency" />
                    </div>
                  </th>
                  <th className="pb-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Activity className="w-3 h-3" />
                      CPU Util
                      <MetricHelp metric="utilization" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {results.map((res) => (
                  <tr
                    key={res.protocol}
                    className="group hover:bg-primary/5 transition-colors"
                  >
                    <td className="py-4 text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                      {res.protocol}
                    </td>
                    <td className="py-4 text-sm font-medium text-right tabular-nums text-foreground/80">
                      {res.metrics.bandwidthMbps.toLocaleString()}
                      <span className="ml-1 text-[10px] text-muted-foreground uppercase">
                        Mbps
                      </span>
                    </td>
                    <td className="py-4 text-sm font-medium text-right tabular-nums text-foreground/80">
                      {res.metrics.cpuCores}
                      <span className="ml-1 text-[10px] text-muted-foreground uppercase">
                        vCPU
                      </span>
                    </td>
                    <td className="py-4 text-sm font-medium text-right tabular-nums text-foreground/80">
                      {res.metrics.ramMb < 1024
                        ? `${res.metrics.ramMb} MB`
                        : `${(res.metrics.ramMb / 1024).toFixed(1)} GB`}
                    </td>
                    <td className="py-4 text-sm font-medium text-right tabular-nums text-foreground/80">
                      <span
                        className={`${
                          res.metrics.latencyMs > 50
                            ? "text-orange-500"
                            : "text-foreground/80"
                        }`}
                      >
                        {res.metrics.latencyMs}
                      </span>
                      <span className="ml-1 text-[10px] text-muted-foreground uppercase">
                        ms
                      </span>
                    </td>
                    <td className="py-4 text-sm font-medium text-right tabular-nums text-foreground/80">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 h-1 bg-muted/30 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{
                              width: `${res.metrics.utilization * 100}%`,
                            }}
                          />
                        </div>
                        <span>
                          {(res.metrics.utilization * 100)
                            .toFixed(0)
                            .padStart(3, "\u00A0")}
                          %
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <div className="absolute -bottom-px left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-50" />
      </Card>
    </div>
  );
}
