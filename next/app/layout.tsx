import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "APOS",
  description: "API Protocol Overhead Simulator",
};

import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/components/I18nProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        "font-mono",
        jetbrainsMono.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider>
          <ThemeProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
