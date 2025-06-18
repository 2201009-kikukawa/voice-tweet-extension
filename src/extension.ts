import { ExtensionContext, window } from "vscode";
import { ViewProvider } from "./providers/SidebarProvider";
import { SidebarProvider } from "./providers/PanelProvider";

export function activate(context: ExtensionContext) {
  const viewProvider = new ViewProvider(context.extensionUri);
  const sidebarProvider = new SidebarProvider(context.extensionUri);

  const sampleViewDisposable = window.registerWebviewViewProvider(ViewProvider.viewType, viewProvider);
  const sidebarViewDisposable = window.registerWebviewViewProvider(SidebarProvider.viewType, sidebarProvider);

  context.subscriptions.push(sampleViewDisposable, sidebarViewDisposable);
}
