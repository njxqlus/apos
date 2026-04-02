"use client";

import * as React from "react";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "flex items-center gap-2 border-border/50 bg-card/90 text-[10px] font-bold tracking-widest uppercase hover:border-primary/50 group",
        )}
      >
        <div className="relative w-3.5 h-3.5">
          <Sun className="w-3.5 h-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute top-0 left-0 w-3.5 h-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </div>
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 border-border/50 bg-card/95 backdrop-blur-xl p-1.5 shadow-2xl"
      >
        {(
          [
            { id: "light", label: t("theme_light") || "Light", icon: Sun },
            { id: "dark", label: t("theme_dark") || "Dark", icon: Moon },
            {
              id: "system",
              label: t("theme_system") || "System",
              icon: Monitor,
            },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const isActive = theme === item.id;
          return (
            <DropdownMenuItem
              key={item.id}
              onClick={() => setTheme(item.id)}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-2 cursor-pointer transition-all duration-200",
                isActive
                  ? "bg-primary/20 text-primary font-bold shadow-xs"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "w-3.5 h-3.5",
                    isActive ? "text-primary" : "opacity-50",
                  )}
                />
                <span className="text-[11px] font-bold tracking-tight uppercase">
                  {item.label}
                </span>
              </div>
              {isActive && <Check className="w-3 h-3 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
