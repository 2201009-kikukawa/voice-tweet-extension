import { ExtensionContext, window } from "vscode";
import { ViewProvider } from "./providers/ViewProvider";
import { SidebarProvider } from "./providers/SidebarProvider";

export function activate(context: ExtensionContext) {
  const viewProvider = new ViewProvider(context.extensionUri);
  const sidebarProvider = new SidebarProvider(context.extensionUri);

  const sampleViewDisposable = window.registerWebviewViewProvider(ViewProvider.viewType, viewProvider);
  const sidebarViewDisposable = window.registerWebviewViewProvider(SidebarProvider.viewType, sidebarProvider);

  context.subscriptions.push(sampleViewDisposable, sidebarViewDisposable);
}
