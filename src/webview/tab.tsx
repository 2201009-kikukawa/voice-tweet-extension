import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { EventListenerProps, EventTypes } from "../types/classNames";
import { VOICE_MODELS } from "../const";
import { Card, CardContent, CardFooter } from "../components/Card";
import { Dialog, DialogContent } from "../components/Dialog";
import { Slider } from "../components/Slider";
import { Button, ButtonIcon, ButtonSpinner } from "../components/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../components/Select";

// VSCode API使用
declare const acquireVsCodeApi: () => {
  postMessage: (message: EventListenerProps) => void;
};
const vscode = acquireVsCodeApi();

const Main = () => {
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("");
  const [speakerStyle, setSpeakerStyle] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<string>("1");
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
    setSpeakerStyle(undefined);
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

    if (!speakerStyle) {
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

    if (!speakerStyle) {
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
                  <Select
                    value={speakerStyle}
                    onValueChange={(value: string) => {
                      setSpeakerStyle(value);
                      setError("");
                    }}
                    disabled={!selectedCharacter}>
                    <SelectTrigger id="speaker_style" aria-label="ボイススタイル">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCharacter ? (
                        <SelectGroup>
                          <SelectLabel>{selectedCharacter}</SelectLabel>
                          {VOICE_MODELS.filter((model) => model.name === selectedCharacter).flatMap(
                            (model) =>
                              model.styles.map((style) => (
                                <SelectItem key={style.id} value={style.id.toString()}>
                                  {style.name}
                                </SelectItem>
                              ))
                          )}
                        </SelectGroup>
                      ) : (
                        <SelectGroup>
                          <SelectLabel>キャラクターを選択してください</SelectLabel>
                        </SelectGroup>
                      )}
                    </SelectContent>
                  </Select>
                  {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>

                <div className="flex flex-col">
                  <label htmlFor="mode" className="text-start">
                    モード選択
                  </label>
                  <Select value={mode} onValueChange={setMode}>
                    <SelectTrigger id="mode" aria-label="モード選択">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">褒め</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Button
                    variant={isSamplePlaying ? "icon" : "secondary"}
                    isLoading={isSamplePlaying}
                    onClick={sampleStart}
                    leftIcon={<ButtonIcon name="debug-start" />}
                    loadingIcon={<ButtonSpinner />}>
                    サンプルを再生
                  </Button>
                  <Button
                    variant={isSamplePlaying ? "icon" : "primary"}
                    onClick={handleStart}
                    leftIcon={<ButtonIcon name="save-as" />}>
                    保存
                  </Button>
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
