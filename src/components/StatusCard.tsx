import * as React from "react";

import { Card } from "./Card";
import { Button, ButtonIcon } from "./button";
import { cn } from "../lib/utils";

type StatusType = "initial" | "default" | "stopped";

interface StatusCardProps {
  status: StatusType;
  characterName?: string | null;
  styleName?: string | null;
  modeLabel?: string;
  intervalMinutes?: number;
  imageSrc?: string;
  isRunning?: boolean;
  nextPlayLabel?: string;
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
  className?: string;
}

const ICONS: Record<StatusType, React.ReactNode> = {
  initial: (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="Add character"
      className="h-24 w-24 text-white/80">
      <circle
        cx="24"
        cy="24"
        r="21"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M24 15v18M15 24h18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  default: (
    <svg viewBox="0 0 48 48" role="img" aria-label="Running" className="h-12 w-12 text-emerald-300">
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path
        d="M18 24.5l4.8 4.2 8.2-9.4"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  stopped: (
    <svg viewBox="0 0 48 48" role="img" aria-label="Stopped" className="h-12 w-12 text-red-400">
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <rect x="17" y="17" width="14" height="14" rx="3" fill="currentColor" />
    </svg>
  ),
};

const TITLES: Record<StatusType, (characterName?: string | null) => string> = {
  initial: () => "キャラクターが選択されていません",
  default: (characterName) => `${characterName}`,
  stopped: (characterName) => `${characterName}`,
};

const DESCRIPTIONS: Record<StatusType, (characterName?: string | null) => string> = {
  initial: () => "下からキャラクターを選択してください。",
  default: () => "キャラクターボイスを再生中",
  stopped: (characterName) => `${characterName} のボイスは一時停止中です。`,
};

const StatusCard = ({
  status,
  characterName,
  styleName,
  modeLabel,
  intervalMinutes,
  imageSrc,
  isRunning = false,
  nextPlayLabel = "--:--:--",
  onPause,
  onResume,
  onReset,
  className,
}: StatusCardProps) => {
  const metaBadges: Array<{ label: string; value: string }> = [];
  if (status !== "initial") {
    if (styleName) {
      metaBadges.push({ label: "スタイル", value: styleName });
    }
    if (modeLabel) {
      metaBadges.push({ label: "モード", value: modeLabel });
    }
  }

  const showControls = status !== "initial";
  const primaryAction = isRunning ? onPause : onResume;
  const primaryDisabled = !primaryAction;
  const resetDisabled = !onReset;

  return (
    <Card
      className={cn(
        "relative w-full max-w-5xl rounded-[24px] border border-white/12 bg-[#04050a] px-6 py-6 text-white",
        "flex flex-col gap-6 md:flex-row md:items-center",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
        "cursor-default",
        className
      )}
      role="status"
      aria-live="polite"
      data-status={status}>
      <div className="flex flex-1 flex-col gap-5 md:flex-row md:items-center">
        <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-[20px] border border-white/20 bg-white/5 md:h-36 md:w-36">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={characterName ?? "キャラクター画像"}
              className="h-full w-full bg-gray-50 object-cover"
            />
          ) : (
            ICONS[status]
          )}
        </div>
        <div className="min-w-[14rem] flex-1 text-left">
          <p className="text-xl font-semibold tracking-wide md:text-[2rem]">
            {TITLES[status](characterName)}
          </p>
          <p className="mt-2 text-sm text-white/70 md:text-base">
            {DESCRIPTIONS[status](characterName)}
          </p>
          {metaBadges.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-4">
              {metaBadges.map((badge) => (
                <span
                  key={badge.label}
                  className="flex min-w-[180px] items-center justify-center gap-3 rounded-lg border border-white/20 bg-white/10 px-5 py-2.5 text-base font-semibold text-white/90">
                  <span>{badge.label}</span>
                  <span className="text-white/80">{badge.value}</span>
                </span>
              ))}
            </div>
          ) : null}
          {status !== "initial" ? (
            <div className="mt-3 space-y-1.5 text-xs text-white/75 md:text-sm">
              <div className="flex items-center gap-2">
                <span className="codicon codicon-sync" aria-hidden="true" />
                <span>表示間隔：{intervalMinutes ?? "-"}分</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="codicon codicon-clock" aria-hidden="true" />
                <span>
                  次回再生：
                  {nextPlayLabel}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {showControls ? (
        <div className="absolute right-8 top-8 flex flex-row gap-4">
          <Button
            type="button"
            variant="primary"
            onClick={primaryAction}
            disabled={primaryDisabled}
            className={cn(
              "min-w-[150px] rounded-lg px-6 py-3 text-base font-semibold text-white",
              isRunning ? "bg-emerald-600 hover:bg-emerald-500" : "bg-sky-600 hover:bg-sky-500",
              primaryDisabled && "cursor-not-allowed opacity-60"
            )}>
            <ButtonIcon name={isRunning ? "debug-pause" : "debug-start"} className="text-lg" />
            {isRunning ? "停止" : "再生"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onReset}
            disabled={resetDisabled}
            className={cn(
              "min-w-[150px] rounded-lg px-6 py-3 text-base font-semibold text-white",
              resetDisabled && "cursor-not-allowed opacity-60"
            )}>
            <ButtonIcon name="trash" className="text-lg" />
            設定解除
          </Button>
        </div>
      ) : null}
    </Card>
  );
};

export type { StatusType };
export { StatusCard };
