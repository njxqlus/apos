"use client";

import * as React from "react";
import { Info, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function Disclaimer() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Card className="w-full max-w-6xl border-border/40 bg-muted/5 hover:border-primary/30 transition-all mb-8 overflow-hidden group/disclaimer">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-muted/10 transition-colors text-left focus:outline-none cursor-pointer">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg transition-colors ${
                isOpen
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground group-hover/disclaimer:bg-primary/10 group-hover/disclaimer:text-primary"
              }`}
            >
              <Info className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              What this calculator estimates
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground/50 transition-all duration-300 ${
              isOpen
                ? "rotate-180 text-primary"
                : "group-hover/disclaimer:text-primary"
            }`}
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-6 px-6 font-mono text-[11px] leading-relaxed text-muted-foreground/80 space-y-6 border-t border-border/10 mt-2">
            <p className="pt-4">
              This tool models server-side resource consumption for a single
              receiving node processing incoming requests over a secure (TLS)
              connection. It estimates the load on the{" "}
              <strong className="text-foreground">consumer/receiver</strong> —
              the application server that accepts requests, processes them, and
              writes to fast storage (e.g. Redis, in-memory cache).
            </p>

            <div className="space-y-2">
              <h4 className="font-bold text-[10px] uppercase tracking-widest text-primary/80">
                What is included in the model:
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 list-disc pl-4 marker:text-primary/50 text-[10px]">
                <li>
                  Network bandwidth based on payload + protocol overhead + TLS
                  framing
                </li>
                <li>
                  CPU cores based on protocol efficiency, framework tier, and
                  payload size penalty
                </li>
                <li>
                  RAM based on concurrency (Little&apos;s Law) + per-request
                  buffers + framework baseline
                </li>
                <li>
                  Latency based on RTT + TLS handshake + protocol processing +
                  framework overhead
                </li>
                <li>Utilization-based latency growth at high load</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-[10px] uppercase tracking-widest text-primary/80">
                What is NOT modeled:
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 list-disc pl-4 marker:text-primary/50 text-[10px]">
                <li>Database or downstream service latency</li>
                <li>Horizontal scaling across multiple nodes</li>
                <li>
                  Broker-side resources for Kafka/AMQP (only the consumer client
                  is modeled)
                </li>
                <li>
                  Network infrastructure (load balancers, proxies, firewalls)
                </li>
                <li>GC pauses, JVM warmup, or runtime-specific behavior</li>
                <li>Disk I/O</li>
                <li>Burst traffic and autoscaling behavior</li>
              </ul>
            </div>

            <p className="text-[10px]">
              <strong className="text-foreground italic">Accuracy:</strong>{" "}
              estimates are within ±15–20% for typical workloads (1KB–10KB
              payload, up to 100k RPS). Accuracy degrades at extreme
              combinations of high RPS and large payloads (100k RPS × 100KB+)
              where memory bandwidth becomes the bottleneck and the model may
              overestimate CPU requirements.
            </p>

            <p className="text-[10px]">
              <strong className="text-foreground italic">
                Use this tool for:
              </strong>{" "}
              initial capacity planning, architecture trade-off comparisons, and
              protocol selection. Do not use as a substitute for load testing.
            </p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
