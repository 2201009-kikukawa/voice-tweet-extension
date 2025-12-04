import { Uri, WebviewPanel, WebviewView } from "vscode";
import { EventListenerProps, EventTypes } from "../types/classNames";
import { MESSAGE_LIST } from "../const";
import { fetchVoiceAPI } from "../lib/fetchVoiceAPI";
import { AudioPlayer } from "../utilities/audioPlayer";
import { panelWebviewView } from "./PanelEventListener";

type StatusType = "initial" | "default" | "stopped";

type StartTimerPayload = {
  characterName?: string;
  styleId?: string;
  modeValue?: string;
  modeLabel?: string;
  intervalMinutes?: number;
  remainingSeconds?: number;
  isResume?: boolean;
};

type StopTimerPayload = {
  reason?: "pause" | "reset";
};

type StatusSnapshot = {
  status: StatusType;
  characterName?: string;
  styleId?: string;
  modeValue?: string;
  modeLabel?: string;
  intervalMinutes?: number;
  remainingSeconds?: number;
};

export class TabEventListener {
  private static timer: NodeJS.Timeout | undefined; // タイマー管理
  private static isRunning = false; // タイマーが動作中かどうか
  private static isPlayingAudio = false; // 音声再生中かどうか
  private static intervalTime = 0; // タイマーの間隔（秒）
  private static currentSpeakerId = 0; // 現在の話者ID
  private static nextPlayTime = 0; // 次回再生予定時刻（Unix timestamp）
  public static lastMessage: string | undefined; // サイドバーに表示する文言
  private static isSamplePlaying = false; // サンプル再生中かどうか
  private static currentStatus: StatusType = "initial";
  private static currentCharacterName: string | null = null;
  private static currentStyleId: string | null = null;
  private static currentModeValue: string | null = null;
  private static currentModeLabel: string | null = null;
  private static currentIntervalMinutes: number | null = null;
  private static pausedRemainingSeconds = 0;

  public setWebviewMessageListener(webviewView: WebviewPanel, context: Uri) {
    webviewView.webview.onDidReceiveMessage(async (message: EventListenerProps) => {
      const type = message.type;
      const text = message.text;
      const speakerId = message.speakerId;

      switch (type) {
        // タイマー開始
        case EventTypes.startTimer: {
          let intervalSeconds: number;
          if (text === "0") {
            intervalSeconds = 60; // 最小値1分に設定
          } else {
            intervalSeconds = parseInt(text, 10) * 60;
          }

          const startPayload = (message.payload ?? {}) as StartTimerPayload;
          TabEventListener.updateSnapshotFromPayload(startPayload, intervalSeconds);
          await startInterval(intervalSeconds, speakerId, startPayload);
          break;
        }

        // 初期化（タイマー動作状態チェック）
        case EventTypes.initTimer:
          // AudioPlayerを初期化
          await AudioPlayer.init();

          // 画像のURIを作成
          const imageUris = {
            ずんだもん: webviewView.webview
              .asWebviewUri(Uri.joinPath(context, "out", "characters", "zundamon.webp"))
              .toString(),
            四国めたん: webviewView.webview
              .asWebviewUri(Uri.joinPath(context, "out", "characters", "metan.webp"))
              .toString(),
            春日部つむぎ: webviewView.webview
              .asWebviewUri(Uri.joinPath(context, "out", "characters", "tsumugi.webp"))
              .toString(),
            九州そら: webviewView.webview
              .asWebviewUri(Uri.joinPath(context, "out", "characters", "sora.webp"))
              .toString(),
            中国うさぎ: webviewView.webview
              .asWebviewUri(Uri.joinPath(context, "out", "characters", "usagi.webp"))
              .toString(),
            中部つるぎ: webviewView.webview
              .asWebviewUri(Uri.joinPath(context, "out", "characters", "tsurugi.webp"))
              .toString(),
            東北きりたん: webviewView.webview
              .asWebviewUri(Uri.joinPath(context, "out", "characters", "kiritan.webp"))
              .toString(),
            東北イタコ: webviewView.webview
              .asWebviewUri(Uri.joinPath(context, "out", "characters", "itako.webp"))
              .toString(),
          };
          webviewView.webview.postMessage({
            type: EventTypes.initTimer,
            isRunning: TabEventListener.isRunning,
            imageUris: imageUris,
            statusSnapshot: TabEventListener.createStatusSnapshot(),
          });
          break;

        // タイマー停止
        case EventTypes.stopTimer:
          stopInterval(((message.payload ?? {}) as StopTimerPayload).reason);
          break;

        case EventTypes.closeSettingTab:
          webviewView.dispose();
          break;

        // サンプル再生
        case EventTypes.sampleStart:
          await sendSampleMessage(speakerId);
          break;

        default:
          console.warn(`Unknown message type: ${type}`);
      }

      // タイマー開始
      async function startInterval(
        interval: number,
        speakerId: number,
        startPayload?: StartTimerPayload
      ) {
        clearTimeout(TabEventListener.timer);
        TabEventListener.timer = undefined;
        TabEventListener.isRunning = true;
        TabEventListener.intervalTime = interval;
        TabEventListener.currentSpeakerId = speakerId;
        const isResume = Boolean(startPayload?.isResume);
        const initialDelaySeconds =
          typeof startPayload?.remainingSeconds === "number" && startPayload.remainingSeconds > 0
            ? startPayload.remainingSeconds
            : interval;
        TabEventListener.nextPlayTime = Date.now() + initialDelaySeconds * 1000;
        TabEventListener.pausedRemainingSeconds = initialDelaySeconds;

        if (isResume) {
          scheduleResumeMessage(initialDelaySeconds);
          return;
        }

        // 最初のメッセージを送信
        await sendFirstMessage(speakerId);

        // 次回再生時刻を設定
        scheduleNextMessage();
      }

      // タイマー停止
      function stopInterval(reason: "pause" | "reset" = "pause") {
        if (TabEventListener.timer) {
          clearTimeout(TabEventListener.timer);
          TabEventListener.timer = undefined;
        }

        TabEventListener.isRunning = false;
        TabEventListener.isPlayingAudio = false;

        if (reason === "pause") {
          const remainingSeconds = Math.max(
            0,
            Math.floor((TabEventListener.nextPlayTime - Date.now()) / 1000)
          );
          TabEventListener.pausedRemainingSeconds = remainingSeconds;
          if (TabEventListener.currentCharacterName) {
            TabEventListener.currentStatus = "stopped";
          } else {
            TabEventListener.resetSnapshot();
          }
        } else {
          TabEventListener.resetSnapshot();
        }

        TabEventListener.lastMessage = "";
        TabEventListener.nextPlayTime = 0;
      }

      // サンプル再生
      async function sendSampleMessage(speakerId: number) {
        const sampleMessage = "これはサンプル音声です";
        TabEventListener.isSamplePlaying = true;

        try {
          // 既に音声再生中の場合はスキップ
          if (TabEventListener.isPlayingAudio) {
            console.log("音声再生中のため、メッセージ送信をスキップします");
            return;
          }

          TabEventListener.isPlayingAudio = true;
          console.log(`音声メッセージを再生します: "${sampleMessage}" (話者ID: ${speakerId})`);

          const audioUrl = await sendVoice(speakerId, sampleMessage);
          if (audioUrl) {
            console.log(`音声URL取得成功、再生開始: ${audioUrl}`);
            // 音声再生が完了するまで待機
            await AudioPlayer.playFromUrl(audioUrl);
            console.log("音声再生完了");
          } else {
            console.warn("音声URLが取得できませんでした");
          }
        } catch (error) {
          console.error("音声再生中にエラーが発生しました:", error);
        } finally {
          TabEventListener.isPlayingAudio = false;
          TabEventListener.isSamplePlaying = false;
          // サンプル再生完了を通知
          if (webviewView) {
            webviewView.webview.postMessage({
              type: EventTypes.sampleStop,
            });
          }
        }
      }

      // 最初のメッセージを送信
      async function sendFirstMessage(speakerId: number) {
        const firstMessage = "保存が完了しました！";

        try {
          // 既に音声再生中の場合はスキップ
          if (TabEventListener.isPlayingAudio) {
            console.log("音声再生中のため、メッセージ送信をスキップします");
            return;
          }

          TabEventListener.isPlayingAudio = true;
          console.log(`音声メッセージを再生します: "${firstMessage}" (話者ID: ${speakerId})`);

          const audioUrl = await sendVoice(speakerId, firstMessage);
          if (audioUrl) {
            console.log(`音声URL取得成功、再生開始: ${audioUrl}`);

            // パネルにメッセージを送信
            if (panelWebviewView) {
              panelWebviewView.webview.postMessage({
                type: EventTypes.receiveMessage,
                text: firstMessage,
                speakerId: speakerId,
              });
            }

            // 音声再生が完了するまで待機
            await AudioPlayer.playFromUrl(audioUrl);
            console.log("音声再生完了");
          } else {
            console.warn("音声URLが取得できませんでした");
          }
        } catch (error) {
          console.error("音声再生中にエラーが発生しました:", error);
        } finally {
          TabEventListener.isPlayingAudio = false;
        }
      }

      // メッセージ送信
      async function sendRandomMessage(speakerId: number) {
        try {
          // 既に音声再生中の場合はスキップ
          if (TabEventListener.isPlayingAudio) {
            console.log("音声再生中のため、メッセージ送信をスキップします");
            return;
          }

          TabEventListener.isPlayingAudio = true;
          TabEventListener.lastMessage = getRandomMessage();
          console.log(
            `音声メッセージを再生します: "${TabEventListener.lastMessage}" (話者ID: ${speakerId})`
          );

          const audioUrl = await sendVoice(speakerId, TabEventListener.lastMessage);
          if (audioUrl) {
            console.log(`音声URL取得成功、再生開始: ${audioUrl}`);

            // パネルにメッセージを送信
            if (panelWebviewView) {
              panelWebviewView.webview.postMessage({
                type: EventTypes.receiveMessage,
                text: TabEventListener.lastMessage,
                speakerId: speakerId,
              });
            }

            // 音声再生が完了するまで待機
            await AudioPlayer.playFromUrl(audioUrl);
            console.log("音声再生完了");
          } else {
            console.warn("音声URLが取得できませんでした");
          }
        } catch (error) {
          console.error("音声再生中にエラーが発生しました:", error);
        } finally {
          // 音声再生完了後、次のメッセージをスケジュール
          TabEventListener.isPlayingAudio = false;
          if (TabEventListener.isRunning) {
            scheduleNextMessage();
          }
        }
      }

      // 次のメッセージをスケジュール
      function scheduleNextMessage() {
        if (!TabEventListener.isRunning) {
          return;
        }

        // 次回再生時刻を設定（現在時刻 + インターバル）
        TabEventListener.nextPlayTime = Date.now() + TabEventListener.intervalTime * 1000;
        const delay = TabEventListener.nextPlayTime - Date.now();

        console.log(`次のメッセージを${delay / 1000}秒後にスケジュール`);

        TabEventListener.timer = setTimeout(async () => {
          if (TabEventListener.isRunning && !TabEventListener.isPlayingAudio) {
            await sendRandomMessage(TabEventListener.currentSpeakerId);
          }
        }, delay);
      }

      function scheduleResumeMessage(delaySeconds: number) {
        if (!TabEventListener.isRunning) {
          return;
        }

        const resumeDelayMs = Math.max(0, delaySeconds * 1000);
        console.log(`一時停止解除後、${delaySeconds}秒後に再開します`);
        TabEventListener.timer = setTimeout(async () => {
          if (TabEventListener.isRunning && !TabEventListener.isPlayingAudio) {
            await sendRandomMessage(TabEventListener.currentSpeakerId);
          }
        }, resumeDelayMs);
      }

      // メッセージをランダムに取得
      function getRandomMessage(): string {
        try {
          const randomIndex = Math.floor(Math.random() * MESSAGE_LIST.length);
          return MESSAGE_LIST[randomIndex];
        } catch (error) {
          console.error("Error reading messages file:", error);
          return "メッセージの取得に失敗しました";
        }
      }

      async function sendVoice(speaker: number, txt: string): Promise<string | undefined> {
        try {
          // 入力検証
          if (!txt || txt.trim() === "") {
            console.warn("音声合成用のテキストが空です");
            return undefined;
          }

          if (speaker < 0) {
            console.warn("無効なスピーカーIDです:", speaker);
            return undefined;
          }

          console.log(`音声合成リクエスト: スピーカー=${speaker}, テキスト="${txt}"`);
          const fetchVoice = new fetchVoiceAPI(txt, speaker);
          return await fetchVoice.playVoice();
        } catch (error) {
          console.error("音声API呼び出しエラー:", error);
          return undefined;
        }
      }
    });
  }

  private static updateSnapshotFromPayload(payload: StartTimerPayload, intervalSeconds: number) {
    if (!payload.characterName || !payload.styleId || !payload.modeValue) {
      console.warn("startTimer payload is missing metadata", payload);
      TabEventListener.resetSnapshot();
      return;
    }

    const normalizedIntervalMinutes =
      typeof payload.intervalMinutes === "number" && payload.intervalMinutes > 0
        ? payload.intervalMinutes
        : Math.max(1, Math.floor(intervalSeconds / 60));

    TabEventListener.currentCharacterName = payload.characterName;
    TabEventListener.currentStyleId = payload.styleId;
    TabEventListener.currentModeValue = payload.modeValue;
    TabEventListener.currentModeLabel = payload.modeLabel ?? payload.modeValue;
    TabEventListener.currentIntervalMinutes = normalizedIntervalMinutes;
    TabEventListener.currentStatus = "default";
    const initialRemainingSeconds =
      typeof payload.remainingSeconds === "number" && payload.remainingSeconds > 0
        ? payload.remainingSeconds
        : normalizedIntervalMinutes * 60;
    TabEventListener.pausedRemainingSeconds = initialRemainingSeconds;
  }

  private static createStatusSnapshot(): StatusSnapshot | undefined {
    if (TabEventListener.currentStatus === "initial") {
      return { status: "initial" };
    }

    if (
      !TabEventListener.currentCharacterName ||
      !TabEventListener.currentStyleId ||
      !TabEventListener.currentIntervalMinutes ||
      !TabEventListener.currentModeValue
    ) {
      return undefined;
    }

    return {
      status: TabEventListener.currentStatus,
      characterName: TabEventListener.currentCharacterName,
      styleId: TabEventListener.currentStyleId,
      modeValue: TabEventListener.currentModeValue,
      modeLabel: TabEventListener.currentModeLabel ?? undefined,
      intervalMinutes: TabEventListener.currentIntervalMinutes,
      remainingSeconds: TabEventListener.getSnapshotRemainingSeconds(),
    };
  }

  private static getSnapshotRemainingSeconds(): number {
    if (TabEventListener.currentStatus === "default") {
      const diff = TabEventListener.nextPlayTime - Date.now();
      return diff > 0 ? Math.floor(diff / 1000) : 0;
    }

    if (TabEventListener.currentStatus === "stopped") {
      return Math.max(0, Math.floor(TabEventListener.pausedRemainingSeconds));
    }

    return 0;
  }

  private static resetSnapshot() {
    TabEventListener.currentStatus = "initial";
    TabEventListener.currentCharacterName = null;
    TabEventListener.currentStyleId = null;
    TabEventListener.currentModeValue = null;
    TabEventListener.currentModeLabel = null;
    TabEventListener.currentIntervalMinutes = null;
    TabEventListener.pausedRemainingSeconds = 0;
  }
}
