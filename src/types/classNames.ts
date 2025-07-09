export enum EventTypes {
  startTimer = "startTimer",
  initTimer = "initTimer",
  receiveMessage = "receiveMessage",
  stopTimer = "stopTimer",
  choiceSpeaker = "choiceSpeaker",
};

export type EventListenerProps = {
  type: EventTypes;
  text: string;
  speakerId: number;
};
