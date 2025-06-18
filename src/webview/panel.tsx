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
      text: ""
    });

    const handleInitMessage = (event: MessageEvent) => {
      if (event.data?.type === EventTypes.receiveMessage) {
        setMessage(event.data.text);
      }
    };

    window.addEventListener("message", handleInitMessage);
    return () => window.removeEventListener("message", handleInitMessage);
  }, []);

  return (
    <>
      {message && message.trim() !== "" &&
        <div>
          <p className="speechBubble">{message}</p>
      </div>}
    </>
  );
};

export default Sidebar;

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(React.createElement(Sidebar));
