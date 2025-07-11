import { WebviewView } from "vscode";
import { EventListenerProps, EventTypes } from "../types/classNames";
import { MESSAGE_LIST } from "../const";
import { fetchVoiceAPI } from "../lib/fetchVoiceAPI";
import { AudioPlayer } from "../utilities/audioPlayer";
import { panelWebviewView } from "./PanelEventListener";


export class SidebarEventListener {
  private static timer: NodeJS.Timeout | undefined; // タイマー管理
  private static isRunning = false; // タイマーが動作中かどうか
  private static isPlayingAudio = false; // 音声再生中かどうか
  private static intervalTime = 0; // タイマーの間隔（秒）
  private static currentSpeakerId = 0; // 現在の話者ID
  private static nextPlayTime = 0; // 次回再生予定時刻（Unix timestamp）
  public static lastMessage: string | undefined; // サイドバーに表示する文言

  public setWebviewMessageListener(webviewView: WebviewView) {
    webviewView.webview.onDidReceiveMessage(async (message: EventListenerProps) => {
      const type = message.type;
      const text = message.text;
      const speakerId = message.speakerId;

      switch (type) {
        // タイマー開始
        case EventTypes.startTimer:
          await startInterval(parseInt(text, 10), speakerId);
          break;

        // 初期化（タイマー動作状態チェック）
        case EventTypes.initTimer:
          // AudioPlayerを初期化
          await AudioPlayer.init();
          webviewView.webview.postMessage({
            type: EventTypes.initTimer,
            isRunning: SidebarEventListener.isRunning,
          });
          break;

        // タイマー停止
        case EventTypes.stopTimer:
          stopInterval();
          break;

        default:
          console.warn(`Unknown message type: ${type}`);
      }

      // タイマー開始
      async function startInterval(interval: number, speakerId: number) {
        clearInterval(SidebarEventListener.timer);
        SidebarEventListener.isRunning = true;
        SidebarEventListener.intervalTime = interval;
        SidebarEventListener.currentSpeakerId = speakerId;
        SidebarEventListener.nextPlayTime = Date.now();

        // 最初のメッセージを送信
        await sendRandomMessage(speakerId);

        // 次回再生時刻を設定
        scheduleNextMessage();
      }

      // タイマー停止
      function stopInterval() {
        if (SidebarEventListener.timer) {
          clearInterval(SidebarEventListener.timer);
          SidebarEventListener.isRunning = false;
          SidebarEventListener.isPlayingAudio = false;
          SidebarEventListener.lastMessage = "";
          SidebarEventListener.nextPlayTime = 0;
        }
      }

      // メッセージ送信
      async function sendRandomMessage(speakerId: number) {
        try {
          // 既に音声再生中の場合はスキップ
          if (SidebarEventListener.isPlayingAudio) {
            console.log("音声再生中のため、メッセージ送信をスキップします");
            return;
          }

          SidebarEventListener.isPlayingAudio = true;
          SidebarEventListener.lastMessage = getRandomMessage();
          console.log(`音声メッセージを再生します: "${SidebarEventListener.lastMessage}" (話者ID: ${speakerId})`);

          // パネルにメッセージを送信
          if (panelWebviewView) {
            panelWebviewView.webview.postMessage({
              type: EventTypes.receiveMessage,
              text: SidebarEventListener.lastMessage,
              speakerId: speakerId
            });
          }

          const audioUrl = await sendVoice(speakerId, SidebarEventListener.lastMessage);
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
          // 音声再生完了後、次のメッセージをスケジュール
          SidebarEventListener.isPlayingAudio = false;
          if (SidebarEventListener.isRunning) {
            scheduleNextMessage();
          }
        }
      }

      // 次のメッセージをスケジュール
      function scheduleNextMessage() {
        if (!SidebarEventListener.isRunning) {
          return;
        }

        // 次回再生時刻を設定（現在時刻 + インターバル）
        SidebarEventListener.nextPlayTime = Date.now() + (SidebarEventListener.intervalTime * 1000);
        const delay = SidebarEventListener.nextPlayTime - Date.now();

        console.log(`次のメッセージを${delay / 1000}秒後にスケジュール`);

        SidebarEventListener.timer = setTimeout(async () => {
          if (SidebarEventListener.isRunning && !SidebarEventListener.isPlayingAudio) {
            await sendRandomMessage(SidebarEventListener.currentSpeakerId);
          }
        }, delay);
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
}
