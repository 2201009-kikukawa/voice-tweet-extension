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
      type: EventTypes.init,
      text: ""
    });

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === EventTypes.messageContent) {
        setMessage(event.data.text);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
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
