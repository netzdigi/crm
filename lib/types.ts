export type ClientStatus = "Активен" | "Нов" | "Неактивен";

export interface PipelineBoard {
  id: string;
  name: string;
}

export interface Client {
  id: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  marketingStatus: string;
  status: ClientStatus;
  boardId: string;
  lastContact: string;
  notes: string;
}

export type CommunicationChannel = "email" | "call" | "note";
export type CommunicationDirection = "incoming" | "outgoing";

export interface ClientCommunication {
  id: string;
  channel: CommunicationChannel;
  direction: CommunicationDirection;
  subject: string;
  preview: string;
  time: string;
}
