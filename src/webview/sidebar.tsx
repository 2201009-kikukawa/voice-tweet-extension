import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { VSCodeButton, VSCodeDropdown } from "@vscode/webview-ui-toolkit/react";
import { EventListenerProps, EventTypes } from "../types/classNames";
import { VOICE_MODELS } from "../const";

// VSCode API使用
declare const acquireVsCodeApi: () => {
  postMessage: (message: EventListenerProps) => void;
};
const vscode = acquireVsCodeApi();

const Main = () => {
  const [speakerStyle, setSpeakerStyle] = useState<string>("");
  const [mode, setMode] = useState<string>("");
  const [interval, setInterval] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    vscode.postMessage({
      type: EventTypes.initTimer,
      text: "",
      speakerId: 0
    });

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === EventTypes.initTimer) {
        setIsRunning(event.data.isRunning);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []
  );

  const choiceSpeakerStyle = (selectedSpeaker: string) => {
    VOICE_MODELS.forEach(element => {
      if (element.name === selectedSpeaker) {
        const speakerStyleDropdown = document.getElementById("speaker_style") as HTMLSelectElement;
        speakerStyleDropdown.innerHTML = "";

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.text = "選択してください";
        defaultOption.selected = true;
        speakerStyleDropdown.appendChild(defaultOption);

        element.styles.forEach(style => {
          const option = document.createElement("option");
          option.value = String(style.id);
          option.text = style.name;
          speakerStyleDropdown.appendChild(option);
        });
      }
    });
  };

  const handleStart = () => {
    switch (interval) {
      case "10":
        vscode.postMessage({
          type: EventTypes.startTimer,
          text: "10",
          speakerId: parseInt(speakerStyle, 10)
        });
        console.log(speakerStyle);
        break;

      case "300":
        vscode.postMessage({
          type: EventTypes.startTimer,
          text: "300",
          speakerId: parseInt(speakerStyle, 10)
        });
        break;
    }

    setIsRunning(true);
  };

  const handleStop = () => {
    vscode.postMessage({
      type: EventTypes.stopTimer,
      text: "",
      speakerId: 0
    });

    setIsRunning(false);
  };

  return (
    <>
      <div className="container">
        <h3>つぶやきエディタ</h3>
        <div className="selector-wrap">
          <label htmlFor="speaker">音声モデル</label>
          <VSCodeDropdown
            id="speaker"
            onChange={(e: any) => {
              const selectedValue = (e.target as HTMLSelectElement).value;
              choiceSpeakerStyle(selectedValue);
            }}
          >
            <option value="" selected>選択してください</option>
            {VOICE_MODELS.map((model) => (
              <option key={model.name} value={model.name}>
                {model.name}
              </option>
            ))}
          </VSCodeDropdown>
          <a href="https://voicevox.hiroshiba.jp/" id="sample">サンプルはこちらから</a>

          <label htmlFor="speaker_style">モデルスタイル</label>
          <VSCodeDropdown
            id="speaker_style"
            onchange={(e: any) => {
              const selectedValue = (e.target as HTMLSelectElement).value;
              setSpeakerStyle(selectedValue);
            }}
          >
            <option value="" selected>選択してください</option>
          </VSCodeDropdown>

          <label htmlFor="mode">モード選択</label>
          <VSCodeDropdown
            id="mode"
            onChange={(e: any) => {
              const selectedValue = (e.target as HTMLSelectElement).value;
              setMode(selectedValue);
            }}
          >
            <option value="" selected>選択してください</option>
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
            <option value="" selected>選択してください</option>
            <option value="10">10秒</option>  {/* デモ用 */}
            <option value="300">5分</option>
          </VSCodeDropdown>
        </div>

        {isRunning ?
          <VSCodeButton className="submit" appearance="primary" onClick={handleStop}>停止</VSCodeButton> :
          <VSCodeButton className="submit" appearance="primary" onClick={handleStart}>開始</VSCodeButton>
        }
      </div>
    </>
  );
};

export default Main;

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(React.createElement(Main));
