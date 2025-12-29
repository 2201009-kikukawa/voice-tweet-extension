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
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-8 text-white">
      <section className="flex flex-col items-center gap-3 text-center md:gap-4">
        <h1 className="text-3xl font-semibold tracking-tight md:text-[2.3rem]">
          キャラクターボイス設定
        </h1>
        <p className="w-full max-w-3xl text-base text-white/80 md:text-lg">
          お気に入りのキャラクターを選んで、コーディングの時間をもっと楽しく彩りましょう。
          <br />
          カードをクリックすると、声のスタイルやモードを自由にカスタマイズできます。
        </p>
      </section>

      <StatusCardSection
        cardState={cardState}
        cardIsRunning={cardIsRunning}
        onPause={cardHandlers.onPause}
        onResume={cardHandlers.onResume}
        onReset={cardHandlers.onReset}
      />

      <section className="w-full">
        <div className="mx-auto grid w-full max-w-5xl gap-5 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
          {Object.entries(imageUris).map(([key, imageUri]) => (
            <Card
              onClick={() => handleCharacterCardClick(key)}
              key={key}
              className="flex h-[300px] flex-col gap-0 rounded-[24px] border-white/10 pb-0 shadow-md transition hover:shadow-xl">
              <CardContent className="h-[220px]">
                <img
                  src={imageUri || ""}
                  alt={key}
                  className="h-full w-full object-cover bg-gray-100"
                />
              </CardContent>
              <CardFooter className="w-full border-t border-white/10 px-4 py-3">
                <p className="text-base font-semibold text-white/90">{key}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

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
    </main>
  );
};

export default Main;

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(React.createElement(Main));
