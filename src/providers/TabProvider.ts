import {
  Uri,
  Webview,
  window,
} from "vscode";
import * as vscode from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import { TabEventListener } from "@/listener/TabEventListener";

export class TabProvider {
  constructor(private readonly _extensionUri: Uri) { }

  public setTabView() {
    const tab = window.createWebviewPanel(
      "voice-tweet-webview-tab",
      "つぶやきエディタ：setting",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [Uri.joinPath(this._extensionUri, "out")]
      }
    );

    tab.webview.html = this._getWebviewContent(tab.webview, this._extensionUri);
    const listener = new TabEventListener();
    listener.setWebviewMessageListener(tab, this._extensionUri);
  }

  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    const webviewUri = getUri(webview, extensionUri, ["out", "webview.js"]);
    const stylesUri = getUri(webview, extensionUri, ["out", "styles.css"]);
    const iconUri = getUri(webview, extensionUri, ["out", "codicon.css"]);
    const nonce = getNonce();

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; style-src-elem ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${webview.cspSource}; img-src ${webview.cspSource} data:;">
          <link rel="stylesheet" href="${stylesUri}" />
          <link rel="stylesheet" href="${iconUri}">
          <title>Sample</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
        </body>
      </html>
    `;
  }
}
