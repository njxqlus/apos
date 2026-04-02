"use client";

import * as React from "react";
import { Info, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { useTranslation, Trans } from "react-i18next";

export function Disclaimer() {
  const { t } = useTranslation();
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
              {t("disclaimer.title")}
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
              <Trans
                i18nKey="disclaimer.intro"
                components={[
                  <br key="0" />,
                  <strong key="1" className="text-foreground" />,
                ]}
              />
            </p>

            <div className="space-y-2">
              <h4 className="font-bold text-[10px] uppercase tracking-widest text-primary/80">
                {t("disclaimer.included_title")}
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 list-disc pl-4 marker:text-primary/50 text-[10px]">
                {(
                  t("disclaimer.included_items", {
                    returnObjects: true,
                  }) as string[]
                ).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-[10px] uppercase tracking-widest text-primary/80">
                {t("disclaimer.not_included_title")}
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 list-disc pl-4 marker:text-primary/50 text-[10px]">
                {(
                  t("disclaimer.not_included_items", {
                    returnObjects: true,
                  }) as string[]
                ).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <p className="text-[10px]">
              <Trans
                i18nKey="disclaimer.accuracy"
                components={[
                  <strong key="0" className="text-foreground italic" />,
                ]}
              />
            </p>

            <p className="text-[10px]">
              <Trans
                i18nKey="disclaimer.use_case"
                components={[
                  <strong key="0" className="text-foreground italic" />,
                  <strong key="1" className="text-foreground italic" />,
                ]}
              />
            </p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
