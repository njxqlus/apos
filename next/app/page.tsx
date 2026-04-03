"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Settings2,
  Activity,
  Zap,
  Cpu,
  HardDrive,
  BarChart3,
  HelpCircle,
  Download,
  Clipboard,
  Check,
  Languages,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Disclaimer } from "@/components/Disclaimer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PROTOCOL_CONFIGS,
  FRAMEWORK_CONFIGS,
  calculateMetrics,
  Protocol,
  ArchitectureTier,
} from "@/lib/calc";

type MetricKey = "bandwidth" | "cpuCores" | "ram" | "latency" | "utilization";

function MetricHelp({ metric }: { metric: MetricKey }) {
  const { t } = useTranslation();
  const title = t(`metrics.${metric}.title`);
  const description = t(`metrics.${metric}.description`);
  return (
    <Dialog>
      <DialogTrigger
        className="ml-1.5 inline-flex items-center justify-center rounded-full text-muted-foreground/40 hover:text-primary transition-colors focus:outline-none p-0.5"
        aria-label={t("metric_help_aria", { title })}
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

function RuntimeHelp() {
  const { t } = useTranslation();
  return (
    <Dialog>
      <DialogTrigger
        className="ml-1.5 inline-flex items-center justify-center rounded-full text-muted-foreground/40 hover:text-primary transition-colors focus:outline-none p-0.5"
        aria-label={t("runtime_help_aria")}
      >
        <HelpCircle className="w-3 h-3" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] border-border/50 bg-popover shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings2 className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle className="text-lg font-bold tracking-tight uppercase">
              {t("runtime_architectures")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground font-mono">
            {t("runtime_choose_tier")}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 overflow-hidden rounded-lg border border-border/40">
          <table className="w-full text-left border-collapse font-mono text-[10px]">
            <thead>
              <tr className="bg-muted/30 border-b border-border/40 text-muted-foreground/80">
                <th className="p-3 font-bold uppercase">{t("tier")}</th>
                <th className="p-3 font-bold uppercase">
                  {t("characteristics")}
                </th>
                <th className="p-3 font-bold uppercase">{t("examples")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              <tr>
                <td className="p-3 font-bold text-primary whitespace-nowrap">
                  {t("native_compiled")}
                </td>
                <td className="p-3 text-muted-foreground">
                  {t("native_desc")}
                </td>
                <td className="p-3 text-foreground/70 italic whitespace-nowrap">
                  C++, Rust, Go, Zig
                </td>
              </tr>
              <tr className="bg-muted/10">
                <td className="p-3 font-bold text-primary whitespace-nowrap">
                  {t("managed_jit")}
                </td>
                <td className="p-3 text-muted-foreground">
                  {t("managed_desc")}
                </td>
                <td className="p-3 text-foreground/70 italic whitespace-nowrap">
                  Node.js, C#, Java
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-primary whitespace-nowrap">
                  {t("enterprise_abstracted")}
                </td>
                <td className="p-3 text-muted-foreground">
                  {t("enterprise_desc")}
                </td>
                <td className="p-3 text-foreground/70 italic whitespace-nowrap">
                  Spring Boot, Rails, Django
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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

import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const { t, i18n } = useTranslation();
  const [rps, setRps] = React.useState(10000);
  const [payloadSize, setPayloadSize] = React.useState(1024);
  const [framework, setFramework] =
    React.useState<ArchitectureTier>("Managed_Runtime");
  const [copied, setCopied] = React.useState(false);

  const currentLangId = i18n.resolvedLanguage || i18n.language || "en";

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

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
        metrics: calculateMetrics(protocol, framework, rps, payloadSize),
      };
    });
  }, [rps, payloadSize, framework]);

  const copyAsMarkdown = () => {
    const header = `| ${t("protocol")} | ${t("bandwidth")} (Mbps) | ${t("cpu_cores")} (vCPU) | ${t("ram")} | ${t("latency")} (ms) | ${t("cpu_util")} (%) |\n`;
    const separator = "| :--- | ---: | ---: | ---: | ---: | ---: |\n";
    const body = results
      .map((res) => {
        const ram =
          res.metrics.ramMb < 1024
            ? `${res.metrics.ramMb} MB`
            : `${(res.metrics.ramMb / 1024).toFixed(1)} GB`;
        const util = (res.metrics.utilization * 100).toFixed(0) + "%";
        return `| ${res.protocol} | ${res.metrics.bandwidthMbps.toLocaleString()} | ${res.metrics.cpuCores} | ${ram} | ${res.metrics.latencyMs} | ${util} |`;
      })
      .join("\n");

    const fwConfig = FRAMEWORK_CONFIGS[framework];
    const efficiency =
      (fwConfig.cpuEfficiencyMultiplier * 100).toFixed(0) + "%";

    const summary = [
      `- **${t("summary_framework")}:** ${t(framework)}`,
      `- **${t("summary_efficiency")}:** ${efficiency}`,
      `- **${t("summary_ram_penalty")}:** ${fwConfig.baseRamPenaltyMb} MB`,
      `- **${t("summary_workload")}:** ${rps.toLocaleString()} RPS`,
      `- **${t("summary_payload")}:** ${
        payloadSize < 1024
          ? `${payloadSize} B`
          : payloadSize < 1048576
            ? `${(payloadSize / 1024).toFixed(1)} KB`
            : `${(payloadSize / 1048576).toFixed(1)} MB`
      }`,
      "",
      header + separator + body,
    ].join("\n");

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-background p-4 sm:p-6 font-mono transition-colors duration-500">
      {/* Header Bar - Title & Switchers on same line */}
      <div className="w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 mt-4 sm:mt-0">
        <h1 className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground/90 text-center sm:text-left transition-all sm:pl-2">
          <span className="text-[#ff5023]">A</span>PI{" "}
          <span className="text-[#ff5023]">P</span>rotocol{" "}
          <span className="text-[#ff5023]">O</span>verhead{" "}
          <span className="text-[#ff5023]">S</span>imulator
        </h1>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "flex items-center gap-2 border-border/50 bg-card/90 text-[10px] font-bold tracking-widest uppercase hover:border-primary/50 group",
              )}
            >
              <Languages className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
              {currentLangId.toUpperCase()}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 border-border/50 bg-card/95 backdrop-blur-xl p-1.5 shadow-2xl"
            >
              {[
                { id: "en", label: "English" },
                { id: "es", label: "Español" },
                { id: "ru", label: "Русский" },
              ].map((lang) => (
                <DropdownMenuItem
                  key={lang.id}
                  onClick={() => changeLanguage(lang.id)}
                  className={`flex items-center justify-between rounded-md px-3 py-2 cursor-pointer transition-all duration-200 ${
                    currentLangId === lang.id
                      ? "bg-primary/20 text-primary shadow-xs"
                      : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold tracking-tight uppercase">
                      {lang.label}
                    </span>
                    {currentLangId === lang.id && (
                      <Check className="w-3 h-3 text-primary" />
                    )}
                  </div>
                  <span className="text-[9px] font-mono opacity-40">
                    {lang.id.toUpperCase()}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Disclaimer />

      <Card className="relative w-full max-w-6xl border-border/50 bg-card/95 shadow-2xl transition-colors hover:border-primary/50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings2 className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-xl font-semibold tracking-tight uppercase">
              {t("configuration")}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-10 py-6">
          {/* Framework Selection */}
          <div className="group space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                  {t("runtime_architecture")}
                </Label>
                <RuntimeHelp />
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {(Object.keys(FRAMEWORK_CONFIGS) as ArchitectureTier[]).map(
                (f) => (
                  <Button
                    key={f}
                    variant="outline"
                    size="sm"
                    className={`h-9 px-4 text-[11px] font-bold tracking-tight transition-all border-dashed ${
                      framework === f
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                        : "bg-muted/10 text-muted-foreground hover:bg-muted/20 border-border/30 hover:border-border/60"
                    }`}
                    onClick={() => setFramework(f)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          framework === f
                            ? "bg-primary-foreground"
                            : "bg-muted-foreground/30"
                        }`}
                      />
                      {t(f)}
                    </div>
                  </Button>
                ),
              )}
            </div>
            <div className="h-px w-full bg-linear-to-r from-border/50 via-border/10 to-transparent" />
          </div>

          {/* RPS Parameter */}
          <div className="group space-y-4">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <Label
                  htmlFor="rps"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors"
                >
                  {t("throughput")}
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
                      : "bg-muted/15 text-muted-foreground hover:bg-muted/30 border-border/40"
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
                <span>{t("min")}: 1</span>
                <span className="text-primary opacity-80">
                  {t("rps_scale")}
                </span>
                <span>{t("max")}: 500K</span>
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
                  {t("payload_size")}
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
                      : "bg-muted/15 text-muted-foreground hover:bg-muted/30 border-border/40"
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
                <span>{t("min")}: 1 B</span>
                <span className="text-primary opacity-80">
                  {t("payload_scale")}
                </span>
                <span>{t("max")}: 1 MB</span>
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
              {t("estimation")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="py-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="pb-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {t("protocol")}
                  </th>
                  <th className="pb-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <BarChart3 className="w-3 h-3" />
                      {t("bandwidth")}
                      <MetricHelp metric="bandwidth" />
                    </div>
                  </th>
                  <th className="pb-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Cpu className="w-3 h-3" />
                      {t("cpu_cores")}
                      <MetricHelp metric="cpuCores" />
                    </div>
                  </th>
                  <th className="pb-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <HardDrive className="w-3 h-3" />
                      {t("ram")}
                      <MetricHelp metric="ram" />
                    </div>
                  </th>
                  <th className="pb-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Activity className="w-3 h-3" />
                      {t("latency")}
                      <MetricHelp metric="latency" />
                    </div>
                  </th>
                  <th className="pb-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Activity className="w-3 h-3" />
                      {t("cpu_util")}
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

      {/* Export Section */}
      <Card className="relative w-full max-w-6xl mt-8 border-border/50 bg-card/95 shadow-2xl transition-colors hover:border-primary/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-xl font-semibold tracking-tight uppercase">
              {t("export")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="py-6">
          <Button
            variant="outline"
            className="flex items-center gap-2 group border-border/50 hover:border-primary/50 hover:bg-primary/5 min-w-[180px] transition-all"
            onClick={copyAsMarkdown}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-primary animate-in zoom-in duration-300" />
                <span className="text-primary font-bold">{t("copied")}</span>
              </>
            ) : (
              <>
                <Clipboard className="w-4 h-4 transition-transform group-hover:scale-110 text-muted-foreground group-hover:text-primary" />
                <span>{t("copy_markdown")}</span>
              </>
            )}
          </Button>
        </CardContent>
        <div className="absolute -bottom-px left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-50" />
      </Card>
      {/* Footer */}
      <footer className="mt-12 mb-8 text-center space-y-4">
        <div className="flex flex-col items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
          <div className="flex items-center gap-2">
            <span>{t("footer.useful")}</span>
            <a
              href="https://github.com/njxqlus/apos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/70 hover:text-primary transition-colors flex items-center gap-1.5 group"
            >
              <span className="border-b border-primary/20 group-hover:border-primary/50 transition-colors">
                {t("footer.star")}
              </span>
              <Star className="w-3 h-3 transition-transform group-hover:scale-125 fill-current" />
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span>{t("footer.check")}</span>
            <a
              href="https://testtrain.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/70 hover:text-primary transition-colors font-black tracking-tight"
            >
              <span className="border-b border-primary/20 hover:border-primary/50 transition-colors">
                {t("footer.testtrain")}
              </span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
