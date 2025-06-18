import { WebviewView } from "vscode";
import { EventListenerProps, EventTypes } from "../types/classNames";
import { lastMessage } from "../listener/EventListener";

export let sidebarWebviewView: WebviewView | undefined;

export class SidebarEventListener {
  public setWebviewMessageListener(webviewView: WebviewView) {
    sidebarWebviewView = webviewView;
    webviewView.webview.onDidReceiveMessage((message: EventListenerProps) => {
      const type = message.type;

      switch (type) {
        case EventTypes.initTimer:
          webviewView.webview.postMessage({
            type: EventTypes.receiveMessage,
            text: lastMessage
          });
        default:
          console.warn(`Unknown message type: ${type}`);
      }
    });
  }
}
