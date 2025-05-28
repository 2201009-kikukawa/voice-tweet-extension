import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { VSCodeButton, VSCodeDropdown } from "@vscode/webview-ui-toolkit/react";

const sidebar = () => {
  return (
    <>
      <div>
        <p className="speechBubble">1000文字コーティングしたよ、すごい！</p>
      </div>
    </>
  );
};

export default sidebar;

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(React.createElement(sidebar));
