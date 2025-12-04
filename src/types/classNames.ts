export enum EventTypes {
  startTimer = "startTimer",
  initTimer = "initTimer",
  receiveMessage = "receiveMessage",
  stopTimer = "stopTimer",
  choiceSpeaker = "choiceSpeaker",
  openSettingTab = "openSettingTab",
  closeSettingTab = "closeSettingTab",
  getImageUris = "getImageUris",
  setImageUris = "setImageUris",
  sampleStart = "sampleStart",
  sampleStop = "sampleStop",
  resetSettings = "resetSettings",
}

export type EventListenerProps = {
  type: EventTypes;
  text: string;
  speakerId: number;
  payload?: Record<string, unknown>;
};
