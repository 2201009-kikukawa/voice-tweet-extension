import { ExtensionContext, window } from "vscode";
import { ViewProvider } from "./providers/SidebarProvider";
import { SidebarProvider } from "./providers/PanelProvider";
import { AudioPlayer } from "./utilities/audioPlayer";

export async function activate(context: ExtensionContext) {
  await AudioPlayer.init();
  const viewProvider = new ViewProvider(context.extensionUri);
  const sidebarProvider = new SidebarProvider(context.extensionUri);

  const sampleViewDisposable = window.registerWebviewViewProvider(ViewProvider.viewType, viewProvider);
  const sidebarViewDisposable = window.registerWebviewViewProvider(SidebarProvider.viewType, sidebarProvider);

  context.subscriptions.push(sampleViewDisposable, sidebarViewDisposable);
}

// 拡張機能非アクティブ時のクリーンアップ処理
export function deactivate() {
  AudioPlayer.cleanup();
}
