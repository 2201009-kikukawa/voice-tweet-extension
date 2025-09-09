import { ExtensionContext, window } from "vscode";
import { SidebarProvider } from "./providers/PanelProvider";
import { AudioPlayer } from "./utilities/audioPlayer";

export async function activate(context: ExtensionContext) {
  await AudioPlayer.init();
  const sidebarProvider = new SidebarProvider(context.extensionUri);

  const sidebarViewDisposable = window.registerWebviewViewProvider(SidebarProvider.viewType, sidebarProvider);

  context.subscriptions.push(sidebarViewDisposable);
}

// 拡張機能非アクティブ時のクリーンアップ処理
export function deactivate() {
  AudioPlayer.cleanup();
}
