import { WebviewView } from "vscode";
import { EventListenerProps, EventTypes } from "../types/classNames";
import * as fs from "fs";
import * as path from "path";
import { sidebarWebviewView } from "./SidebarEventListener";

let timer: NodeJS.Timeout | undefined; // タイマー管理
let isRunning = false; // タイマーが動作中かどうか
export let lastMessage: string | undefined; // サイドバーに表示する文言

export class EventListener {
  public setWebviewMessageListener(webviewView: WebviewView) {
    webviewView.webview.onDidReceiveMessage((message: EventListenerProps) => {
      const type = message.type;
      const text = message.text;

      switch (type) {
        // タイマー開始
        case EventTypes.setInterval:
          startInterval(parseInt(text, 10));
          break;

        // 初期化（タイマー動作状態チェック）
        case EventTypes.init:
          webviewView.webview.postMessage({
            type: EventTypes.init,
            isRunning: isRunning
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
      function startInterval(interval: number) {
        clearInterval(timer);
        isRunning = true;

        timer = setInterval(() => {
          sendRandomMessage();
        }, interval * 1000);
      }

      // タイマー停止
      function stopInterval() {
        if (isRunning) {
          clearInterval(timer);
          isRunning = false;
          lastMessage = "";
        }
      }

      // メッセージ送信
      function sendRandomMessage() {
        const msg = getRandomMessage();
        lastMessage = msg;

        if (sidebarWebviewView) {
          sidebarWebviewView.webview.postMessage({
            type: EventTypes.messageContent,
            text: msg
          });
        }
      }

      // メッセージをランダムに取得
      function getRandomMessage(): string {
        try {
          const messagesPath = path.join(__dirname, "..", "out", "messages.json");
          const data = fs.readFileSync(messagesPath, "utf8");
          const messages = JSON.parse(data);
          const values = Object.values(messages);
          const randomIndex = Math.floor(Math.random() * values.length);
          return values[randomIndex] as string;
        } catch (error) {
          console.error("Error reading messages file:", error);
          return "メッセージの取得に失敗しました";
        }
      }
    });
  }
}
