import React from "react";
import { Dialog, DialogContent } from "../../components/Dialog";
import { Slider } from "../../components/Slider";
import { Button, ButtonIcon, ButtonSpinner } from "../../components/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../components/Select";
import type { VoiceModel } from "../../const";

type CharacterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characterName: string;
  imageSrc: string;
  speakerStyle?: string;
  mode: string;
  sliderMinutes: number;
  isSamplePlaying: boolean;
  errorMessage?: string;
  voiceModels: VoiceModel[];
  onSpeakerStyleChange: (value: string) => void;
  onModeChange: (value: string) => void;
  onSliderChange: (value: number) => void;
  onSampleStart: () => void;
  onSave: () => void;
};

const CharacterDialog = ({
  open,
  onOpenChange,
  characterName,
  imageSrc,
  speakerStyle,
  mode,
  sliderMinutes,
  isSamplePlaying,
  errorMessage,
  voiceModels,
  onSpeakerStyleChange,
  onModeChange,
  onSliderChange,
  onSampleStart,
  onSave,
}: CharacterDialogProps) => {
  const selectedVoiceModel = voiceModels.find((model) => model.name === characterName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-8">
        <h1 className="text-center text-2xl font-bold">{characterName}</h1>
        <div className="flex space-x-6">
          <img
            src={imageSrc}
            alt={characterName || "キャラクター"}
            className="w-1/3 h-auto object-cover bg-gray-50"
          />
          <div>
            <div className="flex flex-col">
              <label htmlFor="speaker_style" className="text-start">
                ボイススタイル
              </label>
              <Select
                value={speakerStyle}
                onValueChange={onSpeakerStyleChange}
                disabled={!characterName}>
                <SelectTrigger id="speaker_style" aria-label="ボイススタイル">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {characterName ? (
                    <SelectGroup>
                      <SelectLabel>{characterName}</SelectLabel>
                      {selectedVoiceModel?.styles.map((style) => (
                        <SelectItem key={style.id} value={style.id.toString()}>
                          {style.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ) : (
                    <SelectGroup>
                      <SelectLabel>キャラクターを選択してください</SelectLabel>
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
              {errorMessage && <p className="text-red-500 text-xs mt-1">{errorMessage}</p>}
            </div>

            <div className="flex flex-col mt-4">
              <label htmlFor="mode" className="text-start">
                モード選択
              </label>
              <Select value={mode} onValueChange={onModeChange}>
                <SelectTrigger id="mode" aria-label="モード選択">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">褒め</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-6">
              <p className="mb-4">表示間隔：{sliderMinutes}分</p>
              <Slider
                value={[sliderMinutes]}
                min={1}
                max={60}
                step={1}
                onValueChange={(value) => onSliderChange(value[0])}
              />
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-2 gap-6 mt-4">
                <Button
                  variant={isSamplePlaying ? "icon" : "secondary"}
                  isLoading={isSamplePlaying}
                  onClick={onSampleStart}
                  leftIcon={<ButtonIcon name="debug-start" />}
                  loadingIcon={<ButtonSpinner />}>
                  サンプルを再生
                </Button>
                <Button
                  variant={isSamplePlaying ? "icon" : "primary"}
                  onClick={onSave}
                  leftIcon={<ButtonIcon name="save-as" />}>
                  保存
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { CharacterDialog };
