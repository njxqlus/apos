"use client";

import { useState, useMemo } from "react";
import {
  getEnvironmentPresets,
  getProtocolPresets,
  getRuntimePresets,
  calculateSimulation,
} from "../lib/apos";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Slider } from "@base-ui-components/react/slider";

// Data
const envPresets = getEnvironmentPresets();
const protocolPresets = getProtocolPresets();
const runtimePresets = getRuntimePresets();

interface ActiveConfig {
  id: string;
  envId: string;
  protocolId: string;
  runtimeId: string;
}

export default function Simulator() {
  const [activeConfigs, setActiveConfigs] = useState<ActiveConfig[]>([]);

  // Selection state
  const [selectedEnv, setSelectedEnv] = useState("default");
  const [selectedProtocol, setSelectedProtocol] = useState(
    Object.keys(protocolPresets)[0],
  );
  const [selectedRuntime, setSelectedRuntime] = useState(
    Object.keys(runtimePresets)[0],
  );

  // Global inputs
  const [requestRateExp, setRequestRateExp] = useState(3); // R
  const [payloadSizeExp, setPayloadSizeExp] = useState(3.01); // S

  const requestRate = Math.round(Math.pow(10, requestRateExp));
  const payloadSize = Math.round(Math.pow(10, payloadSizeExp));

  const handleAddConfig = () => {
    setActiveConfigs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        envId: selectedEnv,
        protocolId: selectedProtocol,
        runtimeId: selectedRuntime,
      },
    ]);
  };

  const handleRemoveConfig = (id: string) => {
    setActiveConfigs((prev) => prev.filter((c) => c.id !== id));
  };

  // Compute results
  const results = useMemo(() => {
    return activeConfigs.map((config) => {
      const env = envPresets[config.envId];
      const protocol = protocolPresets[config.protocolId];
      const runtime = runtimePresets[config.runtimeId];

      const res = calculateSimulation(env, protocol, runtime, {
        R: requestRate,
        S: payloadSize,
      });

      return {
        ...res,
        config,
        env,
        protocol,
        runtime,
      };
    });
  }, [activeConfigs, requestRate, payloadSize]);

  // Find min/max for relative highlighting
  const stats = useMemo(() => {
    if (results.length === 0) return null;

    return {
      minT: Math.min(...results.map((r) => r.T)),
      maxT: Math.max(...results.map((r) => r.T)),
      minCpu: Math.min(...results.map((r) => r.rho)),
      maxCpu: Math.max(...results.map((r) => r.rho)),
      minLat: Math.min(...results.map((r) => r.L)),
      maxLat: Math.max(...results.map((r) => r.L)),
      minRam: Math.min(...results.map((r) => r.M)),
      maxRam: Math.max(...results.map((r) => r.M)),
      minAct: Math.min(...results.map((r) => r.N_active)),
      maxAct: Math.max(...results.map((r) => r.N_active)),
    };
  }, [results]);

  const formatThroughput = (bits: number) =>
    `${(bits / 1_000_000).toFixed(2)} Mbps`;
  const formatLatency = (sec: number) => {
    if (sec === Infinity) return "∞ ms";
    return `${(sec * 1000).toFixed(2)} ms`;
  };
  const formatRAM = (bytes: number) => {
    if (bytes >= Number.MAX_SAFE_INTEGER) return "OOM";
    return `${(bytes / 1_000_000_000).toFixed(3)} GB`;
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 font-mono text-xs flex flex-col gap-6">
      <header className="border-b border-zinc-800 pb-2">
        <h1 className="text-xl font-bold tracking-tight">
          APOS PROTOCOL RESOURCE SIMULATOR
        </h1>
      </header>

      {/* Section 1: Configuration Creator */}
      <section className="flex flex-wrap items-center gap-4 bg-zinc-950 border border-zinc-800 p-3 rounded-md">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 font-semibold uppercase">
            Environment
          </span>
          <Select
            value={selectedEnv}
            onValueChange={(val) => {
              if (val) setSelectedEnv(val);
            }}
          >
            <SelectTrigger className="w-[180px] h-8 text-xs bg-zinc-900 border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-xs">
              {Object.keys(envPresets).map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-400 font-semibold uppercase">
            Protocol
          </span>
          <Select
            value={selectedProtocol}
            onValueChange={(val) => {
              if (val) setSelectedProtocol(val);
            }}
          >
            <SelectTrigger className="w-[220px] h-8 text-xs bg-zinc-900 border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-xs">
              {Object.entries(protocolPresets).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-400 font-semibold uppercase">Runtime</span>
          <Select
            value={selectedRuntime}
            onValueChange={(val) => {
              if (val) setSelectedRuntime(val);
            }}
          >
            <SelectTrigger className="w-[280px] h-8 text-xs bg-zinc-900 border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-xs">
              {Object.entries(runtimePresets).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleAddConfig}
          size="sm"
          className="ml-auto h-8 bg-zinc-100 text-zinc-900 hover:bg-zinc-300 font-bold"
        >
          CREATE CONFIGURATION
        </Button>
      </section>

      {/* Section 3: Global Simulation Inputs */}
      <section className="bg-zinc-950 border border-zinc-800 p-4 rounded-md flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="font-semibold uppercase text-zinc-400">
            Request Rate (R)
          </div>
          <div className="font-bold text-sm">
            {requestRate.toLocaleString()} req/s
          </div>
        </div>
        <Slider.Root
          min={0}
          max={6}
          step={0.01}
          value={requestRateExp}
          onValueChange={(val: number | readonly number[]) =>
            setRequestRateExp(Array.isArray(val) ? val[0] : val)
          }
          className="flex w-full items-center touch-none select-none relative h-5"
        >
          <Slider.Control className="flex w-full items-center relative h-5">
            <Slider.Track className="bg-zinc-800 relative grow rounded-full h-[3px]">
              <Slider.Indicator className="absolute bg-zinc-400 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-4 h-4 bg-zinc-100 rounded-full shadow-[0_2px_10px] shadow-blackA4 hover:bg-zinc-300 focus:outline-none focus:shadow-[0_0_0_2px] focus:shadow-blackA7" />
          </Slider.Control>
        </Slider.Root>

        <div className="flex items-center justify-between mt-2">
          <div className="font-semibold uppercase text-zinc-400">
            Payload Size (S)
          </div>
          <div className="font-bold text-sm">
            {payloadSize.toLocaleString()} bytes
          </div>
        </div>
        <Slider.Root
          min={0}
          max={7}
          step={0.01}
          value={payloadSizeExp}
          onValueChange={(val: number | readonly number[]) =>
            setPayloadSizeExp(Array.isArray(val) ? val[0] : val)
          }
          className="flex w-full items-center touch-none select-none relative h-5"
        >
          <Slider.Control className="flex w-full items-center relative h-5">
            <Slider.Track className="bg-zinc-800 relative grow rounded-full h-[3px]">
              <Slider.Indicator className="absolute bg-zinc-400 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-4 h-4 bg-zinc-100 rounded-full shadow-[0_2px_10px] shadow-blackA4 hover:bg-zinc-300 focus:outline-none focus:shadow-[0_0_0_2px] focus:shadow-blackA7" />
          </Slider.Control>
        </Slider.Root>
      </section>

      {/* Section 2: Active Configuration Cards */}
      <section className="flex gap-4 overflow-x-auto pb-4">
        {results.map((res) => (
          <Card
            key={res.config.id}
            className="flex-shrink-0 w-80 h-[340px] bg-zinc-950 border-zinc-800 text-zinc-300 flex flex-col overflow-hidden p-0 gap-0"
            style={{ paddingBottom: 0, paddingTop: 0 }}
          >
            <CardHeader className="p-4 pb-2 border-b border-zinc-800 shrink-0">
              <CardTitle className="text-sm font-bold leading-tight">
                {res.protocol.label}
                <br />
                <span className="text-zinc-500 font-normal">
                  {res.runtime.label}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 text-[11px] space-y-2 overflow-y-auto">
              <div className="flex justify-between">
                <span className="text-zinc-500">H (Headers)</span>
                <span>{res.protocol.H} bytes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">O_net</span>
                <span>{res.protocol.O_net} bytes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">k_ser (JSON)</span>
                <span>{res.runtime.k_ser_json} cyc/B</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">k_net</span>
                <span>{res.runtime.k_net} cyc/req</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Sigma (\sigma)</span>
                <span>{res.runtime.sigma}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Tau (\tau)</span>
                <span>{res.runtime.tau}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">B_base</span>
                <span>{(res.runtime.B_base / 1000000).toFixed(1)} MB</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 mt-auto shrink-0 bg-zinc-950">
              <Button
                variant="destructive"
                size="sm"
                className="w-full h-7 text-xs"
                onClick={() => handleRemoveConfig(res.config.id)}
              >
                REMOVE
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>

      {/* Section 4: Comparative Results Table */}
      {results.length > 0 && (
        <section className="bg-zinc-950 border border-zinc-800 rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-900">
              <TableRow className="border-zinc-800 hover:bg-zinc-900">
                <TableHead className="text-zinc-400 font-bold">
                  CONFIGURATION
                </TableHead>
                <TableHead className="text-zinc-400 font-bold text-right">
                  THROUGHPUT (T)
                </TableHead>
                <TableHead className="text-zinc-400 font-bold text-right">
                  CPU (\rho)
                </TableHead>
                <TableHead className="text-zinc-400 font-bold text-right">
                  LATENCY (L)
                </TableHead>
                <TableHead className="text-zinc-400 font-bold text-right">
                  RAM (M)
                </TableHead>
                <TableHead className="text-zinc-400 font-bold text-right">
                  ACTIVE (N_act)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((res) => {
                const isMinT = res.T === stats?.minT;
                const isMaxT = res.T === stats?.maxT && results.length > 1;
                const isMinCpu = res.rho === stats?.minCpu;
                const isMaxCpu =
                  res.rho === stats?.maxCpu && results.length > 1;
                const isMinLat = res.L === stats?.minLat;
                const isMaxLat = res.L === stats?.maxLat && results.length > 1;
                const isMinRam = res.M === stats?.minRam;
                const isMaxRam = res.M === stats?.maxRam && results.length > 1;
                const isMinAct = res.N_active === stats?.minAct;
                const isMaxAct =
                  res.N_active === stats?.maxAct && results.length > 1;

                return (
                  <TableRow
                    key={res.config.id}
                    className="border-zinc-800 hover:bg-zinc-900/50"
                  >
                    <TableCell className="font-medium whitespace-nowrap">
                      {res.protocol.label}{" "}
                      <span className="text-zinc-500">|</span>{" "}
                      {res.runtime.label}
                    </TableCell>
                    <TableCell
                      className={`text-right whitespace-nowrap ${
                        isMaxT ? "bg-green-500/10 text-green-400" : ""
                      } ${isMinT ? "bg-red-500/10 text-red-400" : ""}`}
                    >
                      {formatThroughput(res.T)}
                    </TableCell>
                    <TableCell
                      className={`text-right whitespace-nowrap ${
                        isMinCpu ? "bg-green-500/10 text-green-400" : ""
                      } ${isMaxCpu ? "bg-red-500/10 text-red-400" : ""}`}
                    >
                      {(res.rho * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell
                      className={`text-right whitespace-nowrap ${
                        isMinLat ? "bg-green-500/10 text-green-400" : ""
                      } ${isMaxLat ? "bg-red-500/10 text-red-400" : ""}`}
                    >
                      {formatLatency(res.L)}
                    </TableCell>
                    <TableCell
                      className={`text-right whitespace-nowrap ${
                        isMinRam ? "bg-green-500/10 text-green-400" : ""
                      } ${isMaxRam ? "bg-red-500/10 text-red-400" : ""}`}
                    >
                      {formatRAM(res.M)}
                    </TableCell>
                    <TableCell
                      className={`text-right whitespace-nowrap ${
                        isMinAct ? "bg-green-500/10 text-green-400" : ""
                      } ${isMaxAct ? "bg-red-500/10 text-red-400" : ""}`}
                    >
                      {res.N_active === Infinity
                        ? "∞"
                        : Math.ceil(res.N_active)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>
      )}
    </div>
  );
}
