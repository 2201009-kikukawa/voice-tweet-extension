import type { EventListenerProps } from "../../types/classNames";

declare const acquireVsCodeApi: () => {
  postMessage: (message: EventListenerProps) => void;
};

export const vscode = acquireVsCodeApi();
