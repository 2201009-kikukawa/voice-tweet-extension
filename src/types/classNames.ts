export enum EventTypes {
  setInterval = "setInterval",
  init = "init",
  messageContent = "MessageContent",
  stopTimer = "stopTimer",
};

export type EventListenerProps = {
  type: EventTypes;
  text: string;
};
