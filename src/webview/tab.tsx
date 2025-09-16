import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { VSCodeButton, VSCodeDropdown } from "@vscode/webview-ui-toolkit/react";
import { EventListenerProps, EventTypes } from "../types/classNames";
import { VOICE_MODELS } from "../const";
import { Card, CardContent, CardFooter } from "../components/Card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/Dialog";
import { Slider } from "../components/Slider";

// VSCode API使用
declare const acquireVsCodeApi: () => {
  postMessage: (message: EventListenerProps) => void;
};
const vscode = acquireVsCodeApi();

const Main = () => {
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("");
  const [speakerStyle, setSpeakerStyle] = useState<string>("");
  const [mode, setMode] = useState<string>("");
  const [interval, setInterval] = useState<string>("5");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [imageUris, setImageUris] = useState<{ [key: string]: string }>({});
  const [isSamplePlaying, setIsSamplePlaying] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedCharacter, setSelectedCharacter] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    vscode.postMessage({
      type: EventTypes.initTimer,
      text: "",
      speakerId: 0,
    });

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === EventTypes.initTimer) {
        setIsRunning(event.data.isRunning);
        setImageUris(event.data.imageUris);
      }
      if (event.data?.type === EventTypes.sampleStop) {
        setIsSamplePlaying(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleOpenDialog = (key: string) => () => {
    setError("");
    setSelectedCharacter(key);
    setIsDialogOpen(true);
    VOICE_MODELS.forEach((element) => {
      if (element.name === key) {
        setSelectedSpeaker(element.name);
      }
    });
  };

  const handleStart = () => {
    if (isSamplePlaying) {
      return;
    }

    if (speakerStyle === "" || speakerStyle === null) {
      setError("ボイススタイルを選択してください");
      return;
    }

    setIsRunning(true);
    setIsDialogOpen(false);

    vscode.postMessage({
      type: EventTypes.startTimer,
      text: interval, // 分を送信
      speakerId: parseInt(speakerStyle, 10),
    });
  };

  const handleStop = () => {
    vscode.postMessage({
      type: EventTypes.stopTimer,
      text: "",
      speakerId: 0,
    });

    setIsRunning(false);
  };

  const sampleStart = () => {
    if (isSamplePlaying) {
      return;
    }

    if (speakerStyle === "" || speakerStyle === null) {
      setError("ボイススタイルを選択してください");
      return;
    }

    setIsSamplePlaying(true);

    vscode.postMessage({
      type: EventTypes.sampleStart,
      text: "",
      speakerId: parseInt(speakerStyle, 10),
    });
  };

  return (
    <>
      <div className="flex flex-col items-center mt-4">
        <h1 className="text-2xl font-bold">キャラクターボイス設定</h1>
        <p className="mt-4">
          お気に入りのキャラクターを選んで、コーディングの時間をもっと楽しく彩りましょう。
          <br />
          カードをクリックすると、声のスタイルやモードを自由にカスタマイズできます。
        </p>
      </div>

      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))] gap-8 p-6">
        {Object.entries(imageUris).map(([key, imageUri]) => (
          <Card onClick={handleOpenDialog(key)} key={key}>
            <CardContent>
              <img
                src={imageUri || ""}
                alt={key}
                className="w-full h-auto object-cover bg-gray-50"
              />
            </CardContent>
            <CardFooter>
              <p className="text-lg font-bold">{key}</p>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="p-8">
          <h1 className="text-center text-2xl font-bold">{selectedCharacter}</h1>
          <div className="flex space-x-6">
            <img
              src={imageUris[selectedCharacter]}
              alt={selectedCharacter}
              className="w-1/3 h-auto object-cover bg-gray-50"
            />
            <div className="">
              <div className="">
                <div className="flex flex-col">
                  <label htmlFor="speaker_style" className="text-start">
                    ボイススタイル
                  </label>
                  <VSCodeDropdown
                    id="speaker_style"
                    onchange={(e: any) => {
                      const selectedValue = (e.target as HTMLSelectElement).value;
                      setSpeakerStyle(selectedValue);
                    }}>
                    <option value="">選択してください</option>
                    {VOICE_MODELS.map(
                      (model) =>
                        model.name === selectedCharacter &&
                        model.styles.map((style) => (
                          <option key={style.id} value={style.id}>
                            {style.name}
                          </option>
                        ))
                    )}
                  </VSCodeDropdown>
                  {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>

                <div className="flex flex-col">
                  <label htmlFor="mode" className="text-start">
                    モード選択
                  </label>
                  <VSCodeDropdown
                    id="mode"
                    onChange={(e: any) => {
                      const selectedValue = (e.target as HTMLSelectElement).value;
                      setMode(selectedValue);
                    }}>
                    <option value="1">褒め</option>
                  </VSCodeDropdown>
                </div>
              </div>

              <div className="mt-6">
                <p className="mb-4">表示間隔：{interval === "0" ? "1" : interval}分</p>
                <Slider
                  defaultValue={[5]}
                  max={60}
                  step={5}
                  onValueChange={(value) => {
                    setInterval(value[0].toString());
                  }}
                />
              </div>

              <div className="mt-10">
                <div className="grid grid-cols-2 gap-6 mt-4">
                  <VSCodeButton
                    appearance={isSamplePlaying ? "icon" : "secondary"}
                    onClick={sampleStart}>
                    {isSamplePlaying ? (
                      <span className="codicon codicon-loading self-center loading-animation mr-1"></span>
                    ) : (
                      <span className="codicon codicon-debug-start self-center mr-1"></span>
                    )}
                    サンプルを再生
                  </VSCodeButton>
                  <VSCodeButton
                    appearance={isSamplePlaying ? "icon" : "primary"}
                    onClick={handleStart}>
                    <span className="codicon codicon-save-as self-center mr-1"></span>
                    保存
                  </VSCodeButton>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Main;

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(React.createElement(Main));
