import { WebviewView } from "vscode";
import { EventListenerProps, EventTypes } from "../types/classNames";
import { SidebarEventListener } from "./SidebarEventListener";

export let panelWebviewView: WebviewView | undefined;

export class PanelEventListener {
  public setWebviewMessageListener(webviewView: WebviewView) {
    panelWebviewView = webviewView;
    webviewView.webview.onDidReceiveMessage((message: EventListenerProps) => {
      const type = message.type;

      switch (type) {
        case EventTypes.initTimer:
          webviewView.webview.postMessage({
            type: EventTypes.receiveMessage,
            text: SidebarEventListener.lastMessage || "",
            speakerId: 0
          });
          break;
        default:
          console.warn(`Unknown message type: ${type}`);
      }
    });
  }
}
