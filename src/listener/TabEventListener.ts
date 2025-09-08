import { Uri, WebviewPanel, WebviewView } from "vscode";
import { EventListenerProps, EventTypes } from "../types/classNames";
import { MESSAGE_LIST } from "../const";
import { fetchVoiceAPI } from "../lib/fetchVoiceAPI";
import { AudioPlayer } from "../utilities/audioPlayer";
import { panelWebviewView } from "./PanelEventListener";

export class TabEventListener {

  private static timer: NodeJS.Timeout | undefined; // タイマー管理
  private static isRunning = false; // タイマーが動作中かどうか
  private static isPlayingAudio = false; // 音声再生中かどうか
  private static intervalTime = 0; // タイマーの間隔（秒）
  private static currentSpeakerId = 0; // 現在の話者ID
  private static nextPlayTime = 0; // 次回再生予定時刻（Unix timestamp）
  public static lastMessage: string | undefined; // サイドバーに表示する文言

  public setWebviewMessageListener(webviewView: WebviewPanel, context: Uri) {
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

          // 画像のURIを作成
          const imageUris = {
            "ずんだもん": webviewView.webview.asWebviewUri(
              Uri.joinPath(context, 'out', 'characters', 'zundamon.png')
            ).toString(),
            "四国めたん": webviewView.webview.asWebviewUri(
              Uri.joinPath(context, 'out', 'characters', 'metan.png')
            ).toString(),
            "春日部つむぎ": webviewView.webview.asWebviewUri(
              Uri.joinPath(context, 'out', 'characters', 'tsumugi.png')
            ).toString(),
            "九州そら": webviewView.webview.asWebviewUri(
              Uri.joinPath(context, 'out', 'characters', 'sora.png')
            ).toString(),
            "中国うさぎ": webviewView.webview.asWebviewUri(
              Uri.joinPath(context, 'out', 'characters', 'usagi.png')
            ).toString(),
            "中部つるぎ": webviewView.webview.asWebviewUri(
              Uri.joinPath(context, 'out', 'characters', 'tsurugi.png')
            ).toString(),
            "東北きりたん": webviewView.webview.asWebviewUri(
              Uri.joinPath(context, 'out', 'characters', 'kiritan.png')
            ).toString(),
            "東北イタコ": webviewView.webview.asWebviewUri(
              Uri.joinPath(context, 'out', 'characters', 'itako.png')
            ).toString(),
          };
          webviewView.webview.postMessage({
            type: EventTypes.initTimer,
            isRunning: TabEventListener.isRunning,
            imageUris: imageUris,
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
        clearInterval(TabEventListener.timer);
        TabEventListener.isRunning = true;
        TabEventListener.intervalTime = interval;
        TabEventListener.currentSpeakerId = speakerId;
        TabEventListener.nextPlayTime = Date.now();

        // 最初のメッセージを送信
        await sendRandomMessage(speakerId);

        // 次回再生時刻を設定
        scheduleNextMessage();
      }

      // タイマー停止
      function stopInterval() {
        if (TabEventListener.timer) {
          clearInterval(TabEventListener.timer);
          TabEventListener.isRunning = false;
          TabEventListener.isPlayingAudio = false;
          TabEventListener.lastMessage = "";
          TabEventListener.nextPlayTime = 0;
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
          console.log(`音声メッセージを再生します: "${TabEventListener.lastMessage}" (話者ID: ${speakerId})`);

          // パネルにメッセージを送信
          if (panelWebviewView) {
            panelWebviewView.webview.postMessage({
              type: EventTypes.receiveMessage,
              text: TabEventListener.lastMessage,
              speakerId: speakerId
            });
          }

          const audioUrl = await sendVoice(speakerId, TabEventListener.lastMessage);
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
        TabEventListener.nextPlayTime = Date.now() + (TabEventListener.intervalTime * 1000);
        const delay = TabEventListener.nextPlayTime - Date.now();

        console.log(`次のメッセージを${delay / 1000}秒後にスケジュール`);

        TabEventListener.timer = setTimeout(async () => {
          if (TabEventListener.isRunning && !TabEventListener.isPlayingAudio) {
            await sendRandomMessage(TabEventListener.currentSpeakerId);
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
