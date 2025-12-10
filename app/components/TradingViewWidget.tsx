"use client";

import React, { memo } from "react";
import useTradingViewWidget from "@/hooks/useTradingViewWidget";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface TradingViewWidgetProps {
  title?: string;
  scriptUrl: string;
  config: Record<string, unknown>;
  height?: number;
  className?: string;
}

const TradingViewWidget = ({
  title,
  scriptUrl,
  config,
  height = 600,
  className,
}: TradingViewWidgetProps) => {
  const { theme } = useTheme();

  const themedConfig = {
    ...config,
    colorTheme: theme === "light" ? "light" : "dark",
    isTransparent: false, // force it to use your color
  };
  const containerRef = useTradingViewWidget(scriptUrl, themedConfig, height);
  return (
    <div className="w-full">
      {title && <h3 className="font-semibold text-2xl  mb-5">{title}</h3>}
      <div
        className={cn("tradingview-widget-container", className)}
        ref={containerRef}
      >
        <div
          className="tradingview-widget-container__widget"
          style={{ height, width: "100%" }}
        />
      </div>
    </div>
  );
};

export default memo(TradingViewWidget);
