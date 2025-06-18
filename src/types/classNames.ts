export enum EventTypes {
  startTimer = "startTimer",
  initTimer = "initTimer",
  receiveMessage = "receiveMessage",
  stopTimer = "stopTimer",
};

export type EventListenerProps = {
  type: EventTypes;
  text: string;
};
