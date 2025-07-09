import { WebviewView } from "vscode";
import { EventListenerProps, EventTypes } from "../types/classNames";
import { MESSAGE_LIST } from "../const";
import { fetchVoiceAPI } from "../lib/fetchVoiceAPI";
import { AudioPlayer } from "../utilities/audioPlayer";
import { panelWebviewView } from "./PanelEventListener";


export class SidebarEventListener {
  private static timer: NodeJS.Timeout | undefined; // タイマー管理
  private static isRunning = false; // タイマーが動作中かどうか
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

        // 最初のメッセージを送信
        await sendRandomMessage(speakerId);

        SidebarEventListener.timer = setInterval(async () => {
          await sendRandomMessage(speakerId);
        }, interval * 1000);
      }

      // タイマー停止
      function stopInterval() {
        if (SidebarEventListener.timer) {
          clearInterval(SidebarEventListener.timer);
          SidebarEventListener.isRunning = false;
          SidebarEventListener.lastMessage = "";
        }
      }

      // メッセージ送信
      async function sendRandomMessage(speakerId: number) {
        try {
          SidebarEventListener.lastMessage = getRandomMessage();
          console.log(`音声メッセージを再生します: ${SidebarEventListener.lastMessage}`);

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
            await AudioPlayer.playFromUrl(audioUrl);
            console.log("音声再生が完了しました");
          } else {
            console.warn("音声URLが取得できませんでした");
          }
        } catch (error) {
          console.error("音声再生中にエラーが発生しました:", error);
          // エラーが発生してもタイマーは継続
        }
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
