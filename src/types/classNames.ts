export enum EventTypes {
  startTimer = "startTimer",
  initTimer = "initTimer",
  receiveMessage = "receiveMessage",
  stopTimer = "stopTimer",
  choiceSpeaker = "choiceSpeaker",
  openSettingTab = "openSettingTab",
  getImageUris = "getImageUris",
  setImageUris = "setImageUris",
  sampleStart = "sampleStart",
  sampleStop = "sampleStop",
};

export type EventListenerProps = {
  type: EventTypes;
  text: string;
  speakerId: number;
};
