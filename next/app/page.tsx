"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";

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

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-6 font-mono">
      {/* Decorative background elements */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20" />

      <Card className="relative w-full max-w-3xl border-border/50 bg-card/50 shadow-2xl backdrop-blur-xl transition-all hover:border-primary/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings2 className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-xl font-semibold tracking-tight uppercase">
              Configuration
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-12 py-8">
          {/* RPS Parameter */}
          <div className="group space-y-6">
            <div className="flex items-end justify-between">
              <div className="space-y-1.5">
                <Label
                  htmlFor="rps"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors"
                >
                  Throughput (RPS)
                </Label>
                <div className="text-2xl font-bold tracking-tighter text-foreground tabular-nums">
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
              <div className="mt-4 flex justify-between px-0.5 text-[9px] text-muted-foreground/50 font-mono font-bold uppercase tracking-widest">
                <span>Min: 1</span>
                <span className="text-primary opacity-80">RPS SCALE</span>
                <span>Max: 500K</span>
              </div>
            </div>
          </div>

          {/* Payload Size Parameter */}
          <div className="group space-y-6">
            <div className="flex items-end justify-between">
              <div className="space-y-1.5">
                <Label
                  htmlFor="payload"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors"
                >
                  Payload Size
                </Label>
                <div className="text-2xl font-bold tracking-tighter text-foreground tabular-nums">
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
              <div className="mt-4 flex justify-between px-0.5 text-[9px] text-muted-foreground/50 font-mono font-bold uppercase tracking-widest">
                <span>Min: 1 B</span>
                <span className="text-primary opacity-80">Payload Scale</span>
                <span>Max: 1 MB</span>
              </div>
            </div>
          </div>
        </CardContent>

        <div className="absolute -bottom-px left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-50" />
      </Card>
    </div>
  );
}
