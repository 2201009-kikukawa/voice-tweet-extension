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
      <div className="mt-8 flex flex-col items-center gap-4 px-3 text-center md:mt-10 md:px-5">
        <h1 className="text-3xl font-bold tracking-wide md:text-4xl">キャラクターボイス設定</h1>
        <p className="w-full max-w-4xl text-lg text-white/80">
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

      <div className="mt-8 w-full px-3 md:px-5">
        <div className="mx-auto w-full max-w-[min(1360px,100%)] grid gap-7 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
          {Object.entries(imageUris).map(([key, imageUri]) => (
            <Card
              onClick={() => handleCharacterCardClick(key)}
              key={key}
              className="flex h-[360px] flex-col gap-0 rounded-[28px] border-white/15 pb-0 shadow-md transition hover:shadow-xl">
              <CardContent className="h-[280px]">
                <img
                  src={imageUri || ""}
                  alt={key}
                  className="h-full w-full object-cover bg-gray-100"
                />
              </CardContent>
              <CardFooter className="w-full border-t border-white/10 px-5 py-4">
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
