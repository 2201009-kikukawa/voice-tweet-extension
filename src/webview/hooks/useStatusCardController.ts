import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StatusType } from "../../components/StatusCard";
import { VOICE_MODELS } from "../../const";
import { EventTypes } from "../../types/classNames";
import { vscode } from "../lib/vscode";

type StatusSnapshot = {
  status: StatusType;
  characterName?: string;
  styleId?: string;
  modeValue?: string;
  modeLabel?: string;
  intervalMinutes?: number;
  remainingSeconds?: number;
};

type InitTimerMessage = {
  type: EventTypes.initTimer;
  imageUris: Record<string, string>;
  statusSnapshot?: StatusSnapshot;
};

type SampleStopMessage = { type: EventTypes.sampleStop };

type WebviewInboundMessage = InitTimerMessage | SampleStopMessage;

type StatusCardViewModel = {
  status: StatusType;
  characterName: string | null;
  styleName: string | null;
  styleId: string | null;
  modeLabel: string | null;
  modeValue: string | null;
  intervalMinutes: number | null;
  nextPlayLabel: string;
  imageSrc?: string;
};

type DialogState = {
  isOpen: boolean;
  characterName: string;
  imageSrc: string;
  speakerStyle?: string;
  mode: string;
  sliderMinutes: number;
  isSamplePlaying: boolean;
  errorMessage: string;
};

type DialogHandlers = {
  onOpenChange: (open: boolean) => void;
  onSpeakerStyleChange: (value: string) => void;
  onModeChange: (value: string) => void;
  onSliderChange: (value: number) => void;
  onSampleStart: () => void;
  onSave: () => void;
};

type CardHandlers = {
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
};

type ApplyCardRunningStateArgs = {
  characterName: string;
  styleIdValue: string;
  intervalMinutesValue: number;
  modeValue: string;
  modeLabelOverride?: string | null;
  imageSrcOverride?: string;
  statusOverride?: StatusType;
  countdownSecondsOverride?: number | null;
};

export type UseStatusCardControllerResult = {
  imageUris: Record<string, string>;
  cardState: StatusCardViewModel;
  cardIsRunning: boolean;
  cardHandlers: CardHandlers;
  dialogState: DialogState;
  dialogHandlers: DialogHandlers;
  handleCharacterCardClick: (characterName: string) => void;
};

const MODE_LABELS: Record<string, string> = {
  "1": "褒め",
};

const getModeLabel = (value: string) => MODE_LABELS[value] ?? MODE_LABELS["1"];

const findStyleName = (characterName: string, styleId?: string) => {
  if (!characterName || !styleId) {
    return null;
  }

  const numericId = parseInt(styleId, 10);
  if (Number.isNaN(numericId)) {
    return null;
  }

  const model = VOICE_MODELS.find((entry) => entry.name === characterName);
  return model?.styles.find((style) => style.id === numericId)?.name ?? null;
};

const formatCountdownLabel = (seconds: number | null) => {
  if (!Number.isFinite(seconds) || seconds === null || seconds <= 0) {
    return "00:00:00";
  }

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const mins = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${hours}:${mins}:${secs}`;
};

const normalizeIntervalValue = (value: string) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
};

const initialCardState: StatusCardViewModel = {
  status: "initial",
  characterName: null,
  styleName: null,
  styleId: null,
  modeLabel: null,
  modeValue: null,
  intervalMinutes: null,
  nextPlayLabel: "--:--:--",
  imageSrc: undefined,
};

export const useStatusCardController = (): UseStatusCardControllerResult => {
  const [speakerStyle, setSpeakerStyle] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<string>("1");
  const [interval, setIntervalValue] = useState<string>("5");
  const [imageUris, setImageUris] = useState<Record<string, string>>({});
  const [isSamplePlaying, setIsSamplePlaying] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedCharacter, setSelectedCharacter] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [cardState, setCardState] = useState<StatusCardViewModel>(initialCardState);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  const clearCountdownInterval = useCallback(() => {
    if (countdownIntervalRef.current !== null) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const resetCountdown = useCallback(() => {
    clearCountdownInterval();
    setCountdownSeconds(null);
  }, [clearCountdownInterval]);

  const setStaticCountdown = useCallback(
    (value: number | null) => {
      clearCountdownInterval();
      setCountdownSeconds(value);
    },
    [clearCountdownInterval]
  );

  const startCountdown = useCallback(
    (initialSeconds: number) => {
      if (!Number.isFinite(initialSeconds) || initialSeconds <= 0) {
        resetCountdown();
        return;
      }

      clearCountdownInterval();
      setCountdownSeconds(Math.floor(initialSeconds));

      countdownIntervalRef.current = window.setInterval(() => {
        setCountdownSeconds((prev) => {
          if (prev === null) {
            return null;
          }

          if (prev <= 1) {
            clearCountdownInterval();
            return 0;
          }

          return prev - 1;
        });
      }, 1000);
    },
    [clearCountdownInterval, resetCountdown]
  );

  useEffect(() => {
    return () => {
      clearCountdownInterval();
    };
  }, [clearCountdownInterval]);

  useEffect(() => {
    setCardState((prev) => {
      const nextLabel =
        countdownSeconds === null ? "--:--:--" : formatCountdownLabel(countdownSeconds);
      if (prev.nextPlayLabel === nextLabel) {
        return prev;
      }
      return { ...prev, nextPlayLabel: nextLabel };
    });
  }, [countdownSeconds]);

  useEffect(() => {
    if (
      countdownSeconds === 0 &&
      cardState.status === "default" &&
      cardState.intervalMinutes &&
      cardState.intervalMinutes > 0
    ) {
      startCountdown(cardState.intervalMinutes * 60);
    }
  }, [cardState.intervalMinutes, cardState.status, countdownSeconds, startCountdown]);

  const sliderMinutes = normalizeIntervalValue(interval || "5");

  const selectedCharacterImage = useMemo(() => {
    if (!selectedCharacter) {
      return "";
    }
    return imageUris[selectedCharacter] ?? "";
  }, [imageUris, selectedCharacter]);

  const applyCardRunningState = useCallback(
    ({
      characterName,
      styleIdValue,
      intervalMinutesValue,
      modeValue,
      modeLabelOverride,
      imageSrcOverride,
      statusOverride,
      countdownSecondsOverride,
    }: ApplyCardRunningStateArgs) => {
      const styleName = findStyleName(characterName, styleIdValue);
      const nextImageSrc = imageSrcOverride ?? imageUris[characterName] ?? cardState.imageSrc;
      const countdownSecondsValue =
        typeof countdownSecondsOverride === "number"
          ? countdownSecondsOverride
          : intervalMinutesValue * 60;

      setCardState({
        status: statusOverride ?? "default",
        characterName,
        styleName,
        styleId: styleIdValue,
        modeLabel: modeLabelOverride ?? getModeLabel(modeValue),
        modeValue,
        intervalMinutes: intervalMinutesValue,
        nextPlayLabel: formatCountdownLabel(countdownSecondsValue),
        imageSrc: nextImageSrc,
      });
    },
    [cardState.imageSrc, imageUris]
  );

  const resetAllState = useCallback(() => {
    setCardState({ ...initialCardState });
    setSelectedCharacter("");
    setSpeakerStyle(undefined);
    setMode("1");
    setIntervalValue("5");
    setError("");
    resetCountdown();
  }, [resetCountdown]);

  const hydrateFromSnapshot = useCallback(
    (snapshot: StatusSnapshot, imageMap: Record<string, string>) => {
      if (!snapshot) {
        resetAllState();
        return;
      }

      if (snapshot.status === "initial") {
        resetAllState();
        return;
      }

      if (
        !snapshot.characterName ||
        !snapshot.styleId ||
        !snapshot.intervalMinutes ||
        !snapshot.modeValue
      ) {
        return;
      }

      const countdownSecondsValue =
        typeof snapshot.remainingSeconds === "number"
          ? snapshot.remainingSeconds
          : snapshot.intervalMinutes * 60;

      setSelectedCharacter(snapshot.characterName);
      setSpeakerStyle(snapshot.styleId);
      setMode(snapshot.modeValue);
      setIntervalValue(snapshot.intervalMinutes.toString());

      applyCardRunningState({
        characterName: snapshot.characterName,
        styleIdValue: snapshot.styleId,
        intervalMinutesValue: snapshot.intervalMinutes,
        modeValue: snapshot.modeValue,
        modeLabelOverride: snapshot.modeLabel ?? null,
        imageSrcOverride: imageMap[snapshot.characterName],
        statusOverride: snapshot.status,
        countdownSecondsOverride: countdownSecondsValue,
      });

      if (snapshot.status === "default") {
        startCountdown(countdownSecondsValue);
      } else {
        setStaticCountdown(countdownSecondsValue);
      }
    },
    [applyCardRunningState, resetAllState, setStaticCountdown, startCountdown]
  );

  const hydrateFromSnapshotRef = useRef(hydrateFromSnapshot);
  useEffect(() => {
    hydrateFromSnapshotRef.current = hydrateFromSnapshot;
  }, [hydrateFromSnapshot]);

  const resetAllStateRef = useRef(resetAllState);
  useEffect(() => {
    resetAllStateRef.current = resetAllState;
  }, [resetAllState]);

  useEffect(() => {
    vscode.postMessage({
      type: EventTypes.initTimer,
      text: "",
      speakerId: 0,
    });

    const handleMessage = (event: MessageEvent<WebviewInboundMessage>) => {
      const message = event.data;
      if (!message) {
        return;
      }

      if (message.type === EventTypes.initTimer) {
        setImageUris(message.imageUris);
        if (message.statusSnapshot) {
          hydrateFromSnapshotRef.current(message.statusSnapshot, message.imageUris);
        } else {
          resetAllStateRef.current();
        }
      }

      if (message.type === EventTypes.sampleStop) {
        setIsSamplePlaying(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleCharacterCardClick = useCallback(
    (characterName: string) => {
      setError("");
      setSelectedCharacter(characterName);
      setIsDialogOpen(true);

      if (cardState.characterName === characterName) {
        setSpeakerStyle(cardState.styleId ?? undefined);
        setMode(cardState.modeValue ?? "1");
        if (cardState.intervalMinutes) {
          setIntervalValue(cardState.intervalMinutes.toString());
        }
      } else {
        setSpeakerStyle(undefined);
        setMode("1");
        setIntervalValue("5");
      }
    },
    [cardState]
  );

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setError("");
    }
  }, []);

  const handleSpeakerStyleChange = useCallback((value: string) => {
    setSpeakerStyle(value);
    setError("");
  }, []);

  const handleModeChange = useCallback((value: string) => {
    setMode(value);
  }, []);

  const handleSliderChange = useCallback((value: number) => {
    setIntervalValue(value.toString());
  }, []);

  const handleSampleStart = useCallback(() => {
    if (isSamplePlaying) {
      return;
    }

    if (!speakerStyle) {
      setError("ボイススタイルを選択してください");
      return;
    }

    setIsSamplePlaying(true);
    vscode.postMessage({
      type: EventTypes.sampleStart,
      text: "",
      speakerId: parseInt(speakerStyle, 10),
    });
  }, [isSamplePlaying, speakerStyle]);

  const postStartTimer = useCallback(
    ({
      intervalMinutesValue,
      styleIdValue,
      characterNameValue,
      modeValue,
      modeLabel,
      remainingSeconds,
      isResume,
    }: {
      intervalMinutesValue: number;
      styleIdValue: string;
      characterNameValue: string;
      modeValue: string;
      modeLabel: string;
      remainingSeconds?: number;
      isResume?: boolean;
    }) => {
      vscode.postMessage({
        type: EventTypes.startTimer,
        text: intervalMinutesValue.toString(),
        speakerId: parseInt(styleIdValue, 10),
        payload: {
          characterName: characterNameValue,
          styleId: styleIdValue,
          intervalMinutes: intervalMinutesValue,
          modeValue,
          modeLabel,
          remainingSeconds,
          isResume,
        },
      });
    },
    []
  );

  const postStopTimer = useCallback((reason: "pause" | "reset") => {
    vscode.postMessage({
      type: EventTypes.stopTimer,
      text: "",
      speakerId: 0,
      payload: { reason },
    });
  }, []);

  const postCloseSettingTab = useCallback(() => {
    vscode.postMessage({
      type: EventTypes.closeSettingTab,
      text: "",
      speakerId: 0,
    });
  }, []);

  const handleSaveSettings = useCallback(() => {
    if (isSamplePlaying) {
      return;
    }

    if (!selectedCharacter) {
      setError("キャラクターを選択してください");
      return;
    }

    if (!speakerStyle) {
      setError("ボイススタイルを選択してください");
      return;
    }

    const normalizedIntervalMinutes = normalizeIntervalValue(interval);

    const modeLabel = getModeLabel(mode);
    const countdownStartSeconds = normalizedIntervalMinutes * 60;

    setIsDialogOpen(false);
    setIntervalValue(normalizedIntervalMinutes.toString());
    setError("");
    applyCardRunningState({
      characterName: selectedCharacter,
      styleIdValue: speakerStyle,
      intervalMinutesValue: normalizedIntervalMinutes,
      modeValue: mode,
      modeLabelOverride: modeLabel,
    });
    startCountdown(countdownStartSeconds);
    postStartTimer({
      intervalMinutesValue: normalizedIntervalMinutes,
      styleIdValue: speakerStyle,
      characterNameValue: selectedCharacter,
      modeValue: mode,
      modeLabel,
      remainingSeconds: countdownStartSeconds,
    });
    postCloseSettingTab();
  }, [
    applyCardRunningState,
    interval,
    isSamplePlaying,
    mode,
    postCloseSettingTab,
    postStartTimer,
    selectedCharacter,
    speakerStyle,
    startCountdown,
  ]);

  const handleCardPause = useCallback(() => {
    if (!cardState.characterName) {
      return;
    }
    postStopTimer("pause");
    clearCountdownInterval();
    setCardState((prev) => ({ ...prev, status: "stopped" }));
  }, [cardState.characterName, clearCountdownInterval, postStopTimer]);

  const handleCardResume = useCallback(() => {
    if (
      !cardState.characterName ||
      !cardState.styleId ||
      !cardState.intervalMinutes ||
      !cardState.modeValue
    ) {
      return;
    }
    const modeLabel = cardState.modeLabel ?? getModeLabel(cardState.modeValue);
    const resumeSeconds =
      typeof countdownSeconds === "number" && countdownSeconds > 0
        ? countdownSeconds
        : cardState.intervalMinutes * 60;
    postStartTimer({
      intervalMinutesValue: cardState.intervalMinutes,
      styleIdValue: cardState.styleId,
      characterNameValue: cardState.characterName,
      modeValue: cardState.modeValue,
      modeLabel,
      remainingSeconds: resumeSeconds,
      isResume: true,
    });
    startCountdown(resumeSeconds);
    setCardState((prev) => ({ ...prev, status: "default" }));
  }, [
    cardState.characterName,
    cardState.intervalMinutes,
    cardState.modeLabel,
    cardState.modeValue,
    cardState.styleId,
    countdownSeconds,
    postStartTimer,
    startCountdown,
  ]);

  const handleCardReset = useCallback(() => {
    postStopTimer("reset");
    resetAllState();
  }, [postStopTimer, resetAllState]);

  const cardIsRunning = cardState.status === "default";

  const dialogState: DialogState = {
    isOpen: isDialogOpen,
    characterName: selectedCharacter,
    imageSrc: selectedCharacterImage,
    speakerStyle,
    mode,
    sliderMinutes,
    isSamplePlaying,
    errorMessage: error,
  };

  const dialogHandlers: DialogHandlers = {
    onOpenChange: handleDialogOpenChange,
    onSpeakerStyleChange: handleSpeakerStyleChange,
    onModeChange: handleModeChange,
    onSliderChange: handleSliderChange,
    onSampleStart: handleSampleStart,
    onSave: handleSaveSettings,
  };

  const cardHandlers: CardHandlers = {
    onPause: cardIsRunning ? handleCardPause : undefined,
    onResume: !cardIsRunning && cardState.characterName ? handleCardResume : undefined,
    onReset: cardState.status === "initial" ? undefined : handleCardReset,
  };

  return {
    imageUris,
    cardState,
    cardIsRunning,
    cardHandlers,
    dialogState,
    dialogHandlers,
    handleCharacterCardClick,
  };
};

export type { StatusCardViewModel };
