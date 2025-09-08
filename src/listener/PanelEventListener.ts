import { Uri, WebviewView } from "vscode";
import { EventListenerProps, EventTypes } from "../types/classNames";
import { TabEventListener } from "./TabEventListener";
import { TabProvider } from "../providers/TabProvider";

export let panelWebviewView: WebviewView | undefined;
let context: Uri;

export class PanelEventListener {
  constructor(extensionUrl: Uri) { context = extensionUrl; }

  public setWebviewMessageListener(webviewView: WebviewView) {
    panelWebviewView = webviewView;
    webviewView.webview.onDidReceiveMessage((message: EventListenerProps) => {
      const type = message.type;

      switch (type) {
        case EventTypes.initTimer:
          webviewView.webview.postMessage({
            type: EventTypes.receiveMessage,
            text: TabEventListener.lastMessage || "",
            speakerId: 0
          });
          break;
        case EventTypes.openSettingTab:
          const tab = new TabProvider(context);
          tab.setTabView();
          break;
        default:
          console.warn(`Unknown message type: ${type}`);
      }
    });
  }
}
