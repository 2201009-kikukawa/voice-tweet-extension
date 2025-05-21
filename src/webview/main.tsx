import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { VSCodeButton, VSCodeDropdown } from "@vscode/webview-ui-toolkit/react";

const main = () => {
  const [model, setModel] = useState<string>("");
  const [mode, setMode] = useState<string>("");
  const [interval, setInterval] = useState<string>("");

  const handleSubmit = () => {
    // 仮
    console.log(`Model: ${model}, Mode: ${mode}, Interval: ${interval}`);
  };

  return (
    <>
      <div>
        <h3>つぶやきエディタ</h3>
        <div className="selector-wrap">
          <label htmlFor="model">音声モデル</label>
          <VSCodeDropdown
            id="model"
            onChange={(e: any) => {
              const selectedValue = (e.target as HTMLSelectElement).value;
              setModel(selectedValue);
            }}
          >
            <option value="0" selected>選択してください</option>
            <option value="1">ずんだもん</option>
          </VSCodeDropdown>

          <label htmlFor="mode">モード選択</label>
          <VSCodeDropdown
            id="mode"
            onChange={(e: any) => {
              const selectedValue = (e.target as HTMLSelectElement).value;
              setMode(selectedValue);
            }}
          >
            <option value="0" selected>選択してください</option>
            <option value="1">褒め</option>
          </VSCodeDropdown>

          <label htmlFor="interval">表示間隔（分）</label>
          <VSCodeDropdown
            id="interval"
            onChange={(e: any) => {
              const selectedValue = (e.target as HTMLSelectElement).value;
              setInterval(selectedValue);
            }}
          >
            <option value="0" selected>選択してください</option>
            <option value="1">10秒</option>  {/* デモ用 */}
            <option value="2">5分</option>
          </VSCodeDropdown>
        </div>

        <VSCodeButton id="submit" appearance="primary" onClick={handleSubmit}>設定</VSCodeButton>
      </div>
    </>
  );
};

export default main;

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(React.createElement(main));
