import * as React from "react";

import { Card } from "./Card";
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
      className="h-12 w-12 text-white/80">
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
  stopped: () => "音声が停止しました",
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
        "w-full max-w-5xl rounded-[32px] border border-white/15 bg-[#050505] px-8 py-6 text-white",
        "flex flex-col gap-6 md:flex-row md:items-center",
        "shadow-[inset_0_2px_0_rgba(255,255,255,0.08)]",
        "cursor-default",
        className
      )}
      role="status"
      aria-live="polite"
      data-status={status}>
      <div className="flex flex-1 flex-col gap-6 md:flex-row md:items-center">
        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[24px] border border-white/25 bg-white/5">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={characterName ?? "キャラクター画像"}
              className="h-full w-full object-cover"
            />
          ) : (
            ICONS[status]
          )}
        </div>
        <div className="flex-1 min-w-[16rem] text-left">
          <p className="text-2xl font-semibold tracking-wide lg:text-[2rem]">
            {TITLES[status](characterName)}
          </p>
          <p className="mt-2 text-base text-white/70">{DESCRIPTIONS[status](characterName)}</p>
          {metaBadges.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {metaBadges.map((badge) => (
                <span
                  key={badge.label}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium text-white/80">
                  {badge.label}: {badge.value}
                </span>
              ))}
            </div>
          ) : null}
          {status !== "initial" ? (
            <div className="mt-4 space-y-2 text-sm text-white/75">
              <div className="flex items-center gap-2">
                <span className="codicon codicon-sync" aria-hidden="true" />
                <span>表示間隔：{intervalMinutes ?? "-"}分</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="codicon codicon-clock" aria-hidden="true" />
                <span>
                  次回再生：
                  {isRunning ? nextPlayLabel : "--:--:--"}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {showControls ? (
        <div className="flex w-full flex-col gap-3 md:w-auto md:items-end">
          <button
            type="button"
            onClick={primaryAction}
            disabled={primaryDisabled}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 text-base font-semibold text-white transition",
              "md:w-40",
              isRunning
                ? "bg-emerald-600 hover:bg-emerald-500"
                : "bg-emerald-500 hover:bg-emerald-400",
              primaryDisabled && "cursor-not-allowed opacity-60"
            )}>
            <span
              aria-hidden="true"
              className={cn(
                "codicon text-lg",
                isRunning ? "codicon-debug-pause" : "codicon-debug-start"
              )}
            />
            {isRunning ? "PAUSE" : "再生"}
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={resetDisabled}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-red-500 md:w-40",
              resetDisabled && "cursor-not-allowed opacity-60"
            )}>
            <span aria-hidden="true" className="codicon codicon-trash" />
            設定解除
          </button>
        </div>
      ) : null}
    </Card>
  );
};

export type { StatusType };
export { StatusCard };
