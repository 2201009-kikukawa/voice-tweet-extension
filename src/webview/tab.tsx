import React from "react";
import ReactDOM from "react-dom/client";
import { Card, CardContent, CardFooter } from "../components/Card";
import { VOICE_MODELS } from "../const";
import { CharacterDialog } from "./components/CharacterDialog";
import { StatusCardSection } from "./components/StatusCardSection";
import { useStatusCardController } from "./hooks/useStatusCardController";

const Main = () => {
  const {
    imageUris,
    cardState,
    cardIsRunning,
    cardHandlers,
    dialogState,
    dialogHandlers,
    handleCharacterCardClick,
  } = useStatusCardController();

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

      <StatusCardSection
        cardState={cardState}
        cardIsRunning={cardIsRunning}
        onPause={cardHandlers.onPause}
        onResume={cardHandlers.onResume}
        onReset={cardHandlers.onReset}
      />

      <div className="mt-8 w-full px-6">
        <div className="mx-auto max-w-6xl grid gap-7 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
          {Object.entries(imageUris).map(([key, imageUri]) => (
            <Card
              onClick={() => handleCharacterCardClick(key)}
              key={key}
              className="flex h-[360px] flex-col rounded-[28px] border-white/15 pb-0 shadow-md transition hover:shadow-xl">
              <CardContent className="h-[280px]">
                <img
                  src={imageUri || ""}
                  alt={key}
                  className="h-full w-full object-cover bg-gray-100"
                />
              </CardContent>
              <CardFooter className="mt-auto w-full border-t border-white/10 px-5 py-4">
                <p className="text-lg font-semibold text-white/90">{key}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <CharacterDialog
        open={dialogState.isOpen}
        onOpenChange={dialogHandlers.onOpenChange}
        characterName={dialogState.characterName}
        imageSrc={dialogState.imageSrc}
        speakerStyle={dialogState.speakerStyle}
        mode={dialogState.mode}
        sliderMinutes={dialogState.sliderMinutes}
        isSamplePlaying={dialogState.isSamplePlaying}
        errorMessage={dialogState.errorMessage}
        voiceModels={VOICE_MODELS}
        onSpeakerStyleChange={dialogHandlers.onSpeakerStyleChange}
        onModeChange={dialogHandlers.onModeChange}
        onSliderChange={dialogHandlers.onSliderChange}
        onSampleStart={dialogHandlers.onSampleStart}
        onSave={dialogHandlers.onSave}
      />
    </>
  );
};

export default Main;

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(React.createElement(Main));
