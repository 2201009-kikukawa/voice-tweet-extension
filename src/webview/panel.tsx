import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { EventListenerProps, EventTypes } from "../types/classNames";

// VSCode API使用
declare const acquireVsCodeApi: () => {
  postMessage: (message: EventListenerProps) => void;
};
const vscode = acquireVsCodeApi();

const Sidebar = () => {
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    vscode.postMessage({
      type: EventTypes.initTimer,
      text: "",
      speakerId: 0
    });

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === EventTypes.receiveMessage) {
        setMessage(event.data.text || ""); // パネルを開いている間リアルタイムでメッセージを更新
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleOpenSettingTab = () => {
    vscode.postMessage({
      type: EventTypes.openSettingTab,
      text: "",
      speakerId: 0
    });
  };

  return (
    <>
      <div className="panel">
        <p className="speechBubble">{message === "" ? "拡張機能の設定を行ってください" : message}</p>
        <p onClick={handleOpenSettingTab} className="setting">設定</p>
      </div>
    </>
  );
};

export default Sidebar;

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(React.createElement(Sidebar));
